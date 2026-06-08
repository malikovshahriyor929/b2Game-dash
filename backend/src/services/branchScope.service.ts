import { Request } from "express";
import { ApiError } from "../utils/apiError";

export function branchWhere(req: Request, alias = "") {
  if (!req.branchScope) throw new ApiError(500, "Branch scope missing");
  const col = `${alias ? `${alias}.` : ""}branch_id`;
  if (req.branchScope.allBranches) return { clause: "1=1", values: [] as unknown[] };
  return { clause: `${col} = $1`, values: [req.branchScope.branchId] as unknown[] };
}

export function writeBranchId(req: Request) {
  if (!req.branchScope) throw new ApiError(500, "Branch scope missing");
  if (req.user?.role === "admin") return req.user.branch_id!;
  const bodyBranch = req.body?.branch_id;
  if (!bodyBranch || bodyBranch === "all") throw new ApiError(400, "branch_id is required for this write");
  return bodyBranch;
}
