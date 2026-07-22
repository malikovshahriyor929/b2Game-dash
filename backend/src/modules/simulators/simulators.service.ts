import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { isUuid } from "../../utils/ids";
import { filterRigsForScope, resolveRigBranch } from "../../services/rigBranch.service";
import {
  availableRigMvp,
  getRigMvpRig,
  listRigMvpRigs,
  lockRigMvp,
  notifyRigMvp,
  pushRigMvpUpdate,
  removeRigMvp,
  RigMvpRig,
  sendRigMvpCommand,
  unlockRigMvp,
} from "../../services/rigMvp.service";
import { requireOpenShiftOwner } from "../shifts/shift.guard";
import { openSessionAmountSql, openSessionSegmentsSql } from "../../utils/openSessionBilling";

function zoneFromRig(rig: RigMvpRig) {
  const text = `${rig.label} ${rig.hostname} ${rig.rig_id}`.toLowerCase();
  return text.includes("vip") || text.includes("moza") ? "vip" : "main";
}

function statusFromRig(rig: RigMvpRig) {
  if (!rig.online || rig.state === "Offline") return "offline";
  if (rig.state === "Updating") return "offline";
  if (rig.locked || rig.state === "Available") return "ready_to_play";
  // Rig-MVP's "In use" is a device-level signal (for example a stale desktop
  // process), not proof that this dashboard has a customer session.  Session
  // status is decided from the sessions table below.
  return "ready_to_play";
}

function normalizedRigKeys(rig: RigMvpRig) {
  return [rig.rig_id, rig.label, rig.hostname]
    .map((value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean);
}

async function findExistingSimulatorForRig(rig: RigMvpRig, branchId: string) {
  const keys = normalizedRigKeys(rig);
  if (!keys.length) return null;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select *
     from simulators
     where branch_id=$1::uuid
       and (
         ws_rig_id=$2
         or code=$2
         or device_id=$2
         or lower(regexp_replace(coalesce(name,''), '[^a-z0-9]+', '', 'g')) = any($3::text[])
         or lower(regexp_replace(coalesce(code,''), '[^a-z0-9]+', '', 'g')) = any($3::text[])
         or lower(regexp_replace(coalesce(device_id,''), '[^a-z0-9]+', '', 'g')) = any($3::text[])
       )
     order by
       case
         when ws_rig_id=$2 then 0
         when code=$2 then 1
         when device_id=$2 then 2
         else 3
       end,
       updated_at desc
     limit 1`,
    branchId,
    rig.rig_id,
    keys,
  );
  return rows[0] ?? null;
}

export async function rigToSimulatorRow(rig: RigMvpRig, options: { persist?: boolean } = {}) {
  const persist = options.persist ?? true;
  const branch = await resolveRigBranch(rig);
  const zone = zoneFromRig(rig);
  const name = rig.label || rig.hostname || rig.rig_id;
  const existing = await findExistingSimulatorForRig(rig, branch.id);
  const hasActiveSession = existing?.current_session_id
    ? Boolean((await prisma.$queryRawUnsafe<any[]>(
      "select id from sessions where id=$1::uuid and status in ('active','paused','unpaid') limit 1",
      existing.current_session_id,
    ))[0])
    : false;
  // The database is the source of truth for customer occupancy. This prevents a
  // stale rig state from creating a ghost "Band" card with no session details.
  const status = hasActiveSession ? "busy" : statusFromRig(rig);
  const rows = persist
    ? existing
      ? await prisma.$queryRawUnsafe<any[]>(
        `update simulators
         set name=$2,
             zone=$3,
             simulator_type=$4,
             status=$5,
             device_id=$6,
             ip_address=$7,
             ws_rig_id=$8,
             is_online=$9,
             last_seen_at=$10::timestamptz,
             updated_at=now()
         where id=$1::uuid
         returning *`,
        existing.id,
        name,
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
    : existing ? [existing] : [];
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
  const enriched = await enrichSimulatorWithActiveSession({
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
  });
  return enriched;
}

async function rigIdFromParam(id: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ ws_rig_id: string | null }>>("select ws_rig_id from simulators where id=$1::uuid limit 1", id).catch(() => []);
  return rows[0]?.ws_rig_id ?? id;
}

async function simulatorIdFromParam(id: string, user?: Request["user"]) {
  const branchId = baseRole(user?.role) === "admin" ? (user?.branch_id ?? null) : null;
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      "select id from simulators where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid) limit 1",
      id,
      branchId,
    );
    if (rows[0]?.id) return rows[0].id;
  }
  const key = id.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `select id
     from simulators
     where ($1::uuid is null or branch_id=$1::uuid)
       and (
         ws_rig_id=$2
         or code=$2
         or device_id=$2
         or lower(regexp_replace(coalesce(name,''), '[^a-z0-9]+', '', 'g'))=$3
         or lower(regexp_replace(coalesce(code,''), '[^a-z0-9]+', '', 'g'))=$3
         or lower(regexp_replace(coalesce(device_id,''), '[^a-z0-9]+', '', 'g'))=$3
       )
     order by updated_at desc
     limit 1`,
    branchId,
    id,
    key,
  );
  return rows[0]?.id ?? null;
}

export async function deleteRigFromDb(rigId: string) {
  const connections = await prisma.$queryRawUnsafe<Array<{ simulator_id: string | null; branch_id: string | null }>>(
    "select simulator_id, branch_id from rig_connections where rig_id=$1",
    rigId,
  );
  const branchId = connections[0]?.branch_id ?? null;
  await prisma.$executeRawUnsafe("delete from rig_connections where rig_id=$1", rigId);
  for (const connection of connections) {
    if (!connection.simulator_id) continue;
    const simRows = await prisma.$queryRawUnsafe<Array<{ id: string; code: string }>>(
      "select id, code from simulators where id=$1::uuid",
      connection.simulator_id,
    );
    const sim = simRows[0];
    if (!sim) continue;
    if (sim.code === rigId) {
      await prisma.$executeRawUnsafe("delete from simulators where id=$1::uuid", sim.id);
    } else {
      await prisma.$executeRawUnsafe(
        "update simulators set ws_rig_id=null, is_online=false, status='offline', updated_at=now() where id=$1::uuid",
        sim.id,
      );
    }
  }
  await prisma.$executeRawUnsafe("delete from simulators where ws_rig_id=$1 and code=$2", rigId, rigId);
  return { rig_id: rigId, branch_id: branchId };
}

const activeSessionSelect = `
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
  sess.session_amount as active_session_amount,
  sess.added_time_amount as active_added_time_amount,
  sess.shop_amount as active_shop_amount,
  sess.total_amount as active_total_amount,
  sess.debt_amount as active_debt_amount,
  sess.paid_amount as active_paid_amount,
  sess.payment_mode as active_payment_mode,
  sess.billing_mode as active_billing_mode,
  sess.hourly_rate as active_hourly_rate,
  case when sess.billing_mode = 'open' then extract(epoch from (now() - sess.started_at))::int else null end as active_elapsed_seconds,
  case when sess.billing_mode = 'open' then ${openSessionAmountSql("sess")} else null end as active_accrued_amount,
  case when sess.billing_mode = 'open' then ${openSessionSegmentsSql("sess")} else null end as active_billing_segments,
  t.name as active_tariff_name`;

async function enrichSimulatorWithActiveSession(row: Record<string, any>) {
  if (!row?.id || !/^[0-9a-f-]{36}$/i.test(String(row.id))) return row;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select ${activeSessionSelect}
     from simulators s
     left join sessions sess on sess.id = s.current_session_id and sess.status in ('active','paused','unpaid')
     left join tariffs t on t.id = sess.tariff_id
     where s.id = $1::uuid
     limit 1`,
    row.id,
  );
  const session = rows[0];
  if (!session?.active_session_id) return row;
  return {
    ...row,
    ...session,
    status: row.status === "offline" ? "offline" : "busy",
  };
}

async function listDbSimulatorRows(requestedBranchId?: unknown, user?: Request["user"]) {
  const branchId = baseRole(user?.role) === "admin"
    ? (user?.branch_id ?? null)
    : requestedBranchId && requestedBranchId !== "all"
      ? String(requestedBranchId)
      : null;

  if (baseRole(user?.role) === "admin" && !branchId) return [];

  // Every admin sees all simulators in their branch (branch-scoped, not per-admin).
  return prisma.$queryRawUnsafe<any[]>(
    `select
       s.*,
       b.name as branch_name,
       b.code as branch_code,
       ${activeSessionSelect},
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
  try {
    const rigs = await filterRigsForScope(await listRigMvpRigs(), requestedBranchId, user);
    // Every admin sees all simulators in their branch (scoped above), not just assigned ones.
    return await Promise.all(rigs.map((rig) => rigToSimulatorRow(rig)));
  } catch {
    // Keep the dashboard usable from the seeded PostgreSQL data when Rig-MVP is down.
  }

  return listDbSimulatorRows(requestedBranchId, user);
}

export async function assignable(_req: Request) {
  return prisma.$queryRawUnsafe<any[]>(
    `select s.id, s.name, s.code, s.zone, b.name as branch_name,
       coalesce(array_agg(sa.admin_id::text) filter (where sa.admin_id is not null), '{}') as assigned_admin_ids
     from simulators s
     join branches b on b.id = s.branch_id
     left join simulator_admins sa on sa.simulator_id = s.id
     group by s.id, s.name, s.code, s.zone, b.name
     order by b.name asc, s.zone asc, s.code asc`,
  );
}

export async function setAdminAssignments(req: Request) {
  const adminId = String(req.body.admin_id ?? "");
  if (!isUuid(adminId)) throw new ApiError(400, "admin_id is required");
  const simulatorIds = (Array.isArray(req.body.simulator_ids) ? req.body.simulator_ids : []).map(String).filter(isUuid);
  const admin = (await prisma.$queryRawUnsafe<Array<{ id: string }>>("select id from users where id=$1::uuid and role='admin' limit 1", adminId))[0];
  if (!admin) throw new ApiError(404, "Admin not found");
  // Reset this admin's assignments, then assign the selected simulators (many-to-many:
  // a simulator may be assigned to several admins).
  await prisma.$executeRawUnsafe("delete from simulator_admins where admin_id=$1::uuid", adminId);
  if (simulatorIds.length) {
    await prisma.$executeRawUnsafe(
      "insert into simulator_admins(simulator_id, admin_id) select unnest($2::uuid[]), $1::uuid on conflict do nothing",
      adminId,
      simulatorIds,
    );
  }
  await auditLog({ actor: req.user, branch_id: null, action_type: "simulator_assignments_set", entity_type: "user", entity_id: adminId, details: { count: simulatorIds.length } });
  broadcastDashboard("simulators_reassigned", { admin_id: adminId, count: simulatorIds.length }, null);
  return { admin_id: adminId, simulator_ids: simulatorIds };
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
  } else if (nextStatus === "ready_to_play") {
    await availableRigMvp(rig.rig_id);
  } else if (nextStatus === "busy") {
    await unlockRigMvp(rig.rig_id);
  } else if (nextStatus === "offline") {
    const branchId = (await prisma.$queryRawUnsafe<Array<{ branch_id: string | null }>>(
      "select branch_id from rig_connections where rig_id=$1 limit 1",
      rig.rig_id,
    ))[0]?.branch_id ?? null;
    await removeRigMvp(rig.rig_id);
    const removed = await deleteRigFromDb(rig.rig_id);
    await auditLog({ actor: req.user, branch_id: removed.branch_id ?? branchId, action_type: "rig_removed", entity_type: "rig_mvp", entity_id: null, details: { rig_id: rig.rig_id } });
    broadcastDashboard("simulator_offline", { rig_id: rig.rig_id, removed: true }, removed.branch_id);
    return { ok: true, rig_id: rig.rig_id, removed: true };
  } else {
    throw new ApiError(400, "Rig-MVP simulator status can only be locked, ready_to_play, busy, or offline");
  }

  const row = await rigToSimulatorRow(await getRigMvpRig(rig.rig_id));
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: "simulator_status_changed", entity_type: "rig_mvp", entity_id: null, details: { rig_id: rig.rig_id, to: nextStatus } });
  broadcastDashboard("simulator_updated", row, row.branch_id);
  return row;
}

export async function updateMapPosition(req: Request) {
  const position = req.body?.map_position ?? req.body;
  if (!position || typeof position !== "object" || Array.isArray(position)) throw new ApiError(400, "map_position is required");
  const col = Number(position.col);
  const row = Number(position.row);
  const colSpan = Number(position.colSpan ?? 1);
  const rowSpan = Number(position.rowSpan ?? 1);
  if (![col, row, colSpan, rowSpan].every(Number.isFinite) || col < 1 || row < 1 || colSpan < 1 || rowSpan < 1) {
    throw new ApiError(400, "map_position must include positive col, row, colSpan and rowSpan values");
  }
  const normalized = {
    floor: String(position.floor ?? "0"),
    col,
    row,
    colSpan,
    rowSpan,
  };
  const simulatorId = await simulatorIdFromParam(String(req.params.id), req.user);
  if (!simulatorId) throw new ApiError(404, "Simulator not found");
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `update simulators
     set map_position=$1::jsonb, updated_at=now()
     where id=$2::uuid and ($3::uuid is null or branch_id=$3::uuid)
     returning *`,
    JSON.stringify(normalized),
    simulatorId,
    baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : null,
  );
  if (!rows.length) throw new ApiError(404, "Simulator not found");
  broadcastDashboard("simulator_updated", rows[0], rows[0].branch_id);
  return rows[0];
}

async function command(req: Request, action: string, work: (rig: RigMvpRig) => Promise<unknown>) {
  const rig = await getRigMvpRig(await rigIdFromParam(String(req.params.id)));
  const currentRow = await rigToSimulatorRow(rig);
  if (baseRole(req.user?.role) === "admin" && currentRow.branch_id !== (req.user?.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  await requireOpenShiftOwner(currentRow.branch_id, req);
  await work(rig);
  const row = await rigToSimulatorRow(await getRigMvpRig(rig.rig_id));
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: action, entity_type: "rig_mvp", entity_id: null, details: { rig_id: rig.rig_id } });
  broadcastDashboard("simulator_updated", row, row.branch_id);
  return { sent: true, rig_id: rig.rig_id, source: "rig_mvp" };
}

export const notify = (req: Request) => command(req, "simulator_notified", (rig) => notifyRigMvp(rig.rig_id, req.body?.message ?? "Hello"));
export const lock = (req: Request) => command(req, "simulator_locked", (rig) => lockRigMvp(rig.rig_id, req.body?.message ?? "LOCKED - see staff"));
export const available = (req: Request) => command(req, "simulator_available", (rig) => availableRigMvp(rig.rig_id));
export const unlock = (req: Request) => command(req, "simulator_unlocked", (rig) => unlockRigMvp(rig.rig_id));
export const timedUnlock = (req: Request) => command(req, "simulator_unlocked", (rig) => unlockRigMvp(rig.rig_id, Number(req.body.minutes)));

export async function terminalCommand(req: Request) {
  if (req.user?.role !== "dev_admin") throw new ApiError(403, "Dev admin access required");
  const commandText = String(req.body?.command ?? "").trim();
  if (!commandText) throw new ApiError(400, "command is required");
  if (commandText.length > 4000) throw new ApiError(400, "command is too long");
  const timeoutSeconds = Math.max(1, Math.min(Number(req.body?.timeout_seconds ?? 30) || 30, 120));
  const rig = await getRigMvpRig(await rigIdFromParam(String(req.params.id)));
  const currentRow = await rigToSimulatorRow(rig);
  if (currentRow.branch_id !== (req.user.branch_id ?? null)) throw new ApiError(403, "Branch scope violation");
  const result = await sendRigMvpCommand(rig.rig_id, {
    command: commandText,
    timeout_seconds: timeoutSeconds,
  });
  await auditLog({
    actor: req.user,
    branch_id: currentRow.branch_id,
    action_type: "rig_terminal_command",
    entity_type: "rig_mvp",
    entity_id: null,
    details: {
      rig_id: rig.rig_id,
      command: commandText.slice(0, 500),
      timeout_seconds: timeoutSeconds,
      return_code: result.return_code,
      timed_out: result.timed_out,
    },
  });
  return { ...result, rig_id: rig.rig_id };
}

export async function reboot(_req: Request) {
  throw new ApiError(501, "Rig-MVP agent does not support reboot yet");
}

export async function requestStatus(req: Request) {
  return get(req);
}

export async function pushUpdate(req: Request) {
  const rigIds = req.body.simulator_ids ?? req.body.rig_ids ?? [];
  return pushRigMvpUpdate(rigIds);
}
