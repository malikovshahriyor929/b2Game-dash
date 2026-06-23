import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { isUuid } from "../../utils/ids";

const scopedBranch = (req: Request) =>
  baseRole(req.user?.role) === "admin"
    ? (req.user?.branch_id ?? null)
    : req.query.branch_id === "all" || req.query.branch_id == null
      ? null
      : String(req.query.branch_id);

export const list = (req: Request) =>
  prisma.$queryRawUnsafe(
    `select rr.*, s.name simulator_name, b.name branch_name,
            u.name requested_by_name, rv.name reviewed_by_name
       from repair_requests rr
       join simulators s on s.id = rr.simulator_id
       join branches b on b.id = rr.branch_id
       left join users u on u.id = rr.requested_by
       left join users rv on rv.id = rr.reviewed_by
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
// hourly tariff rate minute-by-minute over [openedAt, closedAt] in Asia/Tashkent, applying
// the same happy-hour / weekend / weekday rules as tariffs.service.ts. The representative
// hourly rate is the active `time` tariff for the simulator's branch + zone, normalized to
// a per-hour price. Returns the chargeable amount (so'm) and the duration in minutes.
export async function computeMaintenanceCost(simulatorId: string, openedAt: Date | string, closedAt: Date | string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ charge_amount: string | number | null; duration_minutes: number | null }>>(
    `with sim as (
       select id, branch_id, zone from simulators where id = $1::uuid
     ),
     rate_tariff as (
       select t.name, t.type, t.duration_minutes, t.price, t.weekday_price, t.weekend_price
         from tariffs t join sim on t.branch_id = sim.branch_id and t.simulator_zone = sim.zone
        where t.is_active = true and lower(t.type) = 'time'
        order by abs(t.duration_minutes - 60), t.duration_minutes
        limit 1
     ),
     mins as (
       select generate_series(
         date_trunc('minute', ($2::timestamptz) at time zone 'Asia/Tashkent'),
         date_trunc('minute', ($3::timestamptz) at time zone 'Asia/Tashkent') - interval '1 minute',
         interval '1 minute'
       ) as local_ts
     ),
     priced as (
       select
         (case
            when extract(isodow from m.local_ts)::int between 1 and 4
                 and rt.name ilike 'Logitech%'
                 and m.local_ts::time >= time '10:00' and m.local_ts::time < time '18:00'
              then 25000::numeric
            when extract(isodow from m.local_ts)::int in (6, 7)
              then coalesce(rt.weekend_price::numeric, rt.price::numeric)
            else coalesce(rt.weekday_price::numeric, rt.price::numeric)
          end) * 60.0 / nullif(rt.duration_minutes, 0) as hourly_rate
       from mins m cross join rate_tariff rt
     )
     select coalesce(round(sum(hourly_rate) / 60.0), 0) as charge_amount,
            (select count(*)::int from mins) as duration_minutes
       from priced`,
    simulatorId,
    openedAt instanceof Date ? openedAt.toISOString() : openedAt,
    closedAt instanceof Date ? closedAt.toISOString() : closedAt,
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

// Admin (or super admin) closes maintenance: simulator returns to service immediately and
// the time-aware chargeable cost is computed and stored, pending super-admin review.
export async function close(req: Request) {
  const rr = await get(String(req.params.id));
  if (baseRole(req.user?.role) === "admin" && rr.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  if (rr.review_status !== "open") throw new ApiError(409, `Maintenance is not open (${rr.review_status})`);
  const closedAt = new Date();
  const { chargeAmount, durationMinutes } = await computeMaintenanceCost(rr.simulator_id, rr.created_at, closedAt);
  const row = (await prisma.$queryRawUnsafe<any[]>(
    `update repair_requests set review_status='pending_review', closed_at=$1::timestamptz, duration_minutes=$2,
            charge_amount=$3, marked_fixed_at=$1::timestamptz, super_admin_note=coalesce($4,super_admin_note), updated_at=now()
      where id=$5::uuid returning *`,
    closedAt.toISOString(), durationMinutes, chargeAmount, req.body?.note ?? null, rr.id,
  ))[0];
  await prisma.$executeRawUnsafe("update simulators set status='ready_to_play' where id=$1::uuid", rr.simulator_id);
  await auditLog({ actor: req.user, branch_id: rr.branch_id, action_type: "maintenance_closed", entity_type: "repair_request", entity_id: rr.id, simulator_id: rr.simulator_id, amount: chargeAmount });
  broadcastDashboard("maintenance_closed", row, rr.branch_id);
  return row;
}

// Super admin reviews a closed maintenance: 'cleared' (legitimate, no charge) or 'charged'
// (false — the chargeable amount counts against the admin who opened it).
export async function review(req: Request) {
  if (baseRole(req.user?.role) !== "super_admin") throw new ApiError(403, "Super Admin required");
  const decision = String(req.body?.decision ?? "");
  if (decision !== "cleared" && decision !== "charged") throw new ApiError(400, "decision must be 'cleared' or 'charged'");
  const rr = await get(String(req.params.id));
  if (rr.review_status !== "pending_review") throw new ApiError(409, `Maintenance is not pending review (${rr.review_status})`);
  const row = (await prisma.$queryRawUnsafe<any[]>(
    `update repair_requests set review_status=$1, reviewed_by=$2::uuid, reviewed_at=now(),
            super_admin_note=coalesce($3,super_admin_note), updated_at=now()
      where id=$4::uuid returning *`,
    decision, req.user!.user_id, req.body?.note ?? null, rr.id,
  ))[0];
  await auditLog({ actor: req.user, branch_id: rr.branch_id, action_type: "maintenance_reviewed", entity_type: "repair_request", entity_id: rr.id, simulator_id: rr.simulator_id, amount: decision === "charged" ? Number(rr.charge_amount ?? 0) : 0, details: { decision } });
  broadcastDashboard("maintenance_reviewed", row, rr.branch_id);
  return row;
}
