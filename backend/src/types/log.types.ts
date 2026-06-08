export type AuditAction =
  | "login" | "logout" | "start_session" | "add_time" | "pause_session" | "resume_session" | "stop_session"
  | "payment_created" | "sale_created" | "product_scanned" | "inventory_decreased"
  | "repair_requested" | "repair_approved" | "repair_rejected" | "fixing_started" | "marked_fixed" | "confirmed_fixed"
  | "booking_created" | "booking_cancelled" | "shift_opened" | "shift_closed"
  | "simulator_locked" | "simulator_unlocked" | "simulator_rebooted" | "rig_connected" | "rig_disconnected" | "settings_updated";
