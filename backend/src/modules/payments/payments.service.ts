import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";

export async function list(req: Request) { return prisma.$queryRawUnsafe("select * from payments where ($1::uuid is null or branch_id=$1::uuid) order by created_at desc", req.user?.role === "admin" ? req.user.branch_id : req.query.branch_id === "all" ? null : req.query.branch_id ?? null); }
export async function create(req: Request) {
  const total = Number(req.body.cash_amount) + Number(req.body.card_amount) + Number(req.body.qr_amount) + Number(req.body.balance_amount);
  if (total <= 0) throw new ApiError(400, "Payment amount must be positive");
  const receivedAmount = req.body.received_amount === undefined ? null : Number(req.body.received_amount);
  const changeAmount = Number(req.body.change_amount ?? 0);
  if (receivedAmount !== null && receivedAmount < Number(req.body.cash_amount ?? 0)) throw new ApiError(400, "Received amount cannot be less than cash amount");
  const branchId = req.user?.role === "admin" ? req.user.branch_id : req.body.branch_id;
  const rows = await prisma.$queryRawUnsafe<any[]>("insert into payments(branch_id,session_id,sale_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,received_amount,change_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11,$12,$13::uuid) returning *", branchId, req.body.session_id ?? null, req.body.sale_id ?? null, req.body.customer_id ?? null, total, req.body.method, req.body.cash_amount, req.body.card_amount, req.body.qr_amount, req.body.balance_amount, receivedAmount, changeAmount, req.user!.user_id);
  if (req.body.session_id) await prisma.$executeRawUnsafe("update sessions set paid_amount=paid_amount+$1, debt_amount=greatest(total_amount-paid_amount-$1,0), status=case when greatest(total_amount-paid_amount-$1,0)=0 and status='unpaid' then 'stopped' else status end where id=$2::uuid", total, req.body.session_id);
  await auditLog({ actor: req.user, branch_id: branchId, action_type: "payment_created", entity_type: "payment", entity_id: rows[0].id, session_id: req.body.session_id ?? null, amount: total, details: { method: req.body.method, cash_amount: Number(req.body.cash_amount ?? 0), card_amount: Number(req.body.card_amount ?? 0), balance_amount: Number(req.body.balance_amount ?? 0), received_amount: receivedAmount, change_amount: changeAmount } });
  broadcastDashboard("payment_created", rows[0], branchId);
  return rows[0];
}
