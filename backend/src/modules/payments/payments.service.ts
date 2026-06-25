import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { requireOpenShift } from "../shifts/shift.guard";
import { debitCustomerBalance } from "../customers/customers.service";
import { actorScope } from "../../utils/scope";

export async function list(req: Request) { const s = actorScope(req); return prisma.$queryRawUnsafe("select p.*, u.name as paid_by_admin_name from payments p left join users u on u.id = p.paid_by_admin_id where ($1::uuid is null or p.branch_id=$1::uuid) and ($2::uuid is null or p.paid_by_admin_id=$2::uuid) order by p.created_at desc", s.branch, s.actor); }
export async function create(req: Request) {
  const total = Number(req.body.cash_amount) + Number(req.body.card_amount) + Number(req.body.qr_amount) + Number(req.body.balance_amount);
  if (total <= 0) throw new ApiError(400, "Payment amount must be positive");
  const receivedAmount = req.body.received_amount === undefined ? null : Number(req.body.received_amount);
  const changeAmount = Number(req.body.change_amount ?? 0);
  if (receivedAmount !== null && receivedAmount < Number(req.body.cash_amount ?? 0)) throw new ApiError(400, "Received amount cannot be less than cash amount");
  const branchId = baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.body.branch_id;
  const shiftId = await requireOpenShift(branchId);
  // "balance" qismi bo'lsa — to'lov yozishdan oldin mijoz balansidan ayiramiz (mablag' yetmasa to'xtaydi).
  const balanceAmount = Number(req.body.balance_amount ?? 0);
  if (balanceAmount > 0) await debitCustomerBalance(req.body.customer_id ?? null, branchId, balanceAmount);
  const rows = await prisma.$queryRawUnsafe<any[]>("insert into payments(branch_id,shift_id,session_id,sale_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,received_amount,change_amount,paid_by_admin_id,source_type,source_note) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6,$7,$8,$9,$10,$11,$12,$13,$14::uuid,$15,$16) returning *", branchId, shiftId, req.body.session_id ?? null, req.body.sale_id ?? null, req.body.customer_id ?? null, total, req.body.method, req.body.cash_amount, req.body.card_amount, req.body.qr_amount, req.body.balance_amount, receivedAmount, changeAmount, req.user!.user_id, req.body.source_type ?? "payment", req.body.source_note ?? null);
  if (req.body.session_id) await prisma.$executeRawUnsafe("update sessions set paid_amount=paid_amount+$1, debt_amount=greatest(total_amount-paid_amount-$1,0), status=case when greatest(total_amount-paid_amount-$1,0)=0 and status='unpaid' then 'stopped' else status end where id=$2::uuid", total, req.body.session_id);
  await auditLog({ actor: req.user, branch_id: branchId, action_type: "payment_created", entity_type: "payment", entity_id: rows[0].id, session_id: req.body.session_id ?? null, amount: total, details: { method: req.body.method, cash_amount: Number(req.body.cash_amount ?? 0), card_amount: Number(req.body.card_amount ?? 0), balance_amount: Number(req.body.balance_amount ?? 0), received_amount: receivedAmount, change_amount: changeAmount } });
  broadcastDashboard("payment_created", rows[0], branchId);
  return rows[0];
}

function paymentParts(body: any) {
  const cash = Number(body.cash_amount ?? 0);
  const card = Number(body.card_amount ?? 0);
  const qr = Number(body.qr_amount ?? 0);
  const amount = cash + card + qr;
  return { cash, card, qr, amount };
}

export async function payAdminPenalty(req: Request) {
  if (baseRole(req.user?.role) !== "super_admin") throw new ApiError(403, "Super Admin required");
  const admin = (await prisma.$queryRawUnsafe<any[]>("select id,name,branch_id from users where id=$1::uuid limit 1", req.params.adminId))[0];
  if (!admin) throw new ApiError(404, "Admin not found");
  if (!admin.branch_id) throw new ApiError(400, "Admin branch not found");

  const chargedRows = await prisma.$queryRawUnsafe<Array<{ total: unknown }>>(
    `select coalesce(sum(
       case
         when rr.duration_minutes > 1440 then round(rr.charge_amount * 1440 / nullif(rr.duration_minutes, 0))
         else rr.charge_amount
       end
     ),0) as total
     from repair_requests rr
     where rr.requested_by=$1::uuid and rr.review_status='charged'`,
    admin.id,
  );
  const paidRows = await prisma.$queryRawUnsafe<Array<{ total: unknown }>>(
    "select coalesce(sum(amount),0) as total from admin_penalty_payments where admin_id=$1::uuid",
    admin.id,
  );
  const outstanding = Math.max(0, Number(chargedRows[0]?.total ?? 0) - Number(paidRows[0]?.total ?? 0));
  const { cash, card, qr, amount } = paymentParts(req.body);
  if (!(amount > 0)) throw new ApiError(400, "Payment amount must be positive");
  if (amount > outstanding) throw new ApiError(400, "Payment exceeds admin penalty debt");
  const receivedAmount = req.body.received_amount === undefined ? null : Number(req.body.received_amount);
  const changeAmount = Number(req.body.change_amount ?? 0);
  if (receivedAmount !== null && receivedAmount < cash) throw new ApiError(400, "Received amount cannot be less than cash amount");
  const method = String(req.body.method ?? "cash");
  const shiftId = await requireOpenShift(admin.branch_id);
  const note = req.body.note ?? `Admin jarima to'lovi: ${admin.name}`;

  const penaltyPayment = (await prisma.$queryRawUnsafe<any[]>(
    `insert into admin_penalty_payments(branch_id,shift_id,admin_id,amount,method,cash_amount,card_amount,qr_amount,received_amount,change_amount,recorded_by,note)
     values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11::uuid,$12)
     returning *`,
    admin.branch_id,
    shiftId,
    admin.id,
    amount,
    method,
    cash,
    card,
    qr,
    receivedAmount,
    changeAmount,
    req.user!.user_id,
    note,
  ))[0];

  const payment = (await prisma.$queryRawUnsafe<any[]>(
    `insert into payments(branch_id,shift_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,received_amount,change_amount,paid_by_admin_id,source_type,source_note)
     values($1::uuid,$2::uuid,$3,$4,$5,$6,$7,0,$8,$9,$10::uuid,'penalty',$11)
     returning *`,
    admin.branch_id,
    shiftId,
    amount,
    method,
    cash,
    card,
    qr,
    receivedAmount,
    changeAmount,
    req.user!.user_id,
    note,
  ))[0];

  await auditLog({
    actor: req.user,
    branch_id: admin.branch_id,
    action_type: "admin_penalty_paid",
    entity_type: "admin_penalty_payment",
    entity_id: penaltyPayment.id,
    amount,
    details: { admin_id: admin.id, admin_name: admin.name, method, payment_id: payment.id },
  });
  broadcastDashboard("admin_penalty_paid", penaltyPayment, admin.branch_id);
  return { ...penaltyPayment, payment_id: payment.id, remaining_penalty: Math.max(0, outstanding - amount) };
}
