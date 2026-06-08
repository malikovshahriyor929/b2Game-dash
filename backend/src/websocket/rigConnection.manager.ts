import { WebSocket } from "ws";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { RigHelloMessage, RigSocketState } from "../types/websocket.types";
import { broadcastDashboard } from "./dashboardConnection.manager";
import { auditLog } from "../services/auditLog.service";

const rigs = new Map<string, RigSocketState>();

export function getRigSocket(rigId: string) {
  return rigs.get(rigId);
}

export async function registerRig(ws: WebSocket, hello: RigHelloMessage) {
  const now = new Date();
  const simulatorRows =
    hello.simulator_code && hello.branch_code
      ? await prisma.$queryRawUnsafe<
          Array<{ id: string; branch_id: string; status: string }>
        >(
          "select s.* from simulators s join branches b on b.id=s.branch_id where s.code=$1 and b.code=$2 limit 1",
          hello.simulator_code,
          hello.branch_code,
        )
      : [];
  const simulator = simulatorRows[0];
  const rigId = hello.rig_id;
  const hostname = hello.hostname ?? rigId;
  const label = hello.label ?? hostname;
  const version = hello.version ?? "unknown";

  rigs.get(rigId)?.ws.close();
  rigs.set(rigId, {
    ws,
    rigId,
    simulatorId: simulator?.id ?? null,
    branchId: simulator?.branch_id ?? null,
    lastHeartbeatAt: Date.now(),
  });

  await prisma.$executeRawUnsafe(
    `insert into rig_connections(rig_id,simulator_id,branch_id,hostname,label,version,latest_version,locked,lock_message,online,first_seen_at,last_seen_at)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$10)
     on conflict(rig_id) do update set simulator_id=excluded.simulator_id, branch_id=excluded.branch_id, hostname=excluded.hostname, label=excluded.label, version=excluded.version, latest_version=excluded.latest_version, online=true, last_seen_at=excluded.last_seen_at`,
    rigId,
    simulator?.id ?? null,
    simulator?.branch_id ?? null,
    hostname,
    label,
    version,
    env.LATEST_AGENT_VERSION,
    Boolean(hello.locked),
    hello.lock_message ?? null,
    now,
  );

  if (simulator) {
    await prisma.$executeRawUnsafe(
      "update simulators set is_online=true, ws_rig_id=$1, last_seen_at=now(), status=case when status='offline' then 'ready_to_play' else status end where id=$2",
      rigId,
      simulator.id,
    );
  }

  await auditLog({
    branch_id: simulator?.branch_id ?? null,
    action_type: "rig_connected",
    entity_type: "rig_connection",
    details: { rig_id: rigId, label, version },
  });
  broadcastDashboard(
    "simulator_online",
    { rig_id: rigId, simulator_id: simulator?.id ?? null },
    simulator?.branch_id ?? null,
  );
}

export async function markRigHeartbeat(
  rigId: string,
  patch: Record<string, unknown> = {},
) {
  const state = rigs.get(rigId);
  if (state) state.lastHeartbeatAt = Date.now();
  await prisma.$executeRawUnsafe(
    "update rig_connections set last_seen_at=now(), update_status=coalesce($2, update_status) where rig_id=$1",
    rigId,
    patch.update_status ?? null,
  );
  if (state?.simulatorId)
    await prisma.$executeRawUnsafe(
      "update simulators set last_seen_at=now(), is_online=true where id=$1",
      state.simulatorId,
    );
}

export async function disconnectRig(rigId: string) {
  const state = rigs.get(rigId);
  rigs.delete(rigId);
  await prisma.$executeRawUnsafe(
    "update rig_connections set online=false, last_seen_at=now() where rig_id=$1",
    rigId,
  );
  if (state?.simulatorId)
    await prisma.$executeRawUnsafe(
      "update simulators set is_online=false, status=case when status in ('busy','locked') then status else 'offline' end where id=$1",
      state.simulatorId,
    );
  await auditLog({
    branch_id: state?.branchId ?? null,
    action_type: "rig_disconnected",
    entity_type: "rig_connection",
    details: { rig_id: rigId },
  });
  broadcastDashboard(
    "simulator_offline",
    { rig_id: rigId, simulator_id: state?.simulatorId ?? null },
    state?.branchId ?? null,
  );
}

export async function markStaleRigsOffline() {
  const now = Date.now();
  for (const [rigId, state] of rigs) {
    if (now - state.lastHeartbeatAt > env.WS_OFFLINE_AFTER_MS) {
      try {
        state.ws.close();
      } catch {}
      await disconnectRig(rigId);
    }
  }
}
