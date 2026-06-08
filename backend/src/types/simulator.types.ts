export type SimulatorStatus = "ready_to_play" | "busy" | "reserved" | "unpaid" | "broken" | "repair_requested" | "repair_approved" | "fixing" | "fixed_waiting_confirmation" | "offline" | "locked";
export type SimulatorRow = {
  id: string;
  branch_id: string;
  name: string;
  code: string;
  zone: "main" | "vip";
  simulator_type: "main" | "vip";
  status: SimulatorStatus;
  device_id: string | null;
  ip_address: string | null;
  ws_rig_id: string | null;
  is_online: boolean;
  current_session_id: string | null;
};
