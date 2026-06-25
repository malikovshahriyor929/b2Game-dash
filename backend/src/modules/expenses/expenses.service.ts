import { Request } from "express";
import { baseRole } from "../../types/auth.types";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { requireOpenShift } from "../shifts/shift.guard";
import { actorScope } from "../../utils/scope";

function branchId(req: Request) {
  const value = baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.body.branch_id ?? req.query.branch_id;
  return value === "all" ? null : value;
}

export async function list(req: Request) {
  const s = actorScope(req);
  return prisma.$queryRawUnsafe(
    `select e.*, u.name as spent_by_name
       from expenses e
       left join users u on u.id = e.spent_by
      where ($1::uuid is null or e.branch_id=$1::uuid)
        and ($2::uuid is null or e.spent_by=$2::uuid)
      order by e.created_at desc`,
    s.branch,
    s.actor,
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
  const shiftId = await requireOpenShift(branch);

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

  await auditLog({
    actor: req.user,
    branch_id: branch,
    action_type: "expense_created",
    entity_type: "expense",
    entity_id: row.id,
    amount,
    details: { method, source, note: req.body.note ?? null },
  });
  broadcastDashboard("expense_created", row, branch);
  return row;
}
