import { env } from "../config/env";
import { deleteRigFromDb, rigToSimulatorRow } from "../modules/simulators/simulators.service";
import { broadcastDashboard } from "../websocket/dashboardConnection.manager";
import { listRigMvpRigs } from "./rigMvp.service";

let timer: NodeJS.Timeout | null = null;
let lastSnapshot = "";
let lastPersistedSnapshot = "";
let lastPersistedAt = 0;
let lastKnownRigIds = new Set<string>();

export function startRigMvpSync() {
  if (timer) return;

  const tick = async () => {
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
      if (snapshot !== lastPersistedSnapshot && now - lastPersistedAt >= env.RIG_MVP_DB_SYNC_INTERVAL_MS) {
        await Promise.all(rigs.map((rig) => rigToSimulatorRow(rig, { persist: true })));
        lastPersistedSnapshot = snapshot;
        lastPersistedAt = now;
      }
      if (removedRigIds.length) {
        broadcastDashboard("simulator_offline", { source: "rig_mvp", removed_rig_ids: removedRigIds }, null);
      } else if (lastSnapshot && snapshot !== lastSnapshot) {
        broadcastDashboard("simulator_updated", { source: "rig_mvp", rigs, simulators: rows }, null);
      }
      lastSnapshot = snapshot;
    } catch {
      if (lastSnapshot) {
        lastSnapshot = "";
        broadcastDashboard("simulator_updated", { source: "rig_mvp", offline: true }, null);
      }
    }
  };

  void tick();
  timer = setInterval(tick, env.RIG_MVP_SYNC_INTERVAL_MS);
}
