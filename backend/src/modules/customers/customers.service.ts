import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { requireOpenShiftOwner } from "../shifts/shift.guard";
import { createGenericService } from "../_shared/generic.service";

const TOPUP_METHODS = ["cash", "card", "qr"] as const;
const baseCustomersService = createGenericService({ table: "customers", entity: "customer", branchScoped: true, writableColumns: ["branch_id","name","phone","balance","total_spent","sessions_count","last_visit_at","status"] });

function branchFilter(req: Request) {
  if (baseRole(req.user?.role) === "admin") return { where: "branch_id=$1::uuid", values: [(req.user?.branch_id ?? null)] as unknown[] };
  const branchId = req.query.branch_id;
  if (!branchId || branchId === "all") return { where: "1=1", values: [] as unknown[] };
  return { where: "branch_id=$1::uuid", values: [branchId] as unknown[] };
}

export const customersService = {
  ...baseCustomersService,
  async list(req: Request) {
    const scoped = branchFilter(req);
    const q = String(req.query.q ?? "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit ?? 200) || 200, 1), 200);
    const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);
    const values = [...scoped.values];
    let where = scoped.where;
    if (q) {
      values.push(`%${q.toLowerCase()}%`);
      const qParam = `$${values.length}`;
      where = `(${where}) and (lower(name) like ${qParam} or lower(coalesce(phone,'')) like ${qParam})`;
    }
    values.push(limit, offset);
    return prisma.$queryRawUnsafe(
      `select * from customers where ${where} order by name asc, created_at desc limit $${values.length - 1} offset $${values.length}`,
      ...values,
    );
  },
};
export async function customerSessions(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where customer_id=$1::uuid order by created_at desc", req.params.id); }
export async function customerSales(req: Request) { return prisma.$queryRawUnsafe("select * from sales where customer_id=$1::uuid order by created_at desc", req.params.id); }

export async function topUpBalance(req: Request) {
  const amount = Math.round(Number(req.body.amount));
  const method = String(req.body.method ?? "");
  if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, "Summa musbat bo'lishi kerak");
  if (!(TOPUP_METHODS as readonly string[]).includes(method)) throw new ApiError(400, "Noto'g'ri to'lov usuli");
  // get() mijozni filial bo'yicha tekshiradi (yo'q bo'lsa 404) va branch_id ni qaytaradi.
  const customer = (await customersService.get(req, String(req.params.id))) as { id: string; branch_id: string };
  const branchId = String(customer.branch_id);
  const shiftId = await requireOpenShiftOwner(branchId, req);
  const cashAmount = method === "cash" ? amount : 0;
  const cardAmount = method === "card" ? amount : 0;
  const qrAmount = method === "qr" ? amount : 0;
  const payment = (await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `insert into payments(branch_id,shift_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,received_amount,paid_by_admin_id)
     values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,0,$9,$10::uuid) returning *`,
    branchId, shiftId, customer.id, amount, method, cashAmount, cardAmount, qrAmount, method === "cash" ? amount : null, req.user!.user_id,
  ))[0];
  const updated = (await prisma.$queryRawUnsafe<Array<{ balance: unknown }>>(
    "update customers set balance=balance+$1, updated_at=now() where id=$2::uuid returning *",
    amount, customer.id,
  ))[0];
  await auditLog({ actor: req.user, branch_id: branchId, action_type: "customer_balance_topup", entity_type: "customer", entity_id: customer.id, amount, details: { method, payment_id: payment.id, balance_after: Number(updated.balance) } });
  broadcastDashboard("payment_created", payment, branchId);
  return updated;
}

// "balance" usulida to'langanda mijoz balansidan pulni ayiradi.
// Yetarli mablag' bo'lmasa yoki mijoz topilmasa xato tashlaydi — chaqiruvchi sessiya/sotuvni yaratishdan OLDIN chaqirishi kerak.
export async function debitCustomerBalance(customerId: string | null | undefined, branchId: string, amount: number) {
  if (!(amount > 0)) return;
  if (!customerId) throw new ApiError(400, "Balansdan to'lov uchun mijoz tanlanishi shart");
  const rows = await prisma.$queryRawUnsafe<Array<{ balance: unknown }>>(
    "select balance from customers where id=$1::uuid and branch_id=$2::uuid",
    customerId, branchId,
  );
  if (!rows.length) throw new ApiError(404, "Mijoz topilmadi");
  if (Number(rows[0].balance) < amount) throw new ApiError(409, "Mijoz balansida mablag' yetarli emas");
  await prisma.$executeRawUnsafe("update customers set balance=balance-$1, updated_at=now() where id=$2::uuid", amount, customerId);
}
