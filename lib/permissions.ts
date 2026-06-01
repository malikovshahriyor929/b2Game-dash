import { Role } from "@/types/user";

export const roleAccess: Record<Role, string[]> = {
  Admin: ["dashboard", "simulators", "cashier", "bookings", "customers", "shop", "tariffs", "games", "logs", "promo", "reports", "analytics", "support", "settings"],
  Cashier: ["dashboard", "simulators", "cashier", "bookings", "shop", "reports", "support"],
  Operator: ["dashboard", "simulators", "bookings", "support"],
  Technician: ["dashboard", "simulators", "logs", "support", "settings"],
};

export function canAccess(role: Role | undefined, key: string) {
  if (!role) return false;
  return roleAccess[role]?.includes(key) ?? false;
}

export function canUseAction(role: Role | undefined, action: string) {
  if (role === "Admin") return true;
  if (role === "Cashier") return ["start", "addTime", "payment", "stop", "booking", "shop"].includes(action);
  if (role === "Operator") return ["start", "addTime", "stop", "booking", "support"].includes(action);
  if (role === "Technician") return ["lock", "reboot", "maintenance", "logs"].includes(action);
  return false;
}
