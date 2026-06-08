import { WebSocket } from "ws";
import { AuthUser } from "../types/auth.types";
import { DashboardSocketState } from "../types/websocket.types";

const dashboards = new Set<DashboardSocketState>();

export function addDashboard(ws: WebSocket, user: AuthUser, branchId: string | null, allBranches: boolean) {
  const state = { ws, user, branchId, allBranches };
  dashboards.add(state);
  ws.on("close", () => dashboards.delete(state));
}

export function broadcastDashboard(type: string, data: Record<string, unknown>, branchId?: string | null) {
  const payload = JSON.stringify({ type, data, created_at: new Date().toISOString() });
  for (const client of dashboards) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    if (client.user.role === "admin" && branchId && client.user.branch_id !== branchId) continue;
    if (client.user.role === "super_admin" && !client.allBranches && branchId && client.branchId !== branchId) continue;
    client.ws.send(payload);
  }
}
