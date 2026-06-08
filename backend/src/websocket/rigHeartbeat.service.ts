import { env } from "../config/env";
import { markStaleRigsOffline } from "./rigConnection.manager";

let timer: NodeJS.Timeout | null = null;

export function startRigHeartbeatMonitor() {
  if (timer) return;
  timer = setInterval(() => void markStaleRigsOffline(), env.WS_HEARTBEAT_INTERVAL_MS);
}
