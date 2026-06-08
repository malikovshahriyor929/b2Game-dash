import { ApiError } from "../utils/apiError";
import { getRigSocket } from "./rigConnection.manager";
import { WebSocket } from "ws";

export function sendRigCommand(rigId: string, payload: Record<string, unknown>) {
  const rig = getRigSocket(rigId);
  if (!rig || rig.ws.readyState !== WebSocket.OPEN) throw new ApiError(409, `Rig '${rigId}' is offline`);
  rig.ws.send(JSON.stringify(payload));
}
