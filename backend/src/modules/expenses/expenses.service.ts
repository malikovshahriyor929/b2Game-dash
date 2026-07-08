import { Request } from "express";
import { baseRole } from "../../types/auth.types";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { requireOpenShiftOwner } from "../shifts/shift.guard";
import { actorScope } from "../../utils/scope";

function branchId(req: Request) {
  const value = baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.body.branch_id ?? req.query.branch_id;
  return value == null || value === "all" ? null : value;
}

export async function list(req: Request) {
  const s = actorScope(req);
  return prisma.$queryRawUnsafe(
    `select e.*, u.name as spent_by_name, d.id as deduction_id, d.type as deduction_type, d.status as deduction_status
       from expenses e
       left join users u on u.id = e.spent_by
       left join admin_deductions d on d.expense_id = e.id
      where ($1::uuid is null or e.branch_id=$1::uuid)
        and ($2::uuid is null or e.spent_by=$2::uuid)
      order by e.created_at desc`,
    s.branch,
    s.actor,
  );
}

export async function listAdminDeductions(req: Request) {
  if (baseRole(req.user?.role) !== "super_admin") throw new ApiError(403, "Super Admin required");
  const branch = branchId(req);
  const type = req.query.type && req.query.type !== "all" ? String(req.query.type) : null;
  return prisma.$queryRawUnsafe(
    `select d.*, u.name as admin_name, u.email as admin_email, b.name as branch_name,
            cb.name as created_by_name, e.source as expense_source
       from admin_deductions d
       join users u on u.id = d.admin_id
       left join branches b on b.id = d.branch_id
       left join users cb on cb.id = d.created_by
       left join expenses e on e.id = d.expense_id
      where ($1::uuid is null or d.branch_id=$1::uuid)
        and ($2::text is null or d.type=$2)
      order by d.created_at desc
      limit 500`,
    branch,
    type,
  );
}

export async function create(req: Request) {
  const branch = branchId(req);
  if (!branch) throw new ApiError(400, "branch_id is required");
  const amount = Math.round(Number(req.body.amount ?? 0));
  if (!(amount > 0)) throw new ApiError(400, "amount must be positive");
  const source = String(req.body.source ?? "").trim();
  if (!source) throw new ApiError(400, "source is required");
  const method = String(req.body.method ?? "cash");
  const shiftId = await requireOpenShiftOwner(branch, req);
  const deductionType = req.body.deduction_type ? String(req.body.deduction_type) : null;
  const deductionAdminId = req.body.admin_id ? String(req.body.admin_id) : req.user!.user_id;
  if (deductionType) {
    const allowed = ["salary_advance", "personal_cash", "fine", "damage", "shortage", "other"];
    if (!allowed.includes(deductionType)) throw new ApiError(400, "invalid deduction_type");
    const admin = (await prisma.$queryRawUnsafe<any[]>(
      "select id,branch_id,role from users where id=$1::uuid limit 1",
      deductionAdminId,
    ))[0];
    if (!admin) throw new ApiError(404, "Admin not found");
    if (admin.branch_id !== branch) throw new ApiError(400, "Admin belongs to another branch");
    if (baseRole(req.user?.role) === "admin" && deductionAdminId !== req.user?.user_id) throw new ApiError(403, "Admin can only deduct own salary");
  }

  const row = (await prisma.$queryRawUnsafe<any[]>(
    `insert into expenses(branch_id,shift_id,amount,method,source,note,spent_by)
     values($1::uuid,$2::uuid,$3,$4,$5,$6,$7::uuid)
     returning *`,
    branch,
    shiftId,
    amount,
    method,
    source,
    req.body.note ?? null,
    req.user!.user_id,
  ))[0];

  let deduction = null;
  if (deductionType) {
    deduction = (await prisma.$queryRawUnsafe<any[]>(
      `insert into admin_deductions(branch_id,shift_id,admin_id,expense_id,type,amount,note,created_by)
       values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8::uuid)
       returning *`,
      branch,
      shiftId,
      deductionAdminId,
      row.id,
      deductionType,
      amount,
      req.body.note ?? source,
      req.user!.user_id,
    ))[0];
  }

  await auditLog({
    actor: req.user,
    branch_id: branch,
    action_type: deductionType ? "admin_deduction_created" : "expense_created",
    entity_type: "expense",
    entity_id: row.id,
    amount,
    details: { method, source, note: req.body.note ?? null, deduction_type: deductionType, admin_id: deductionAdminId },
  });
  broadcastDashboard(deductionType ? "admin_deduction_created" : "expense_created", { ...row, deduction }, branch);
  return { ...row, deduction };
}
