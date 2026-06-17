// Hidden developer roles: same powers as their base role, but invisible to plain
// branch admins (filtered out of the users list and the audit logs). Super admins
// (super_admin, dev_super_admin) and developers themselves can see and manage them.
//   dev_admin       -> mirrors "admin"       (branch-scoped)
//   dev_super_admin -> mirrors "super_admin" (global)
export type Role = "admin" | "super_admin" | "dev_admin" | "dev_super_admin";

// SQL list of the hidden developer roles (kept in one place).
export const DEV_ROLES = ["dev_admin", "dev_super_admin"] as const;

export function isDevRole(role?: string | null): boolean {
  return role === "dev_admin" || role === "dev_super_admin";
}

// Who may see and manage the hidden developer accounts/activity: developers
// themselves plus any super admin. Only a plain branch admin is kept in the dark.
export function canSeeDev(role?: string | null): boolean {
  return isDevRole(role) || baseRole(role) === "super_admin";
}

// Effective base role used for access gating and branch scoping.
export function baseRole(role?: string | null): "admin" | "super_admin" {
  return role === "super_admin" || role === "dev_super_admin" ? "super_admin" : "admin";
}

export type JwtPayload = {
  user_id: string;
  role: Role;
  branch_id: string | null;
  email: string;
};

export type AuthUser = JwtPayload & {
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      branchScope?: {
        branchId: string | null;
        allBranches: boolean;
      };
    }
  }
}
