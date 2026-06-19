import { Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { baseRole, isDevRole } from "../../types/auth.types";

function sanitizeUser<T extends Record<string, unknown>>(user: T) {
  const { password_hash: _passwordHash, passwordHash: _passwordHashCamel, ...safeUser } = user;
  return safeUser;
}

// Accept a plaintext `password` from the client and hash it; fall back to a pre-hashed
// `password_hash`. Returns null when neither is set (e.g. update that keeps the password).
async function resolvePasswordHash(body: Record<string, any>) {
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");
    return bcrypt.hash(body.password, 10);
  }
  return typeof body.password_hash === "string" && body.password_hash ? body.password_hash : null;
}

function scopedBranch(req: Request) {
  // admin and dev_admin only see their own branch; (dev_)super_admin sees everything.
  return baseRole(req.user?.role) === "admin" ? req.user?.branch_id ?? null : null;
}

function isDev(req: Request) {
  return isDevRole(req.user?.role);
}

// Developer accounts (dev_admin / dev_super_admin) are fully hidden from regular
// admins/super_admins. Block any attempt by a non-dev to read or mutate a developer row
// by pretending the row does not exist.
async function assertManageable(req: Request, id: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ role: string }>>("select role from users where id=$1::uuid limit 1", id);
  if (!rows.length) throw new ApiError(404, "user not found");
  if (isDevRole(rows[0].role) && !isDev(req)) throw new ApiError(404, "user not found");
}

export const usersService = {
  async list(req: Request) {
    const branchId = scopedBranch(req);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select u.id,u.name,u.email,u.role,u.branch_id,u.is_active,u.created_at,u.updated_at,
              coalesce((select sum(rr.charge_amount) from repair_requests rr
                        where rr.requested_by=u.id and rr.review_status='charged'),0) as penalty_total
       from users u
       where ($1::uuid is null or u.branch_id=$1::uuid)
         and ($2::boolean or u.role not in ('dev_admin','dev_super_admin'))
       order by u.created_at desc
       limit 200`,
      branchId,
      isDev(req),
    );
    return rows;
  },

  async get(req: Request, id: string) {
    const branchId = scopedBranch(req);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id,name,email,role,branch_id,is_active,created_at,updated_at
       from users
       where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid)
         and ($3::boolean or role not in ('dev_admin','dev_super_admin'))
       limit 1`,
      id,
      branchId,
      isDev(req),
    );
    if (!rows.length) throw new ApiError(404, "user not found");
    return rows[0];
  },

  async create(req: Request) {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    // Only a developer may create a developer account; everyone else is capped at super_admin.
    if (isDevRole(req.body.role) && !isDev(req)) throw new ApiError(403, "Insufficient role");
    const role =
      req.body.role === "dev_super_admin" ? "dev_super_admin"
      : req.body.role === "dev_admin" ? "dev_admin"
      : req.body.role === "super_admin" ? "super_admin"
      : "admin";
    if (!name) throw new ApiError(400, "Name is required");
    if (!email) throw new ApiError(400, "Email is required");
    const passwordHash = await resolvePasswordHash(req.body);
    if (!passwordHash) throw new ApiError(400, "Password is required");
    // Branch-scoped roles (admin, dev_admin) need a branch; global roles are branch null.
    const needsBranch = baseRole(role) === "admin";
    const branchId = needsBranch ? (req.body.branch_id ?? null) : null;
    if (needsBranch && !branchId) throw new ApiError(400, "Admin needs an assigned branch");

    const exists = await prisma.$queryRawUnsafe<Record<string, unknown>[]>("select id from users where email=$1 limit 1", email);
    if (exists.length) throw new ApiError(409, "Email already in use");

    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `insert into users(name,email,password_hash,role,branch_id,is_active)
       values($1,$2,$3,$4,$5::uuid,coalesce($6,true))
       returning *`,
      name,
      email,
      passwordHash,
      role,
      branchId,
      req.body.is_active ?? true,
    );
    const user = sanitizeUser(rows[0]);
    await auditLog({ actor: req.user, branch_id: String(user.branch_id ?? "") || null, action_type: "user_created", entity_type: "user", entity_id: String(user.id) });
    return user;
  },

  async update(req: Request, id: string) {
    await assertManageable(req, id);
    // A non-dev cannot promote anyone into a hidden developer role.
    if (isDevRole(req.body.role) && !isDev(req)) throw new ApiError(403, "Insufficient role");
    const passwordHash = await resolvePasswordHash(req.body);
    const email = req.body.email == null ? null : String(req.body.email).trim().toLowerCase();
    if (email) {
      const exists = await prisma.$queryRawUnsafe<Record<string, unknown>[]>("select id from users where email=$1 and id<>$2::uuid limit 1", email, id);
      if (exists.length) throw new ApiError(409, "Email already in use");
    }
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `update users set
         name=coalesce($1,name),
         email=coalesce($2,email),
         password_hash=coalesce($3,password_hash),
         role=coalesce($4,role),
         branch_id=coalesce($5::uuid,branch_id),
         is_active=coalesce($6,is_active),
         updated_at=now()
       where id=$7::uuid
       returning *`,
      req.body.name == null ? null : String(req.body.name).trim(),
      email,
      passwordHash,
      req.body.role ?? null,
      req.body.branch_id ?? null,
      req.body.is_active ?? null,
      id,
    );
    if (!rows.length) throw new ApiError(404, "user not found");
    const user = sanitizeUser(rows[0]);
    await auditLog({ actor: req.user, branch_id: String(user.branch_id ?? "") || null, action_type: "user_updated", entity_type: "user", entity_id: id });
    return user;
  },

  async remove(req: Request, id: string) {
    if (req.user?.user_id === id) throw new ApiError(400, "You cannot delete your own account");
    await assertManageable(req, id);
    // Remove this admin's simulator assignments before deleting them.
    await prisma.$executeRawUnsafe("delete from simulator_admins where admin_id=$1::uuid", id);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>("delete from users where id=$1::uuid returning *", id);
    if (!rows.length) throw new ApiError(404, "user not found");
    const user = sanitizeUser(rows[0]);
    await auditLog({ actor: req.user, branch_id: String(user.branch_id ?? "") || null, action_type: "user_deleted", entity_type: "user", entity_id: id });
    return user;
  },
};
