import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";

function sanitizeUser<T extends Record<string, unknown>>(user: T) {
  const { password_hash: _passwordHash, passwordHash: _passwordHashCamel, ...safeUser } = user;
  return safeUser;
}

function scopedBranch(req: Request) {
  return req.user?.role === "admin" ? req.user.branch_id : null;
}

export const usersService = {
  async list(req: Request) {
    const branchId = scopedBranch(req);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id,name,email,role,branch_id,is_active,created_at,updated_at
       from users
       where ($1::uuid is null or branch_id=$1::uuid)
       order by created_at desc
       limit 200`,
      branchId,
    );
    return rows;
  },

  async get(req: Request, id: string) {
    const branchId = scopedBranch(req);
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `select id,name,email,role,branch_id,is_active,created_at,updated_at
       from users
       where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid)
       limit 1`,
      id,
      branchId,
    );
    if (!rows.length) throw new ApiError(404, "user not found");
    return rows[0];
  },

  async create(req: Request) {
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `insert into users(name,email,password_hash,role,branch_id,is_active)
       values($1,$2,$3,$4,$5::uuid,coalesce($6,true))
       returning *`,
      req.body.name,
      req.body.email,
      req.body.password_hash,
      req.body.role,
      req.body.branch_id ?? null,
      req.body.is_active ?? true,
    );
    const user = sanitizeUser(rows[0]);
    await auditLog({ actor: req.user, branch_id: String(user.branch_id ?? "") || null, action_type: "user_created", entity_type: "user", entity_id: String(user.id) });
    return user;
  },

  async update(req: Request, id: string) {
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
      req.body.name ?? null,
      req.body.email ?? null,
      req.body.password_hash ?? null,
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
    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>("delete from users where id=$1::uuid returning *", id);
    if (!rows.length) throw new ApiError(404, "user not found");
    const user = sanitizeUser(rows[0]);
    await auditLog({ actor: req.user, branch_id: String(user.branch_id ?? "") || null, action_type: "user_deleted", entity_type: "user", entity_id: id });
    return user;
  },
};
