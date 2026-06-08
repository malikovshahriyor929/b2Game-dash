export type Role = "admin" | "super_admin";

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
