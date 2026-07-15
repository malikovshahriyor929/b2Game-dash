import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { addDashboard } from "./dashboardConnection.manager";
import { disconnectRig, markRigHeartbeat, registerRig } from "./rigConnection.manager";
import { startRigHeartbeatMonitor } from "./rigHeartbeat.service";
import { verifyWsToken } from "./websocketAuth";
import { listRows as listSimulatorRows } from "../modules/simulators/simulators.service";

export function attachWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/ws/dashboard") {
      const protocolToken = String(req.headers["sec-websocket-protocol"] ?? "")
        .split(",")
        .map((item) => item.trim())
        .find((item) => item.startsWith("auth."))
        ?.slice(5);
      const user = verifyWsToken(protocolToken ?? url.searchParams.get("token"));
      if (!user) return ws.close(1008, "Unauthorized");
      const branchId = url.searchParams.get("branch_id");
      addDashboard(ws, user, branchId, branchId === "all" || !branchId);
      ws.send(JSON.stringify({ type: "connected", data: { user_id: user.user_id } }));
      void listSimulatorRows(branchId, user)
        .then((simulators) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "simulators_snapshot", data: { simulators }, created_at: new Date().toISOString() }));
        })
        .catch(() => undefined);
      return;
    }

    if (url.pathname !== "/ws/rig") return ws.close(1002, "Unknown websocket path");
    let rigId: string | null = null;
    ws.once("message", async (buffer) => {
      try {
        const msg = JSON.parse(buffer.toString());
        if (msg.type !== "hello" || !msg.rig_id) return ws.close(1002, "Invalid hello");
        rigId = msg.rig_id;
        await registerRig(ws, msg);
        ws.send(JSON.stringify({ type: "ack", message: "hello accepted" }));
      } catch {
        ws.close(1002, "Invalid message");
      }
    });

    ws.on("message", async (buffer) => {
      try {
        const msg = JSON.parse(buffer.toString());
        if (!rigId || msg.type === "hello") return;
        if (["heartbeat", "pong", "ack", "status"].includes(msg.type)) await markRigHeartbeat(rigId);
        if (msg.type === "update_started") await markRigHeartbeat(rigId, { update_status: `pushing ${msg.version ?? "?"}` });
        if (msg.type === "update_failed") await markRigHeartbeat(rigId, { update_status: `failed: ${msg.error ?? "unknown"}` });
        if (msg.type === "update_completed") await markRigHeartbeat(rigId, { update_status: "" });
      } catch {}
    });
    ws.on("close", () => rigId && void disconnectRig(rigId));
  });

  startRigHeartbeatMonitor();
}
