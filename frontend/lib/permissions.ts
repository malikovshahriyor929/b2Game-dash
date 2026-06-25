import { Role } from "@/types/user";

const adminAccess = ["dashboard", "simulators", "cashier", "bookings", "customers", "tariffs", "games", "logs", "reports", "support"];
const superAdminAccess = ["dashboard", "simulators", "cashier", "bookings", "customers", "tariffs", "games", "logs", "promo", "reports", "analytics", "maintenance", "support", "settings"];

// Developer roles share the access surface of the base role they mirror.
export const roleAccess: Record<Role, string[]> = {
  admin: adminAccess,
  dev_admin: adminAccess,
  super_admin: superAdminAccess,
  dev_super_admin: superAdminAccess,
};

export function canAccess(role: Role | undefined, key: string) {
  if (!role) return false;
  return roleAccess[role]?.includes(key) ?? false;
}

export function canUseAction(role: Role | undefined, action: string) {
  if (role === "super_admin" || role === "dev_super_admin") return true;
  if (role === "admin" || role === "dev_admin") {
    return ["start", "addTime", "payment", "stop", "booking", "shop", "openMaintenance", "closeMaintenance", "lock"].includes(action);
  }
  return false;
}

export function isSuperAdmin(role: Role | undefined) {
  return role === "super_admin" || role === "dev_super_admin";
}
