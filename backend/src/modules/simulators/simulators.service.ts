import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import {
  getRigMvpRig,
  listRigMvpRigs,
  lockRigMvp,
  notifyRigMvp,
  pushRigMvpUpdate,
  removeRigMvp,
  RigMvpRig,
  unlockRigMvp,
} from "../../services/rigMvp.service";

async function defaultBranch() {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; code: string }>>("select id,name,code from branches order by created_at asc limit 1");
  return rows[0] ?? { id: "rig-mvp", name: "Rig-MVP", code: "RIGMVP" };
}

function zoneFromRig(rig: RigMvpRig) {
  const text = `${rig.label} ${rig.hostname} ${rig.rig_id}`.toLowerCase();
  return text.includes("vip") || text.includes("moza") ? "vip" : "main";
}

function statusFromRig(rig: RigMvpRig) {
  if (!rig.online || rig.state === "Offline") return "offline";
  if (rig.state === "Updating") return "offline";
  if (rig.locked || rig.state === "Available") return "ready_to_play";
  return "busy";
}

export async function rigToSimulatorRow(rig: RigMvpRig, options: { persist?: boolean } = {}) {
  const persist = options.persist ?? true;
  const branch = await defaultBranch();
  const zone = zoneFromRig(rig);
  const status = statusFromRig(rig);
  const name = rig.label || rig.hostname || rig.rig_id;
  const rows = persist
    ? await prisma.$queryRawUnsafe<any[]>(
      `insert into simulators(branch_id,name,code,zone,simulator_type,status,device_id,ip_address,ws_rig_id,is_online,last_seen_at)
       values($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::timestamptz)
       on conflict(branch_id,code) do update set
         name=excluded.name,
         zone=excluded.zone,
         simulator_type=excluded.simulator_type,
         status=excluded.status,
         device_id=excluded.device_id,
         ip_address=excluded.ip_address,
         ws_rig_id=excluded.ws_rig_id,
         is_online=excluded.is_online,
         last_seen_at=excluded.last_seen_at,
         updated_at=now()
       returning *`,
      branch.id,
      name,
      rig.rig_id,
      zone,
      zone,
      status,
      rig.rig_id,
      rig.hostname,
      rig.rig_id,
      rig.online,
      rig.last_seen,
    )
    : await prisma.$queryRawUnsafe<any[]>(
      "select * from simulators where branch_id=$1::uuid and code=$2 limit 1",
      branch.id,
      rig.rig_id,
    );
  const row = rows[0] ?? {
    id: rig.rig_id,
    branch_id: branch.id,
    name,
    code: rig.rig_id,
    zone,
    simulator_type: zone,
    status,
    device_id: rig.rig_id,
    ip_address: rig.hostname,
    ws_rig_id: rig.rig_id,
    is_online: rig.online,
    last_seen_at: rig.last_seen,
  };
  if (persist) {
    await prisma.$executeRawUnsafe(
      `insert into rig_connections(rig_id,simulator_id,branch_id,hostname,label,version,latest_version,locked,online,update_status,first_seen_at,last_seen_at)
       values($1,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10,$11::timestamptz,$12::timestamptz)
       on conflict(rig_id) do update set
         simulator_id=excluded.simulator_id,
         branch_id=excluded.branch_id,
         hostname=excluded.hostname,
         label=excluded.label,
         version=excluded.version,
         latest_version=excluded.latest_version,
         locked=excluded.locked,
         online=excluded.online,
         update_status=excluded.update_status,
         first_seen_at=coalesce(rig_connections.first_seen_at, excluded.first_seen_at),
         last_seen_at=excluded.last_seen_at,
         updated_at=now()`,
      rig.rig_id,
      row.id,
      branch.id,
      rig.hostname,
      name,
      rig.version,
      rig.latest_version,
      rig.locked,
      rig.online,
      rig.update_status,
      rig.first_seen,
      rig.last_seen,
    );
  }
  return {
    ...row,
    name,
    code: rig.rig_id,
    zone,
    simulator_type: zone,
    status,
    device_id: rig.rig_id,
    ip_address: rig.hostname,
    ws_rig_id: rig.rig_id,
    is_online: rig.online,
    last_seen_at: rig.last_seen,
    branch_name: branch.name,
    branch_code: branch.code,
    rig_online: rig.online,
    rig_version: rig.version,
    latest_version: rig.latest_version,
    update_status: rig.update_status,
    locked: rig.locked,
    unlock_until: rig.unlock_until,
    first_seen: rig.first_seen,
    last_seen: rig.last_seen,
    source: "rig_mvp",
  };
}

async function rigIdFromParam(id: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ ws_rig_id: string | null }>>("select ws_rig_id from simulators where id=$1::uuid limit 1", id).catch(() => []);
  return rows[0]?.ws_rig_id ?? id;
}

async function listDbSimulatorRows(requestedBranchId?: unknown, user?: Request["user"]) {
  const branchId = user?.role === "admin"
    ? user.branch_id
    : requestedBranchId && requestedBranchId !== "all"
      ? String(requestedBranchId)
      : null;

  if (user?.role === "admin" && !branchId) return [];

  return prisma.$queryRawUnsafe<any[]>(
    `select
       s.*,
       b.name as branch_name,
       b.code as branch_code,
       sess.id as active_session_id,
       sess.customer_name as active_customer_name,
       sess.phone as active_phone,
       sess.started_at as active_started_at,
       sess.duration_minutes as active_duration_minutes,
       sess.added_minutes as active_added_minutes,
       case
         when sess.id is null then null
         when sess.status = 'paused' then sess.remaining_seconds
         else greatest(((sess.duration_minutes + sess.added_minutes) * 60 - extract(epoch from (now() - sess.started_at)))::int, 0)
       end as active_remaining_seconds,
       sess.paid_amount as active_paid_amount,
       sess.payment_mode as active_payment_mode,
       t.name as active_tariff_name,
       s.is_online as rig_online,
       'backend' as rig_version,
       'backend' as latest_version,
       '' as update_status,
       (s.status = 'locked') as locked,
       null::timestamptz as unlock_until,
       s.created_at as first_seen,
       s.last_seen_at as last_seen,
       'database' as source
     from simulators s
     join branches b on b.id = s.branch_id
     left join sessions sess on sess.id = s.current_session_id and sess.status in ('active','paused','unpaid')
     left join tariffs t on t.id = sess.tariff_id
     where ($1::uuid is null or s.branch_id = $1::uuid)
     order by b.created_at asc, s.zone asc, s.code asc`,
    branchId,
  );
}

export async function listRows(requestedBranchId?: unknown, user?: Request["user"]) {
  const branch = await defaultBranch();
  const canUseRigMvp =
    (!user || user.role !== "admin" || user.branch_id === branch.id) &&
    (!requestedBranchId || requestedBranchId === "all" || requestedBranchId === branch.id);

  if (canUseRigMvp) {
    try {
      const rigs = await listRigMvpRigs();
      if (rigs.length) return Promise.all(rigs.map((rig) => rigToSimulatorRow(rig, { persist: false })));
    } catch {
      // Keep the dashboard usable from the seeded PostgreSQL data when Rig-MVP is down.
    }
  }

  return listDbSimulatorRows(requestedBranchId, user);
}

export async function list(req: Request) {
  return listRows(req.query.branch_id, req.user);
}

export const map = list;

export async function get(req: Request) {
  const rig = await getRigMvpRig(await rigIdFromParam(String(req.params.id)));
  return rigToSimulatorRow(rig, { persist: false });
}

export async function patchStatus(req: Request) {
  const rig = await getRigMvpRig(await rigIdFromParam(String(req.params.id)));
  const nextStatus = String(req.body.status ?? "");
  if (nextStatus === "locked") {
    await lockRigMvp(rig.rig_id, req.body.message ?? "LOCKED - see staff");
  } else if (["ready_to_play", "busy"].includes(nextStatus)) {
    await unlockRigMvp(rig.rig_id);
  } else if (nextStatus === "offline") {
    await removeRigMvp(rig.rig_id);
  } else {
    throw new ApiError(400, "Rig-MVP simulator status can only be locked, ready_to_play, busy, or offline");
  }

  const row = await rigToSimulatorRow(await getRigMvpRig(rig.rig_id));
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: "simulator_status_changed", entity_type: "rig_mvp", entity_id: null, details: { rig_id: rig.rig_id, to: nextStatus } });
  broadcastDashboard("simulator_updated", row, row.branch_id);
  return row;
}

async function command(req: Request, action: string, work: (rig: RigMvpRig) => Promise<unknown>) {
  const rig = await getRigMvpRig(await rigIdFromParam(String(req.params.id)));
  await work(rig);
  const row = await rigToSimulatorRow(await getRigMvpRig(rig.rig_id));
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: action, entity_type: "rig_mvp", entity_id: null, details: { rig_id: rig.rig_id } });
  broadcastDashboard("simulator_updated", row, row.branch_id);
  return { sent: true, rig_id: rig.rig_id, source: "rig_mvp" };
}

export const notify = (req: Request) => command(req, "simulator_notified", (rig) => notifyRigMvp(rig.rig_id, req.body?.message ?? "Hello"));
export const lock = (req: Request) => command(req, "simulator_locked", (rig) => lockRigMvp(rig.rig_id, req.body?.message ?? "LOCKED - see staff"));
export const unlock = (req: Request) => command(req, "simulator_unlocked", (rig) => unlockRigMvp(rig.rig_id));
export const timedUnlock = (req: Request) => command(req, "simulator_unlocked", (rig) => unlockRigMvp(rig.rig_id, Number(req.body.minutes)));

export async function reboot(_req: Request) {
  throw new ApiError(501, "Rig-MVP agent does not support reboot yet");
}

export async function requestStatus(req: Request) {
  return get(req);
}

export async function pushUpdate(req: Request) {
  return pushRigMvpUpdate(req.body.rig_ids ?? []);
}
