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

// Smena qatoriga jonli hisoblangan pul ko'rsatkichlarini qo'shadi (ochiq smena uchun).
function decorateOpenShift(shift: any, money: { cash: number; card: number; bank: number; balance: number; total: number }) {
  const startingCash = Number(shift.starting_cash ?? 0);
  return {
    ...shift,
    cash_sales: money.cash,
    card_total: money.card,
    qr_total: money.bank,
    balance_sales: money.balance,
    total_revenue: money.total,
    expected_cash: startingCash + money.cash, // kassada bo'lishi kerak bo'lgan naqd
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
      result.push(decorateOpenShift(row, money));
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
  return decorateOpenShift(shift, money);
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

  const startingCash = Number(shift.starting_cash ?? 0);
  const expectedCash = startingCash + money.cash; // kassada bo'lishi kerak bo'lgan naqd
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
         expected_cash=$7,
         actual_cash=$8,
         cash_withdrawn=$9,
         card_withdrawn=$10,
         bank_withdrawn=$11,
         remaining_cash=$12,
         withdraw_recipient=$13,
         difference=$14,
         notes=$15,
         closed_at=now(),
         updated_at=now()
       where id=$16::uuid returning *`,
      req.user!.user_id,
      money.cash,
      money.card,
      money.bank,
      money.balance,
      money.total,
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
    details: { cash: money.cash, card: money.card, bank: money.bank, balance: money.balance, cash_withdrawn: cashWithdrawn, remaining_cash: remainingCash, difference, recipient },
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
    return decorateOpenShift(row, money);
  }
  return row;
}
