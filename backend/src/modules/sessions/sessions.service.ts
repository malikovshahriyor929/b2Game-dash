import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { getRigMvpRig, lockRigMvp, sendRigMvpCommand, unlockRigMvp } from "../../services/rigMvp.service";
import { isUuid } from "../../utils/ids";
import { requireOpenShift } from "../shifts/shift.guard";
import { debitCustomerBalance } from "../customers/customers.service";

async function getSessionScoped(req: Request) {
  const rows = await prisma.$queryRawUnsafe<any[]>("select * from sessions where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid)", req.params.id, baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : null);
  if (!rows.length) throw new ApiError(404, "Session not found");
  return rows[0];
}
export async function list(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where ($1::uuid is null or branch_id=$1::uuid) order by created_at desc limit 200", baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.query.branch_id === "all" ? null : req.query.branch_id ?? null); }
export async function active(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where status in ('active','paused','unpaid') and ($1::uuid is null or branch_id=$1::uuid) order by started_at desc", baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.query.branch_id === "all" ? null : req.query.branch_id ?? null); }
export const get = getSessionScoped;

function paymentMode(value: unknown) {
  if (value === "balance") return "balance";
  if (value === "paid" || value === "prepaid") return "prepaid";
  return "postpaid";
}

async function sendRigMvpCommandIfSupported(rigId: string, payload: Record<string, unknown>) {
  try {
    await sendRigMvpCommand(rigId, payload);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return;
    throw error;
  }
}

async function unlockRigMvpIfSupported(rigId: string, minutes?: number) {
  try {
    await unlockRigMvp(rigId, minutes);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return;
    throw error;
  }
}

// VIP tariffs (type='vip') bill as open/hourly sessions: the timer counts up and the
// final amount is elapsed time * hourly rate (no package discount), calculated at stop.
// hourlyRate is normalized to a per-hour price, so a 60-min/100k VIP tariff = 100k/hour.
async function resolveTariffBilling(tariffId: unknown): Promise<{ open: boolean; hourlyRate: number }> {
  if (!isUuid(tariffId)) return { open: false, hourlyRate: 0 };
  const rows = await prisma.$queryRawUnsafe<Array<{ type: string; price: unknown; duration_minutes: number }>>(
    "select type, price, duration_minutes from tariffs where id=$1::uuid limit 1",
    tariffId,
  );
  const tariff = rows[0];
  if (!tariff) return { open: false, hourlyRate: 0 };
  const open = String(tariff.type).toLowerCase() === "vip";
  const duration = Number(tariff.duration_minutes) || 60;
  const hourlyRate = open ? Math.round((Number(tariff.price) * 60) / duration) : 0;
  return { open, hourlyRate };
}

const BONUS_PRODUCT_PATTERNS: Array<{ test: RegExp; like: string }> = [
  { test: /energet|energy/i, like: "%energy%" },
  { test: /chips|chipsy/i, like: "%chips%" },
  { test: /snickers/i, like: "%snickers%" },
  { test: /coca|cola/i, like: "%cola%" },
  { test: /suv|water/i, like: "%water%" },
  { test: /burger/i, like: "%burger%" },
];

function parseBonusItems(bonus: string): Array<{ like: string; text: string; label: string; quantity: number }> {
  return bonus
    .split(/[+,/]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const qtyMatch = part.match(/^(\d+)\s*/);
      const quantity = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1;
      const text = part.replace(/^\d+\s*(x|ta|dona)?\s*/i, "").trim();
      const pattern = BONUS_PRODUCT_PATTERNS.find((p) => p.test.test(text));
      const like = pattern ? pattern.like : `%${text}%`;
      return { like, text, label: part, quantity };
    })
    .filter((item) => item.text && item.like !== "%%" && item.like !== "%");
}

// Tarif bonusini (kun turiga qarab weekday/weekend) skladdan best-effort ayiradi.
// Mahsulot topilmasa yoki stok yetmasa — o'tkazib yuboradi, sessiyani bloklamaydi.
async function applyTariffBonusStock(branchId: string, tariffId: string | null | undefined, createdBy: string) {
  if (!tariffId || !isUuid(tariffId)) return;
  const tariffRows = await prisma.$queryRawUnsafe<Array<{ bonus: string | null }>>(
    `select case
        when extract(isodow from now() at time zone 'Asia/Tashkent')::int in (6,7)
        then weekend_bonus else weekday_bonus end as bonus
      from tariffs where id=$1::uuid`,
    tariffId,
  );
  const bonus = tariffRows[0]?.bonus;
  if (!bonus || !bonus.trim()) return;

  let changed = false;
  for (const item of parseBonusItems(bonus)) {
    const rows = await prisma.$queryRawUnsafe<Array<{ inv_id: string; product_id: string; stock_quantity: number }>>(
      `select i.id as inv_id, p.id as product_id, i.stock_quantity
         from products p join inventory i on i.product_id=p.id
        where i.branch_id=$1::uuid and p.is_active=true and (lower(p.name)=lower($3) or p.name ilike $2 or p.category ilike $2)
        order by (lower(p.name)=lower($3)) desc, i.stock_quantity desc limit 1`,
      branchId,
      item.like,
      item.text,
    );
    const inv = rows[0];
    if (!inv) continue; // mos mahsulot topilmadi
    if (inv.stock_quantity < item.quantity) continue; // stok yetmaydi -> ayirmaymiz
    await prisma.$executeRawUnsafe(
      "update inventory set stock_quantity=stock_quantity-$1, updated_at=now() where id=$2::uuid",
      item.quantity,
      inv.inv_id,
    );
    await prisma.$executeRawUnsafe(
      `insert into inventory_movements(branch_id,product_id,type,quantity,before_quantity,after_quantity,reason,created_by)
       values($1::uuid,$2::uuid,'sale',$3,$4,$5,$6,$7::uuid)`,
      branchId,
      inv.product_id,
      item.quantity,
      inv.stock_quantity,
      inv.stock_quantity - item.quantity,
      `tariff bonus: ${item.label}`,
      createdBy,
    );
    changed = true;
  }
  if (changed) broadcastDashboard("inventory_updated", { branch_id: branchId, reason: "tariff_bonus" }, branchId);
}

export async function start(req: Request) {
  if (!isUuid(req.body.simulator_id)) {
    const rig = await getRigMvpRig(String(req.body.simulator_id));
    if (!rig.online) throw new ApiError(409, `Rig '${rig.rig_id}' is offline`);
    const durationMinutes = Number(req.body.duration_minutes ?? 0);
    await unlockRigMvpIfSupported(rig.rig_id, durationMinutes);
    const session = {
      id: `rig-mvp:${rig.rig_id}:${Date.now()}`,
      branch_id: req.user?.branch_id ?? req.body.branch_id ?? null,
      simulator_id: rig.rig_id,
      customer_name: req.body.customer_name ?? null,
      phone: req.body.phone ?? null,
      status: "active",
      payment_mode: req.body.payment_mode ?? "unpaid",
      duration_minutes: durationMinutes,
      total_amount: Number(req.body.paid_amount ?? 0),
      paid_amount: Number(req.body.paid_amount ?? 0),
      source: "rig_mvp",
    };
    await sendRigMvpCommandIfSupported(rig.rig_id, {
      type: "start_session",
      session_id: session.id,
      customer_name: req.body.customer_name ?? "Guest",
      phone: req.body.phone ?? null,
      duration_minutes: durationMinutes,
    });
    await auditLog({ actor: req.user, branch_id: null, action_type: "start_session", entity_type: "rig_mvp", details: { rig_id: rig.rig_id, duration_minutes: session.duration_minutes } });
    broadcastDashboard("session_started", session, null);
    return session;
  }
  const simRows = await prisma.$queryRawUnsafe<any[]>("select * from simulators where id=$1::uuid", req.body.simulator_id);
  const sim = simRows[0];
  if (!sim) throw new ApiError(404, "Simulator not found");
  if (baseRole(req.user?.role) === "admin" && sim.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  if (!["ready_to_play","reserved"].includes(sim.status)) throw new ApiError(409, `Simulator is ${sim.status}`);
  const billing = await resolveTariffBilling(req.body.tariff_id);
  const amount = Number(req.body.paid_amount ?? 0);
  // Open (VIP) sessions have no fixed duration — they count up and are billed at stop.
  const durationMinutes = billing.open ? 0 : Number(req.body.duration_minutes ?? 0);
  const remainingSeconds = billing.open ? 0 : durationMinutes * 60;
  const sessionAmount = billing.open ? 0 : amount;
  // Bron to'qnashuvi: bu PC sessiya vaqti oralig'ida bron qilingan bo'lsa rad etamiz.
  // Bajarilayotgan bronni (booking_id) hisobga olmaymiz. Ochiq (VIP) sessiya cheksiz — oralig'i 'infinity'.
  const upperExpr = billing.open ? "'infinity'::timestamptz" : "now() + make_interval(mins => $3::int)";
  const conflictParams = billing.open ? [sim.id, req.body.booking_id ?? null] : [sim.id, req.body.booking_id ?? null, durationMinutes];
  const bookingConflict = await prisma.$queryRawUnsafe<Array<{ start_label: string; customer_name: string | null }>>(
    `select to_char(start_time,'HH24:MI') as start_label, customer_name
       from bookings
      where simulator_id=$1::uuid
        and status not in ('cancelled','no_show','completed')
        and ($2::uuid is null or id <> $2::uuid)
        and tstzrange(start_time, end_time) && tstzrange(now(), ${upperExpr})
      order by start_time asc limit 1`,
    ...conflictParams,
  );
  if (bookingConflict.length) {
    const conflict = bookingConflict[0];
    throw new ApiError(409, `Bu PC ${conflict.start_label} da bron qilingan${conflict.customer_name ? ` (${conflict.customer_name})` : ""} — sessiya bron vaqtiga to'g'ri keladi. Qisqaroq vaqt tanlang.`);
  }
  // To'lov bo'ladigan bo'lsa, ochiq smena shart — sessiya yaratishdan oldin tekshiramiz (orphan bo'lmasligi uchun).
  const shiftId = amount > 0 ? await requireOpenShift(sim.branch_id) : null;
  // "balance" usulida — sessiya yaratishdan OLDIN balansdan ayiramiz (mablag' yetmasa bu yerda to'xtaydi).
  if (req.body.method === "balance" && amount > 0) await debitCustomerBalance(req.body.customer_id ?? null, sim.branch_id, amount);
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `insert into sessions(branch_id,simulator_id,customer_id,customer_name,phone,tariff_id,status,payment_mode,billing_mode,hourly_rate,duration_minutes,remaining_seconds,session_amount,total_amount,paid_amount,debt_amount,created_by)
     values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6::uuid,'active',$7,$8,$9,$10,$11,$12,$12,$13,greatest($12-$13,0),$14::uuid) returning *`,
    sim.branch_id, sim.id, req.body.customer_id ?? null, req.body.customer_name ?? null, req.body.phone ?? null, req.body.tariff_id ?? null, paymentMode(req.body.payment_mode), billing.open ? "open" : "fixed", billing.hourlyRate, durationMinutes, remainingSeconds, sessionAmount, amount, req.user!.user_id,
  );
  const session = rows[0];
  await prisma.$executeRawUnsafe("update simulators set status='busy', current_session_id=$1::uuid where id=$2::uuid", session.id, sim.id);
  // Tarif bonusini (energetik, chips ...) skladdan ayirish. Best-effort: xato sessiyani to'xtatmaydi.
  try {
    await applyTariffBonusStock(sim.branch_id, req.body.tariff_id ?? null, req.user!.user_id);
  } catch (error) {
    console.error("applyTariffBonusStock failed", error);
  }
  if (amount > 0) await prisma.$executeRawUnsafe("insert into payments(branch_id,shift_id,session_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11::uuid)", sim.branch_id, shiftId, session.id, req.body.customer_id ?? null, amount, req.body.method, req.body.method === "cash" ? amount : 0, req.body.method === "card" ? amount : 0, req.body.method === "qr" ? amount : 0, req.body.method === "balance" ? amount : 0, req.user!.user_id);
  if (sim.ws_rig_id) {
    // Open sessions unlock the rig indefinitely (no duration cap); fixed sessions cap to duration.
    await unlockRigMvpIfSupported(sim.ws_rig_id, billing.open ? undefined : durationMinutes);
    await sendRigMvpCommandIfSupported(sim.ws_rig_id, {
      type: "start_session",
      session_id: session.id,
      customer_name: req.body.customer_name ?? "Guest",
      phone: req.body.phone ?? null,
      duration_minutes: durationMinutes,
      tariff_id: req.body.tariff_id ?? null,
    });
  }
  await auditLog({ actor: req.user, branch_id: sim.branch_id, action_type: "start_session", entity_type: "session", entity_id: session.id, simulator_id: sim.id, session_id: session.id, amount });
  broadcastDashboard("session_started", session, sim.branch_id);
  return session;
}
async function lockRigForSession(simulatorId: string, message = "Session ended") {
  const simRows = await prisma.$queryRawUnsafe<Array<{ ws_rig_id: string | null }>>(
    "select ws_rig_id from simulators where id=$1::uuid limit 1",
    simulatorId,
  );
  const rigId = simRows[0]?.ws_rig_id;
  if (!rigId) return;
  try {
    await lockRigMvp(rigId, message);
  } catch {
    // Rig-MVP unreachable or rig offline — DB session still stops.
  }
}

export async function finalizeSessionStop(
  session: { id: string; simulator_id: string; branch_id: string; debt_amount?: unknown; billing_mode?: unknown },
  options: { stoppedBy?: string | null; expired?: boolean } = {},
) {
  let debtAmount = Number(session.debt_amount ?? 0);
  if (String(session.billing_mode) === "open") {
    const billed = await prisma.$queryRawUnsafe<Array<{ debt_amount: unknown }>>(
      `update sessions
       set duration_minutes = ceil(extract(epoch from (now() - started_at)) / 60.0)::int,
           session_amount = round(ceil(extract(epoch from (now() - started_at)) / 60.0) * hourly_rate / 60.0),
           total_amount = round(ceil(extract(epoch from (now() - started_at)) / 60.0) * hourly_rate / 60.0) + shop_amount + added_time_amount,
           debt_amount = greatest(round(ceil(extract(epoch from (now() - started_at)) / 60.0) * hourly_rate / 60.0) + shop_amount + added_time_amount - paid_amount, 0),
           updated_at = now()
       where id=$1::uuid
       returning debt_amount`,
      session.id,
    );
    debtAmount = Number(billed[0]?.debt_amount ?? 0);
  }
  const nextStatus = debtAmount > 0 ? "unpaid" : "stopped";
  await prisma.$executeRawUnsafe(
    "update sessions set status=$1, ended_at=now(), stopped_by=$2::uuid where id=$3::uuid",
    nextStatus,
    options.stoppedBy ?? null,
    session.id,
  );
  await prisma.$executeRawUnsafe(
    "update simulators set status=$1, current_session_id=null where id=$2::uuid",
    nextStatus === "unpaid" ? "unpaid" : "ready_to_play",
    session.simulator_id,
  );
  // Ro'yxatdan o'tgan mijoz statistikasi: tashriflar soni, oxirgi tashrif va sarflangan summa.
  // Join customer_id orqali — guest (customer_id=null) sessiyalarda hech narsa o'zgarmaydi.
  await prisma.$executeRawUnsafe(
    `update customers c
     set sessions_count = sessions_count + 1,
         last_visit_at = now(),
         total_spent = total_spent + coalesce(s.total_amount, 0),
         updated_at = now()
     from sessions s
     where s.id = $1::uuid and c.id = s.customer_id`,
    session.id,
  );
  await lockRigForSession(String(session.simulator_id));
  broadcastDashboard("session_stopped", { id: session.id, expired: Boolean(options.expired) }, session.branch_id);
}

export async function expireElapsedSessions() {
  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string;
    simulator_id: string;
    branch_id: string;
    debt_amount: unknown;
  }>>(
    `select s.id, s.simulator_id, s.branch_id, s.debt_amount, s.billing_mode
     from sessions s
     where s.status = 'active'
       and s.billing_mode <> 'open'
       and greatest(
         ((s.duration_minutes + s.added_minutes) * 60)
         - extract(epoch from (now() - s.started_at))::int,
         0
       ) <= 0`,
  );

  for (const session of rows) {
    await finalizeSessionStop(session, { expired: true });
    await auditLog({
      branch_id: session.branch_id,
      action_type: "stop_session",
      entity_type: "session",
      entity_id: session.id,
      session_id: session.id,
      simulator_id: session.simulator_id,
      details: { expired: true, source: "system" },
    });
  }

  return rows.length;
}

async function extendRigSessionTime(simulatorId: string, addedMinutes: number, remainingSeconds: number) {
  const simRows = await prisma.$queryRawUnsafe<Array<{ ws_rig_id: string | null }>>(
    "select ws_rig_id from simulators where id=$1::uuid limit 1",
    simulatorId,
  );
  const rigId = simRows[0]?.ws_rig_id;
  if (!rigId) return;

  const remainingMinutes = Math.max(1, Math.ceil(remainingSeconds / 60));
  await unlockRigMvpIfSupported(rigId, remainingMinutes);
  await sendRigMvpCommandIfSupported(rigId, {
    type: "add_time",
    minutes: addedMinutes,
    remaining_minutes: remainingMinutes,
  });
}

export async function addTime(req: Request) {
  const s = await getSessionScoped(req);
  const minutes = Number(req.body.minutes);
  const amount = Number(req.body.amount ?? 0);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new ApiError(400, "minutes must be positive");
  // To'lov bo'ladigan bo'lsa, ochiq smena shart — sessiyani o'zgartirishdan oldin tekshiramiz.
  const shiftId = amount > 0 ? await requireOpenShift(s.branch_id) : null;
  // "balance" usulida — o'zgartirishdan oldin balansdan ayiramiz (mablag' yetmasa to'xtaydi).
  if (req.body.method === "balance" && amount > 0) await debitCustomerBalance(s.customer_id ?? null, s.branch_id, amount);

  await prisma.$executeRawUnsafe(
    `update sessions
     set added_minutes=added_minutes+$1,
         remaining_seconds=(
           case
             when status = 'paused' then greatest(remaining_seconds, 0)
             else greatest(((duration_minutes + added_minutes) * 60 - extract(epoch from (now() - started_at)))::int, 0)
           end
         ) + $2,
         added_time_amount=added_time_amount+$3,
         total_amount=total_amount+$3,
         paid_amount=paid_amount+$3,
         updated_at=now()
     where id=$4::uuid`,
    minutes,
    minutes * 60,
    amount,
    s.id,
  );

  const updated = await getSessionScoped(req);
  const remainingSeconds = Number(updated.remaining_seconds ?? 0);
  await extendRigSessionTime(String(updated.simulator_id), minutes, remainingSeconds);

  if (amount > 0) {
    await prisma.$executeRawUnsafe(
      "insert into payments(branch_id,shift_id,session_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11::uuid)",
      updated.branch_id,
      shiftId,
      updated.id,
      updated.customer_id ?? null,
      amount,
      req.body.method ?? "cash",
      req.body.method === "cash" ? amount : 0,
      req.body.method === "card" ? amount : 0,
      req.body.method === "qr" ? amount : 0,
      req.body.method === "balance" ? amount : 0,
      req.user!.user_id,
    );
  }

  await auditLog({
    actor: req.user,
    branch_id: updated.branch_id,
    action_type: "add_time",
    entity_type: "session",
    entity_id: updated.id,
    session_id: updated.id,
    simulator_id: updated.simulator_id,
    amount,
  });
  broadcastDashboard("simulator_updated", { session_id: updated.id }, updated.branch_id);
  return updated;
}
export async function pause(req: Request) { const s = await getSessionScoped(req); await prisma.$executeRawUnsafe("update sessions set status='paused' where id=$1::uuid", s.id); await auditLog({ actor: req.user, branch_id: s.branch_id, action_type: "pause_session", entity_type: "session", entity_id: s.id, session_id: s.id }); return { ok: true }; }
export async function resume(req: Request) { const s = await getSessionScoped(req); await prisma.$executeRawUnsafe("update sessions set status='active' where id=$1::uuid", s.id); await auditLog({ actor: req.user, branch_id: s.branch_id, action_type: "resume_session", entity_type: "session", entity_id: s.id, session_id: s.id }); return { ok: true }; }
export async function stop(req: Request) {
  const s = await getSessionScoped(req);
  await finalizeSessionStop(s, { stoppedBy: req.user!.user_id });
  await auditLog({
    actor: req.user,
    branch_id: s.branch_id,
    action_type: "stop_session",
    entity_type: "session",
    entity_id: s.id,
    simulator_id: s.simulator_id,
    session_id: s.id,
  });
  return getSessionScoped(req);
}
