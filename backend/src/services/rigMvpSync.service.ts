import { env } from "../config/env";
import { rigToSimulatorRow } from "../modules/simulators/simulators.service";
import { broadcastDashboard } from "../websocket/dashboardConnection.manager";
import { listRigMvpRigs } from "./rigMvp.service";

let timer: NodeJS.Timeout | null = null;
let lastSnapshot = "";

export function startRigMvpSync() {
  if (timer) return;

  const tick = async () => {
    try {
      const rigs = await listRigMvpRigs();
      const rows = await Promise.all(rigs.map(rigToSimulatorRow));
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
      if (lastSnapshot && snapshot !== lastSnapshot) {
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
