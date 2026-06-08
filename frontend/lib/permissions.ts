import { Role } from "@/types/user";

export const roleAccess: Record<Role, string[]> = {
  admin: ["dashboard", "simulators", "cashier", "bookings", "customers", "shop", "tariffs", "games", "logs", "support"],
  super_admin: ["dashboard", "simulators", "cashier", "bookings", "customers", "shop", "tariffs", "games", "logs", "promo", "reports", "analytics", "support", "settings"],
};

export function canAccess(role: Role | undefined, key: string) {
  if (!role) return false;
  return roleAccess[role]?.includes(key) ?? false;
}

export function canUseAction(role: Role | undefined, action: string) {
  if (role === "super_admin") return true;
  if (role === "admin") {
    return ["start", "addTime", "payment", "stop", "booking", "shop", "requestFix", "startFix", "markFixed", "lock"].includes(action);
  }
  return false;
}

export function isSuperAdmin(role: Role | undefined) {
  return role === "super_admin";
}
