import { NextFunction, Request, Response } from "express";
import { Role } from "../types/auth.types";
import { ApiError } from "../utils/apiError";

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Insufficient role"));
    next();
  };
}
