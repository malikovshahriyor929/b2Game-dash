import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { getRigMvpRig, lockRigMvp, sendRigMvpCommand, unlockRigMvp } from "../../services/rigMvp.service";
import { isUuid } from "../../utils/ids";

async function getSessionScoped(req: Request) {
  const rows = await prisma.$queryRawUnsafe<any[]>("select * from sessions where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid)", req.params.id, req.user?.role === "admin" ? req.user.branch_id : null);
  if (!rows.length) throw new ApiError(404, "Session not found");
  return rows[0];
}
export async function list(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where ($1::uuid is null or branch_id=$1::uuid) order by created_at desc limit 200", req.user?.role === "admin" ? req.user.branch_id : req.query.branch_id === "all" ? null : req.query.branch_id ?? null); }
export async function active(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where status in ('active','paused','unpaid') and ($1::uuid is null or branch_id=$1::uuid) order by started_at desc", req.user?.role === "admin" ? req.user.branch_id : req.query.branch_id === "all" ? null : req.query.branch_id ?? null); }
export const get = getSessionScoped;

function paymentMode(value: unknown) {
  if (value === "balance") return "balance";
  if (value === "paid" || value === "prepaid") return "prepaid";
  return "postpaid";
}

export async function start(req: Request) {
  if (!isUuid(req.body.simulator_id)) {
    const rig = await getRigMvpRig(String(req.body.simulator_id));
    if (!rig.online) throw new ApiError(409, `Rig '${rig.rig_id}' is offline`);
    const durationMinutes = Number(req.body.duration_minutes ?? 0);
    await unlockRigMvp(rig.rig_id, durationMinutes);
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
    await sendRigMvpCommand(rig.rig_id, {
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
  if (req.user?.role === "admin" && sim.branch_id !== req.user.branch_id) throw new ApiError(403, "Branch scope violation");
  if (!["ready_to_play","reserved"].includes(sim.status)) throw new ApiError(409, `Simulator is ${sim.status}`);
  const amount = Number(req.body.paid_amount ?? 0);
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `insert into sessions(branch_id,simulator_id,customer_id,customer_name,phone,tariff_id,status,payment_mode,duration_minutes,remaining_seconds,session_amount,total_amount,paid_amount,debt_amount,created_by)
     values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6::uuid,'active',$7,$8,$9,$10,$10,$11,greatest($10-$11,0),$12::uuid) returning *`,
    sim.branch_id, sim.id, req.body.customer_id ?? null, req.body.customer_name ?? null, req.body.phone ?? null, req.body.tariff_id ?? null, paymentMode(req.body.payment_mode), req.body.duration_minutes, req.body.duration_minutes * 60, amount, amount, req.user!.user_id,
  );
  const session = rows[0];
  await prisma.$executeRawUnsafe("update simulators set status='busy', current_session_id=$1::uuid where id=$2::uuid", session.id, sim.id);
  if (amount > 0) await prisma.$executeRawUnsafe("insert into payments(branch_id,session_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10::uuid)", sim.branch_id, session.id, req.body.customer_id ?? null, amount, req.body.method, req.body.method === "cash" ? amount : 0, req.body.method === "card" ? amount : 0, req.body.method === "qr" ? amount : 0, req.body.method === "balance" ? amount : 0, req.user!.user_id);
  if (sim.ws_rig_id) {
    const durationMinutes = Number(req.body.duration_minutes);
    await unlockRigMvp(sim.ws_rig_id, durationMinutes);
    await sendRigMvpCommand(sim.ws_rig_id, {
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

async function finalizeSessionStop(
  session: { id: string; simulator_id: string; branch_id: string; debt_amount?: unknown },
  options: { stoppedBy?: string | null; expired?: boolean } = {},
) {
  const nextStatus = Number(session.debt_amount) > 0 ? "unpaid" : "stopped";
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
    `select s.id, s.simulator_id, s.branch_id, s.debt_amount
     from sessions s
     where s.status = 'active'
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
  await unlockRigMvp(rigId, remainingMinutes);
  await sendRigMvpCommand(rigId, {
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

  await prisma.$executeRawUnsafe(
    "update sessions set added_minutes=added_minutes+$1, remaining_seconds=remaining_seconds+$2, added_time_amount=added_time_amount+$3, total_amount=total_amount+$3, paid_amount=paid_amount+$3 where id=$4::uuid",
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
      "insert into payments(branch_id,session_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10::uuid)",
      updated.branch_id,
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
