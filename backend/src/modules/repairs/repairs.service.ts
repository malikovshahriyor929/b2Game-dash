import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { isUuid } from "../../utils/ids";
import { availableRigMvp, sendRigMvpCommand, unlockRigMvp } from "../../services/rigMvp.service";

const MAX_MAINTENANCE_CHARGE_MINUTES = 24 * 60;

// authoritative, so an optional device command must not fail a maintenance resume.
async function sendRigCommandIfSupported(rigId: string, payload: Record<string, unknown>) {
  try {
    await sendRigMvpCommand(rigId, payload);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return;
    throw error;
  }
}

async function unlockRigIfSupported(rigId: string, minutes?: number) {
  try {
    await unlockRigMvp(rigId, minutes);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return;
    throw error;
  }
}

async function availableRigIfSupported(rigId: string) {
  try {
    await availableRigMvp(rigId);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return;
    throw error;
  }
}

function cappedStoredMaintenance(row: { charge_amount?: unknown; duration_minutes?: unknown }) {
  const chargeAmount = Number(row.charge_amount ?? 0);
  const durationMinutes = Number(row.duration_minutes ?? 0);
  if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) return { chargeAmount: 0, durationMinutes: Math.max(0, durationMinutes) };
  if (!Number.isFinite(durationMinutes) || durationMinutes <= MAX_MAINTENANCE_CHARGE_MINUTES) {
    return { chargeAmount, durationMinutes: Math.max(0, durationMinutes) };
  }
  return {
    chargeAmount: Math.round((chargeAmount * MAX_MAINTENANCE_CHARGE_MINUTES) / durationMinutes),
    durationMinutes: MAX_MAINTENANCE_CHARGE_MINUTES,
  };
}

const scopedBranch = (req: Request) =>
  baseRole(req.user?.role) === "admin"
    ? (req.user?.branch_id ?? null)
    : req.query.branch_id === "all" || req.query.branch_id == null
      ? null
      : String(req.query.branch_id);

export const list = (req: Request) =>
  prisma.$queryRawUnsafe(
    `select rr.*, s.name simulator_name, b.name branch_name, sess.status as session_status,
            u.name requested_by_name, rv.name reviewed_by_name
       from (
         select raw.id, raw.branch_id, raw.simulator_id, raw.session_id, raw.opened_during_session, raw.requested_by, raw.approved_by, raw.confirmed_by,
                raw.title, raw.description, raw.error_type, raw.priority, raw.status, raw.admin_note,
                raw.super_admin_note, raw.requested_at, raw.approved_at, raw.fixing_started_at,
                raw.marked_fixed_at, raw.confirmed_at, raw.revenue_impact, raw.closed_at,
                raw.review_status, raw.reviewed_by, raw.reviewed_at, raw.created_at, raw.updated_at,
                case
                  when raw.duration_minutes > ${MAX_MAINTENANCE_CHARGE_MINUTES}
                    then round(raw.charge_amount * ${MAX_MAINTENANCE_CHARGE_MINUTES} / nullif(raw.duration_minutes, 0))
                  else raw.charge_amount
                end as charge_amount,
                case
                  when raw.duration_minutes > ${MAX_MAINTENANCE_CHARGE_MINUTES}
                    then ${MAX_MAINTENANCE_CHARGE_MINUTES}
                  else raw.duration_minutes
                end as duration_minutes
           from repair_requests raw
       ) rr
       join simulators s on s.id = rr.simulator_id
       join branches b on b.id = rr.branch_id
       left join users u on u.id = rr.requested_by
       left join users rv on rv.id = rr.reviewed_by
       left join sessions sess on sess.id = rr.session_id
      where ($1::uuid is null or rr.branch_id = $1::uuid)
      order by rr.created_at desc`,
    scopedBranch(req),
  );

export async function get(id: string) {
  const row = (await prisma.$queryRawUnsafe<any[]>("select * from repair_requests where id=$1::uuid", id))[0];
  if (!row) throw new ApiError(404, "Repair request not found");
  return row;
}

// Time-aware lost revenue for the maintenance window. We integrate the simulator zone's
// active hourly tariff minute-by-minute over [openedAt, closedAt] in Asia/Tashkent, applying
// the same availability windows as tariffs.service.ts.
// Safety cap: if maintenance is accidentally left open for days, don't create multi-million
// penalties from a stale open request.
export async function computeMaintenanceCost(simulatorId: string, openedAt: Date | string, closedAt: Date | string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ charge_amount: string | number | null; duration_minutes: number | null }>>(
    `with sim as (
       select id, branch_id, zone from simulators where id = $1::uuid
     ),
     rate_tariffs as (
       select t.name, t.type, t.duration_minutes, t.price, t.available_days, t.available_from, t.available_until
         from tariffs t join sim on t.branch_id = sim.branch_id and t.simulator_zone = sim.zone
        where t.is_active = true and lower(t.type) = 'time'
     ),
     bounds as (
       select
         date_trunc('minute', ($2::timestamptz) at time zone 'Asia/Tashkent') as opened_local,
         least(
           date_trunc('minute', ($3::timestamptz) at time zone 'Asia/Tashkent'),
           date_trunc('minute', ($2::timestamptz) at time zone 'Asia/Tashkent') + ($4::int * interval '1 minute')
         ) as closed_local
     ),
     mins as (
       select
         gs as local_ts,
         extract(isodow from gs)::int as dow,
         case when extract(isodow from gs)::int = 1 then 7 else extract(isodow from gs)::int - 1 end as prev_dow,
         gs::time as local_time
       from bounds b
       cross join generate_series(
         b.opened_local,
         b.closed_local - interval '1 minute',
         interval '1 minute'
       ) gs
     ),
     priced as (
       select rt.price::numeric / nullif(rt.duration_minutes, 0) as minute_rate
       from mins m
       join rate_tariffs rt on case
         when rt.available_from is null or rt.available_until is null then
           cardinality(rt.available_days) = 0 or m.dow = any(rt.available_days)
         when rt.available_from <= rt.available_until then
           (cardinality(rt.available_days) = 0 or m.dow = any(rt.available_days))
           and m.local_time >= rt.available_from
           and m.local_time < rt.available_until
         else
           ((cardinality(rt.available_days) = 0 or m.dow = any(rt.available_days)) and m.local_time >= rt.available_from)
           or ((cardinality(rt.available_days) = 0 or m.prev_dow = any(rt.available_days)) and m.local_time < rt.available_until)
       end
     )
     select coalesce(round(sum(minute_rate)), 0) as charge_amount,
            (select count(*)::int from mins) as duration_minutes
       from priced`,
    simulatorId,
    openedAt instanceof Date ? openedAt.toISOString() : openedAt,
    closedAt instanceof Date ? closedAt.toISOString() : closedAt,
    MAX_MAINTENANCE_CHARGE_MINUTES,
  );
  const row = rows[0];
  return {
    chargeAmount: Number(row?.charge_amount ?? 0),
    durationMinutes: Number(row?.duration_minutes ?? 0),
  };
}

// Admin opens maintenance on a simulator (no approval needed).
export async function create(req: Request) {
  if (!isUuid(req.body.simulator_id)) throw new ApiError(400, "Repair simulator_id must be backend simulator UUID");
  const sim = (await prisma.$queryRawUnsafe<any[]>("select * from simulators where id=$1::uuid", req.body.simulator_id))[0];
  if (!sim) throw new ApiError(404, "Simulator not found");
  if (baseRole(req.user?.role) === "admin" && sim.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  if (sim.current_session_id || ["busy", "unpaid", "reserved"].includes(String(sim.status))) {
    throw new ApiError(409, "Maintenance ochishdan oldin aktiv sessiyani to'xtating");
  }
  const openExists = (await prisma.$queryRawUnsafe<any[]>("select id from repair_requests where simulator_id=$1::uuid and review_status='open' limit 1", sim.id))[0];
  if (openExists) throw new ApiError(409, "Simulator already has an open maintenance");
  const row = (await prisma.$queryRawUnsafe<any[]>(
    `insert into repair_requests(branch_id,simulator_id,requested_by,title,description,error_type,priority,status,review_status,admin_note)
     values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,'requested','open',$8) returning *`,
    sim.branch_id, sim.id, req.user!.user_id, req.body.title, req.body.description, req.body.error_type, req.body.priority ?? "medium", req.body.admin_note ?? null,
  ))[0];
  await prisma.$executeRawUnsafe("update simulators set status='repair_requested' where id=$1::uuid", sim.id);
  await auditLog({ actor: req.user, branch_id: sim.branch_id, action_type: "maintenance_opened", entity_type: "repair_request", entity_id: row.id, simulator_id: sim.id });
  broadcastDashboard("maintenance_opened", row, sim.branch_id);
  return row;
}

// Admin opens maintenance while a game session is active. The customer timer is paused,
// not stopped, and the request is linked to it for super-admin review.
export async function createFromActiveSession(req: Request) {
  if (!isUuid(req.body.simulator_id)) throw new ApiError(400, "Repair simulator_id must be backend simulator UUID");
  const sim = (await prisma.$queryRawUnsafe<any[]>("select * from simulators where id=$1::uuid", req.body.simulator_id))[0];
  if (!sim) throw new ApiError(404, "Simulator not found");
  if (baseRole(req.user?.role) === "admin" && sim.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");

  const session = (await prisma.$queryRawUnsafe<any[]>(
    `select id, simulator_id, branch_id, debt_amount, billing_mode, duration_minutes, added_minutes,
            remaining_seconds, started_at
       from sessions
      where simulator_id=$1::uuid and status='active'
      order by started_at desc
      limit 1`,
    sim.id,
  ))[0];
  if (!session) throw new ApiError(409, "Active session not found");

  const openExists = (await prisma.$queryRawUnsafe<any[]>("select id from repair_requests where simulator_id=$1::uuid and review_status='open' limit 1", sim.id))[0];
  if (openExists) throw new ApiError(409, "Simulator already has an open maintenance");

  // Freeze the exact remainder. When the session resumes its started_at is rebased,
  // so maintenance time cannot be deducted by normal expiry calculations.
  const paused = (await prisma.$queryRawUnsafe<any[]>(
    `update sessions set status='paused',
       remaining_seconds=case when billing_mode='open' then greatest(extract(epoch from (now() - started_at))::int, 0)
         else greatest(((duration_minutes + added_minutes) * 60 - extract(epoch from (now() - started_at))::int), 0) end,
       updated_at=now()
     where id=$1::uuid and status='active' returning *`,
    session.id,
  ))[0];
  if (!paused) throw new ApiError(409, "Session is no longer active");

  const row = (await prisma.$queryRawUnsafe<any[]>(
    `insert into repair_requests(branch_id,simulator_id,session_id,opened_during_session,requested_by,title,description,error_type,priority,status,review_status,admin_note)
     values($1::uuid,$2::uuid,$3::uuid,true,$4::uuid,$5,$6,$7,$8,'requested','open',$9) returning *`,
    sim.branch_id,
    sim.id,
    session.id,
    req.user!.user_id,
    req.body.title,
    req.body.description,
    req.body.error_type,
    req.body.priority ?? "critical",
    req.body.admin_note ?? null,
  ))[0];
  await prisma.$executeRawUnsafe("update simulators set status='repair_requested', current_session_id=null where id=$1::uuid", sim.id);
  // Maintenance is not a lock: technician must be able to use the workstation.
  if (sim.ws_rig_id) {
    try {
      await sendRigCommandIfSupported(sim.ws_rig_id, {
        type: "pause_session",
        session_id: session.id,
        remaining_seconds: Number(paused.remaining_seconds ?? 0),
        remaining_minutes: Math.max(0, Math.ceil(Number(paused.remaining_seconds ?? 0) / 60)),
      });
    } catch {
      // Older rig agents may not support pause_session; DB remains authoritative.
    }
    await unlockRigIfSupported(sim.ws_rig_id);
  }
  await auditLog({
    actor: req.user,
    branch_id: sim.branch_id,
    action_type: "maintenance_opened",
    entity_type: "repair_request",
    entity_id: row.id,
    simulator_id: sim.id,
    session_id: session.id,
    details: { opened_during_session: true, remaining_seconds: Number(paused.remaining_seconds ?? 0) },
  });
  broadcastDashboard("maintenance_opened", row, sim.branch_id);
  return row;
}

async function resumeInterruptedSession(repair: any, simulatorId: string) {
  if (!repair.session_id) return null;
  const session = (await prisma.$queryRawUnsafe<any[]>("select * from sessions where id=$1::uuid and status='paused' limit 1", repair.session_id))[0];
  if (!session) return null;
  const target = (await prisma.$queryRawUnsafe<any[]>("select * from simulators where id=$1::uuid limit 1", simulatorId))[0];
  if (!target) throw new ApiError(404, "Target simulator not found");
  if (target.branch_id !== repair.branch_id) throw new ApiError(409, "Session can only be moved within the same branch");
  const isOriginalSimulator = String(target.id) === String(repair.simulator_id);
  if (target.current_session_id || !(isOriginalSimulator ? ["repair_requested"] : ["ready_to_play", "reserved"]).includes(String(target.status))) throw new ApiError(409, "Target simulator is not available");

  const remainingSeconds = Number(session.remaining_seconds ?? 0);
  if (String(session.billing_mode) !== "open" && remainingSeconds <= 0) throw new ApiError(409, "Session time has already ended");
  // Exclude every paused minute by rebasing the active-session clock.
  await prisma.$executeRawUnsafe(
    `update sessions set simulator_id=$1::uuid, status='active',
       started_at=case when billing_mode='open' then now() - make_interval(secs => remaining_seconds)
         else now() - make_interval(secs => greatest((duration_minutes + added_minutes) * 60 - remaining_seconds, 0)) end,
       updated_at=now() where id=$2::uuid`,
    simulatorId, session.id,
  );
  await prisma.$executeRawUnsafe("update simulators set status='busy', current_session_id=$1::uuid where id=$2::uuid", session.id, simulatorId);
  if (target.ws_rig_id) {
    const minutes = String(session.billing_mode) === "open" ? undefined : Math.max(1, Math.ceil(remainingSeconds / 60));
    await unlockRigIfSupported(target.ws_rig_id, minutes);
    await sendRigCommandIfSupported(target.ws_rig_id, {
      type: "start_session",
      session_id: session.id,
      customer_name: session.customer_name ?? "Guest",
      phone: session.phone ?? null,
      duration_minutes: minutes ?? 0,
      duration_seconds: String(session.billing_mode) === "open" ? undefined : remainingSeconds,
      remaining_seconds: String(session.billing_mode) === "open" ? undefined : remainingSeconds,
      tariff_id: session.tariff_id ?? null,
    });
  }
  return { session, target, remainingSeconds };
}

// Admin (or super admin) closes maintenance: service resumes with the untouched session
// remainder; the maintenance cost is still sent to super-admin review.
export async function close(req: Request) {
  const rr = await get(String(req.params.id));
  if (baseRole(req.user?.role) === "admin" && rr.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  if (rr.review_status !== "open") throw new ApiError(409, `Maintenance is not open (${rr.review_status})`);
  const closedAt = new Date();
  const openedAt = rr.requested_at ?? rr.created_at;
  const { chargeAmount, durationMinutes } = await computeMaintenanceCost(rr.simulator_id, openedAt, closedAt);
  const row = (await prisma.$queryRawUnsafe<any[]>(
    `update repair_requests set review_status='pending_review', closed_at=$1::timestamptz, duration_minutes=$2,
            charge_amount=$3, marked_fixed_at=$1::timestamptz,
            title=coalesce(nullif($4,''),title), description=coalesce(nullif($5,''),description),
            error_type=coalesce(nullif($6,''),error_type), priority=coalesce(nullif($7,''),priority),
            admin_note=coalesce(nullif($8,''),admin_note), super_admin_note=coalesce($9,super_admin_note), updated_at=now()
      where id=$10::uuid returning *`,
    closedAt.toISOString(), durationMinutes, chargeAmount,
    req.body?.title ?? null, req.body?.description ?? null, req.body?.error_type ?? null, req.body?.priority ?? null,
    req.body?.admin_note ?? null, req.body?.note ?? null, rr.id,
  ))[0];
  const resumed = await resumeInterruptedSession(rr, rr.simulator_id);
  if (!resumed) {
    const simRows = await prisma.$queryRawUnsafe<Array<{ ws_rig_id: string | null }>>("select ws_rig_id from simulators where id=$1::uuid limit 1", rr.simulator_id);
    await prisma.$executeRawUnsafe("update simulators set status='ready_to_play', current_session_id=null where id=$1::uuid", rr.simulator_id);
    if (simRows[0]?.ws_rig_id) await availableRigIfSupported(simRows[0].ws_rig_id);
  }
  await auditLog({ actor: req.user, branch_id: rr.branch_id, action_type: "maintenance_closed", entity_type: "repair_request", entity_id: rr.id, simulator_id: rr.simulator_id, amount: chargeAmount });
  broadcastDashboard("maintenance_closed", { ...row, resumed_session_id: resumed?.session.id ?? null }, rr.branch_id);
  return row;
}

// For an extended repair, keep the repair open on the bad PC and continue the exact
// paused package on another free simulator in the same branch.
export async function transferSession(req: Request) {
  const rr = await get(String(req.params.id));
  if (baseRole(req.user?.role) === "admin" && rr.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  if (rr.review_status !== "open" || !rr.session_id) throw new ApiError(409, "This maintenance has no paused session to transfer");
  if (!isUuid(req.body?.simulator_id)) throw new ApiError(400, "Target simulator is required");
  if (String(req.body.simulator_id) === String(rr.simulator_id)) throw new ApiError(400, "Choose another simulator");
  const resumed = await resumeInterruptedSession(rr, String(req.body.simulator_id));
  if (!resumed) throw new ApiError(409, "Paused session was not found");
  await auditLog({ actor: req.user, branch_id: rr.branch_id, action_type: "maintenance_session_transferred", entity_type: "repair_request", entity_id: rr.id, simulator_id: resumed.target.id, session_id: resumed.session.id, details: { from_simulator_id: rr.simulator_id, remaining_seconds: resumed.remainingSeconds } });
  broadcastDashboard("maintenance_session_transferred", { repair_request_id: rr.id, session_id: resumed.session.id, from_simulator_id: rr.simulator_id, to_simulator_id: resumed.target.id }, rr.branch_id);
  return { repair_request_id: rr.id, session_id: resumed.session.id, simulator_id: resumed.target.id, remaining_seconds: resumed.remainingSeconds };
}

// Super admin reviews a closed maintenance: 'cleared' (legitimate, no charge) or 'charged'
// (false — the chargeable amount counts against the admin who opened it).
export async function review(req: Request) {
  if (baseRole(req.user?.role) !== "super_admin") throw new ApiError(403, "Super Admin required");
  const decision = String(req.body?.decision ?? "");
  if (decision !== "cleared" && decision !== "charged") throw new ApiError(400, "decision must be 'cleared' or 'charged'");
  const rr = await get(String(req.params.id));
  if (rr.review_status !== "pending_review") throw new ApiError(409, `Maintenance is not pending review (${rr.review_status})`);
  const capped = cappedStoredMaintenance(rr);
  const row = (await prisma.$queryRawUnsafe<any[]>(
    `update repair_requests set review_status=$1, reviewed_by=$2::uuid, reviewed_at=now(),
            duration_minutes=$3, charge_amount=$4,
            super_admin_note=coalesce($5,super_admin_note), updated_at=now()
      where id=$6::uuid returning *`,
    decision, req.user!.user_id, capped.durationMinutes, capped.chargeAmount, req.body?.note ?? null, rr.id,
  ))[0];
  await auditLog({ actor: req.user, branch_id: rr.branch_id, action_type: "maintenance_reviewed", entity_type: "repair_request", entity_id: rr.id, simulator_id: rr.simulator_id, amount: decision === "charged" ? capped.chargeAmount : 0, details: { decision } });
  broadcastDashboard("maintenance_reviewed", row, rr.branch_id);
  return row;
}
