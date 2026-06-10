import { env } from "../config/env";
import { expireElapsedSessions } from "../modules/sessions/sessions.service";
import { deleteRigFromDb, rigToSimulatorRow } from "../modules/simulators/simulators.service";
import { broadcastDashboard } from "../websocket/dashboardConnection.manager";
import { listRigMvpRigs } from "./rigMvp.service";

let timer: NodeJS.Timeout | null = null;
let lastSnapshot = "";
let lastPersistedSnapshot = "";
let lastPersistedAt = 0;
let lastKnownRigIds = new Set<string>();
let syncInFlight: Promise<void> | null = null;

type SyncOptions = { forcePersist?: boolean };

async function runRigMvpSyncTick(options: SyncOptions = {}) {
  await expireElapsedSessions().catch(() => undefined);
  try {
    const rigs = await listRigMvpRigs();
    const currentIds = new Set(rigs.map((rig) => rig.rig_id));
    const removedRigIds: string[] = [];

    if (lastKnownRigIds.size > 0) {
      for (const rigId of lastKnownRigIds) {
        if (!currentIds.has(rigId)) {
          await deleteRigFromDb(rigId);
          removedRigIds.push(rigId);
        }
      }
    }
    lastKnownRigIds = currentIds;

    const rows = await Promise.all(rigs.map((rig) => rigToSimulatorRow(rig, { persist: false })));
    const snapshot = JSON.stringify(rigs.map((rig) => ({
      rig_id: rig.rig_id,
      online: rig.online,
      locked: rig.locked,
      state: rig.state,
      version: rig.version,
      update_status: rig.update_status,
      unlock_until: rig.unlock_until,
      last_seen: rig.last_seen,
    })));
    const now = Date.now();
    const shouldPersist = options.forcePersist || snapshot !== lastPersistedSnapshot;
    if (shouldPersist && (options.forcePersist || now - lastPersistedAt >= env.RIG_MVP_DB_SYNC_INTERVAL_MS)) {
      await Promise.all(rigs.map((rig) => rigToSimulatorRow(rig, { persist: true })));
      lastPersistedSnapshot = snapshot;
      lastPersistedAt = now;
    }
    if (removedRigIds.length) {
      broadcastDashboard("simulator_offline", { source: "rig_mvp", removed_rig_ids: removedRigIds }, null);
    } else if (!lastSnapshot || snapshot !== lastSnapshot) {
      broadcastDashboard("simulator_updated", { source: "rig_mvp", rigs, simulators: rows }, null);
    }
    lastSnapshot = snapshot;
  } catch {
    if (lastSnapshot) {
      lastSnapshot = "";
      broadcastDashboard("simulator_updated", { source: "rig_mvp", offline: true }, null);
    }
  }
}

export function triggerRigMvpSync(options?: SyncOptions) {
  if (!syncInFlight) {
    syncInFlight = runRigMvpSyncTick(options).finally(() => {
      syncInFlight = null;
    });
  }
  return syncInFlight;
}

export function startRigMvpSync() {
  if (timer) return;

  void triggerRigMvpSync();
  timer = setInterval(() => {
    void triggerRigMvpSync();
  }, env.RIG_MVP_SYNC_INTERVAL_MS);
}
