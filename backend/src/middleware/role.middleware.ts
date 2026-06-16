import { NextFunction, Request, Response } from "express";
import { baseRole, Role } from "../types/auth.types";
import { ApiError } from "../utils/apiError";

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    // Developer roles inherit their base role's gates: dev_super_admin == super_admin,
    // dev_admin == admin.
    const effective = baseRole(req.user.role);
    if (roles.includes(req.user.role) || roles.includes(effective)) return next();
    next(new ApiError(403, "Insufficient role"));
  };
}
