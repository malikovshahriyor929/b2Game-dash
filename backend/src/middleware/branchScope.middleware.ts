import { NextFunction, Request, Response } from "express";
import { baseRole } from "../types/auth.types";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/ids";

export function requireBranchScope(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(401, "Authentication required"));

  // admin and dev_admin are locked to their assigned branch; (dev_)super_admin is global.
  if (baseRole(req.user.role) === "admin") {
    if (!req.user.branch_id) return next(new ApiError(403, "Admin has no assigned branch"));
    req.branchScope = { branchId: req.user.branch_id, allBranches: false };
    return next();
  }

  const requested = String(req.query.branch_id ?? req.body?.branch_id ?? "all");
  if (requested && requested !== "all" && !isUuid(requested)) {
    return next(new ApiError(400, "Invalid branch_id"));
  }
  req.branchScope = {
    branchId: requested && requested !== "all" ? requested : null,
    allBranches: !requested || requested === "all",
  };
  next();
}

export function scopedBranchId(req: Request) {
  if (!req.branchScope) throw new ApiError(500, "Branch scope middleware missing");
  if (!req.branchScope.allBranches && !req.branchScope.branchId) throw new ApiError(403, "Branch scope required");
  return req.branchScope.branchId;
}
