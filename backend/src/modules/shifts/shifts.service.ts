import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";

const WITHDRAW_RECIPIENT = "Owner";

function branchId(req: Request) {
  return baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.body.branch_id ?? req.query.branch_id;
}

function assertBranchAccess(req: Request, branch: string) {
  if (baseRole(req.user?.role) === "admin" && (req.user?.branch_id ?? null) !== branch) {
    throw new ApiError(403, "Shift belongs to another branch");
  }
}

async function computeShiftMoney(shiftId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ cash: string; card: string; bank: string; balance: string }>>(
    `select
       coalesce(sum(cash_amount),0)    as cash,
       coalesce(sum(card_amount),0)    as card,
       coalesce(sum(qr_amount),0)      as bank,
       coalesce(sum(balance_amount),0) as balance
     from payments
     where shift_id=$1::uuid`,
    shiftId,
  );
  const r = rows[0] ?? { cash: "0", card: "0", bank: "0", balance: "0" };
  const cash = Number(r.cash);
  const card = Number(r.card);
  const bank = Number(r.bank);
  const balance = Number(r.balance);
  return { cash, card, bank, balance, total: cash + card + bank };
}

// Smena davomida tasdiqlangan naqd выemka (inkassatsiya) yig'indisi — kassadan olib chiqilgan.
async function confirmedWithdrawnCash(shiftId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ total: string }>>(
    "select coalesce(sum(amount),0) as total from cash_withdrawal_requests where shift_id=$1::uuid and status='confirmed'",
    shiftId,
  );
  return Number(rows[0]?.total ?? 0);
}

async function computeShiftExpenses(shiftId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ cash: string; card: string; bank: string; total: string }>>(
    `select
       coalesce(sum(case when method='cash' then amount else 0 end),0) as cash,
       coalesce(sum(case when method='card' then amount else 0 end),0) as card,
       coalesce(sum(case when method='qr' then amount else 0 end),0) as bank,
       coalesce(sum(amount),0) as total
     from expenses
     where shift_id=$1::uuid`,
    shiftId,
  );
  const r = rows[0] ?? { cash: "0", card: "0", bank: "0", total: "0" };
  return { cash: Number(r.cash), card: Number(r.card), bank: Number(r.bank), total: Number(r.total) };
}

// Smena qatoriga jonli hisoblangan pul ko'rsatkichlarini qo'shadi (ochiq smena uchun).
// withdrawnCash — smena davomida tasdiqlangan выemka (kassadan olib chiqilgan naqd).
function decorateOpenShift(shift: any, money: { cash: number; card: number; bank: number; balance: number; total: number }, withdrawnCash = 0, expenses = { cash: 0, total: 0 }) {
  const startingCash = Number(shift.starting_cash ?? 0);
  return {
    ...shift,
    cash_sales: money.cash,
    card_total: money.card,
    qr_total: money.bank,
    balance_sales: money.balance,
    total_revenue: money.total,
    refunds: expenses.total,
    cash_withdrawn: withdrawnCash, // smena ichida olib chiqilgan naqd (выemka)
    expected_cash: startingCash + money.cash - expenses.cash - withdrawnCash, // kassada bo'lishi kerak bo'lgan naqd
  };
}

export async function list(req: Request) {
  const branch = baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.query.branch_id === "all" ? null : req.query.branch_id ?? null;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select s.*, uo.name as opened_by_name, uc.name as closed_by_name
     from shifts s
     left join users uo on uo.id = s.opened_by
     left join users uc on uc.id = s.closed_by
     where ($1::uuid is null or s.branch_id=$1::uuid)
     order by s.opened_at desc limit 200`,
    branch,
  );
  // Ochiq smenalar uchun pul ko'rsatkichlarini jonli hisoblab qo'shamiz (yopilgani snapshot).
  const result: any[] = [];
  for (const row of rows) {
    if (row.status === "open") {
      const money = await computeShiftMoney(row.id);
      result.push(decorateOpenShift(row, money, await confirmedWithdrawnCash(row.id), await computeShiftExpenses(row.id)));
    } else {
      result.push(row);
    }
  }
  return result;
}

export async function current(req: Request) {
  const branch = branchId(req);
  const rows = await prisma.$queryRawUnsafe<any[]>("select * from shifts where branch_id=$1::uuid and status='open' limit 1", branch);
  const shift = rows[0];
  if (!shift) return null;
  const money = await computeShiftMoney(shift.id);
  return decorateOpenShift(shift, money, await confirmedWithdrawnCash(shift.id), await computeShiftExpenses(shift.id));
}

// Yangi smena ochishdan oldingi ma'lumot: oldingi smena qoldirgan naqd (carry-over).
export async function openInfo(req: Request) {
  const branch = branchId(req);
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "select id, remaining_cash, closed_at, closed_by from shifts where branch_id=$1::uuid and status='closed' order by closed_at desc nulls last limit 1",
    branch,
  );
  const previous = rows[0];
  return {
    previous_remaining_cash: previous ? Number(previous.remaining_cash) : 0,
    previous_shift_id: previous?.id ?? null,
  };
}

export async function open(req: Request) {
  const branch = branchId(req);
  if (!branch) throw new ApiError(400, "branch_id is required");
  const exists = await prisma.$queryRawUnsafe<any[]>("select id from shifts where branch_id=$1::uuid and status='open'", branch);
  if (exists.length) throw new ApiError(409, "Branch already has open shift");
  const startingCash = Number(req.body.starting_cash ?? 0);
  const row = (
    await prisma.$queryRawUnsafe<any[]>(
      "insert into shifts(branch_id,opened_by,shift_type,starting_cash,expected_cash,status) values($1::uuid,$2::uuid,$3,$4,$4,'open') returning *",
      branch,
      req.user!.user_id,
      req.body.shift_type ?? null,
      startingCash,
    )
  )[0];
  await auditLog({ actor: req.user, branch_id: branch, action_type: "shift_opened", entity_type: "shift", entity_id: row.id, details: { starting_cash: startingCash, shift_type: req.body.shift_type ?? null } });
  broadcastDashboard("shift_opened", row, branch);
  return row;
}

export async function close(req: Request) {
  const shift = (await prisma.$queryRawUnsafe<any[]>("select * from shifts where id=$1::uuid", req.params.id))[0];
  if (!shift) throw new ApiError(404, "Shift not found");
  assertBranchAccess(req, shift.branch_id);
  if (shift.status === "closed") throw new ApiError(409, "Shift already closed");

  const branch = shift.branch_id;
  const money = await computeShiftMoney(shift.id);
  const expenses = await computeShiftExpenses(shift.id);

  const startingCash = Number(shift.starting_cash ?? 0);
  const midShiftWithdrawn = await confirmedWithdrawnCash(shift.id); // smena ichida olib chiqilgan naqd (выemka)
  const expectedCash = startingCash + money.cash - expenses.cash - midShiftWithdrawn; // kassada bo'lishi kerak bo'lgan naqd
  const actualCash = req.body.actual_cash == null ? expectedCash : Number(req.body.actual_cash);
  const cashWithdrawn = Math.max(0, Number(req.body.cash_withdrawn ?? 0));
  if (cashWithdrawn > expectedCash) throw new ApiError(400, "Cash withdrawn exceeds expected cash");
  // Karta va Bank — to'liq avtomat yechiladi (boshliqqa).
  const cardWithdrawn = money.card;
  const bankWithdrawn = money.bank;
  const remainingCash = expectedCash - cashWithdrawn; // keyingi smenaga o'tadigan naqd
  const difference = actualCash - expectedCash;
  const recipient = req.body.recipient ?? WITHDRAW_RECIPIENT;

  const row = (
    await prisma.$queryRawUnsafe<any[]>(
      `update shifts set
         status='closed',
         closed_by=$1::uuid,
         cash_sales=$2,
         card_total=$3,
         qr_total=$4,
         balance_sales=$5,
         total_revenue=$6,
         refunds=$7,
         expected_cash=$8,
         actual_cash=$9,
         cash_withdrawn=$10,
         card_withdrawn=$11,
         bank_withdrawn=$12,
         remaining_cash=$13,
         withdraw_recipient=$14,
         difference=$15,
         notes=$16,
         closed_at=now(),
         updated_at=now()
       where id=$17::uuid returning *`,
      req.user!.user_id,
      money.cash,
      money.card,
      money.bank,
      money.balance,
      money.total,
      expenses.total,
      expectedCash,
      actualCash,
      cashWithdrawn,
      cardWithdrawn,
      bankWithdrawn,
      remainingCash,
      recipient,
      difference,
      req.body.notes ?? null,
      shift.id,
    )
  )[0];

  // Pul yechish jurnaliga yozuvlar (adminga ko'rinadigan ro'yxat).
  const withdrawals: Array<{ source: string; amount: number }> = [
    { source: "cash", amount: cashWithdrawn },
    { source: "card", amount: cardWithdrawn },
    { source: "bank", amount: bankWithdrawn },
  ].filter((w) => w.amount > 0);
  for (const w of withdrawals) {
    await prisma.$executeRawUnsafe(
      "insert into shift_withdrawals(shift_id,branch_id,source,amount,recipient,note,withdrawn_by) values($1::uuid,$2::uuid,$3,$4,$5,$6,$7::uuid)",
      shift.id,
      branch,
      w.source,
      w.amount,
      recipient,
      req.body.notes ?? null,
      req.user!.user_id,
    );
  }

  await auditLog({
    actor: req.user,
    branch_id: branch,
    action_type: "shift_closed",
    entity_type: "shift",
    entity_id: shift.id,
    amount: money.total,
    details: { cash: money.cash, card: money.card, bank: money.bank, balance: money.balance, expenses: expenses.total, cash_expenses: expenses.cash, cash_withdrawn: cashWithdrawn, remaining_cash: remainingCash, difference, recipient },
  });
  broadcastDashboard("shift_closed", row, branch);
  return row;
}

export async function withdrawals(req: Request) {
  const branch = baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.query.branch_id === "all" ? null : req.query.branch_id ?? null;
  return prisma.$queryRawUnsafe(
    `select w.*, u.name as withdrawn_by_name
     from shift_withdrawals w
     left join users u on u.id=w.withdrawn_by
     where ($1::uuid is null or w.branch_id=$1::uuid)
     order by w.created_at desc limit 200`,
    branch,
  );
}

export async function get(req: Request) {
  const row = (await prisma.$queryRawUnsafe<any[]>("select * from shifts where id=$1::uuid", req.params.id))[0];
  if (!row) throw new ApiError(404, "Shift not found");
  assertBranchAccess(req, row.branch_id);
  if (row.status === "open") {
    const money = await computeShiftMoney(row.id);
    return decorateOpenShift(row, money, await confirmedWithdrawnCash(row.id), await computeShiftExpenses(row.id));
  }
  return row;
}

// ─── Naqd выemka (inkassatsiya) so'rov + tasdiqlash ───────────────────────────
// Boshliq (super_admin) yoki smenadagi admin so'rov yuboradi; qarama-qarshi tomon
// tasdiqlaydi. Faqat tasdiqlangan so'rov adminning kutilgan naqdini kamaytiradi.

export async function listWithdrawalRequests(req: Request) {
  const branch = baseRole(req.user?.role) === "admin"
    ? (req.user?.branch_id ?? null)
    : req.query.branch_id === "all" ? null : req.query.branch_id ?? null;
  return prisma.$queryRawUnsafe(
    `select w.*,
       ib.name as initiated_by_name,
       ad.name as admin_name,
       cb.name as confirmed_by_name
     from cash_withdrawal_requests w
     left join users ib on ib.id = w.initiated_by
     left join users ad on ad.id = w.admin_id
     left join users cb on cb.id = w.confirmed_by
     where ($1::uuid is null or w.branch_id=$1::uuid)
     order by w.created_at desc limit 200`,
    branch,
  );
}

export async function createWithdrawalRequest(req: Request) {
  const branch = branchId(req);
  if (!branch) throw new ApiError(400, "branch_id is required");
  assertBranchAccess(req, branch);
  const amount = Math.round(Number(req.body.amount ?? 0));
  if (!(amount > 0)) throw new ApiError(400, "amount must be positive");

  const shift = (await prisma.$queryRawUnsafe<any[]>("select * from shifts where branch_id=$1::uuid and status='open' limit 1", branch))[0];
  if (!shift) throw new ApiError(409, "No open shift for this branch");

  // Kassada hozir bor naqd: boshlang'ich + naqd savdo − allaqachon olib chiqilgan.
  const money = await computeShiftMoney(shift.id);
  const expenses = await computeShiftExpenses(shift.id);
  const already = await confirmedWithdrawnCash(shift.id);
  const available = Number(shift.starting_cash ?? 0) + money.cash - expenses.cash - already;
  if (amount > available) throw new ApiError(400, "Amount exceeds cash in register");

  const initiatorRole = baseRole(req.user?.role); // 'admin' | 'super_admin'
  const row = (
    await prisma.$queryRawUnsafe<any[]>(
      `insert into cash_withdrawal_requests(branch_id,shift_id,admin_id,amount,initiated_by,initiator_role,status,note)
       values($1::uuid,$2::uuid,$3::uuid,$4,$5::uuid,$6,'pending',$7) returning *`,
      branch,
      shift.id,
      shift.opened_by, // выemka shu smenadagi admin kassasidan
      amount,
      req.user!.user_id,
      initiatorRole,
      req.body.note ?? null,
    )
  )[0];

  await auditLog({ actor: req.user, branch_id: branch, action_type: "withdrawal_requested", entity_type: "cash_withdrawal", entity_id: row.id, amount, details: { initiator_role: initiatorRole } });
  broadcastDashboard("withdrawal_requested", row, branch);
  return row;
}

export async function confirmWithdrawalRequest(req: Request) {
  const row = (await prisma.$queryRawUnsafe<any[]>("select * from cash_withdrawal_requests where id=$1::uuid", req.params.id))[0];
  if (!row) throw new ApiError(404, "Request not found");
  assertBranchAccess(req, row.branch_id);
  if (row.status !== "pending") throw new ApiError(409, "Request already resolved");
  // Tasdiqlovchi — so'rov yuboruvchining qarama-qarshi tomoni.
  if (baseRole(req.user?.role) === row.initiator_role) throw new ApiError(403, "Initiator cannot confirm own request");

  // Tasdiqlash paytida ham summa kassadagi naqddan oshmasligini tekshiramiz.
  const shift = row.shift_id ? (await prisma.$queryRawUnsafe<any[]>("select * from shifts where id=$1::uuid", row.shift_id))[0] : null;
  if (shift && shift.status === "open") {
    const money = await computeShiftMoney(shift.id);
    const expenses = await computeShiftExpenses(shift.id);
    const already = await confirmedWithdrawnCash(shift.id);
    const available = Number(shift.starting_cash ?? 0) + money.cash - expenses.cash - already;
    if (Number(row.amount) > available) throw new ApiError(400, "Amount exceeds cash in register");
  }

  const updated = (
    await prisma.$queryRawUnsafe<any[]>(
      "update cash_withdrawal_requests set status='confirmed', confirmed_by=$1::uuid, resolved_at=now() where id=$2::uuid returning *",
      req.user!.user_id,
      req.params.id,
    )
  )[0];
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: "withdrawal_confirmed", entity_type: "cash_withdrawal", entity_id: row.id, amount: Number(row.amount) });
  broadcastDashboard("withdrawal_resolved", updated, row.branch_id);
  return updated;
}

export async function rejectWithdrawalRequest(req: Request) {
  const row = (await prisma.$queryRawUnsafe<any[]>("select * from cash_withdrawal_requests where id=$1::uuid", req.params.id))[0];
  if (!row) throw new ApiError(404, "Request not found");
  assertBranchAccess(req, row.branch_id);
  if (row.status !== "pending") throw new ApiError(409, "Request already resolved");

  const updated = (
    await prisma.$queryRawUnsafe<any[]>(
      "update cash_withdrawal_requests set status='rejected', confirmed_by=$1::uuid, resolved_at=now() where id=$2::uuid returning *",
      req.user!.user_id,
      req.params.id,
    )
  )[0];
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: "withdrawal_rejected", entity_type: "cash_withdrawal", entity_id: row.id, amount: Number(row.amount) });
  broadcastDashboard("withdrawal_resolved", updated, row.branch_id);
  return updated;
}
