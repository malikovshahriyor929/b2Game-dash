import { WebSocket } from "ws";
import { AuthUser } from "./auth.types";

export type RigHelloMessage = {
  type: "hello";
  rig_id: string;
  simulator_code?: string;
  branch_code?: string;
  hostname?: string;
  label?: string;
  version?: string;
  locked?: boolean;
  lock_message?: string;
};

export type RigSocketState = {
  ws: WebSocket;
  rigId: string;
  simulatorId: string | null;
  branchId: string | null;
  lastHeartbeatAt: number;
};

export type DashboardSocketState = {
  ws: WebSocket;
  user: AuthUser;
  branchId: string | null;
  allBranches: boolean;
};
