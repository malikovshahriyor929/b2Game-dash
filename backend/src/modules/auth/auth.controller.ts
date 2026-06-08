import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/apiResponse";
import * as service from "./auth.service";
import { auditLog } from "../../services/auditLog.service";

export const login = asyncHandler(async (req, res) => ok(res, await service.login(req.body.email, req.body.password)));
export const refresh = asyncHandler(async (req, res) => ok(res, await service.refresh(req.body.refresh_token)));
export const me = asyncHandler(async (req, res) => ok(res, { user: req.user }));
export const logout = asyncHandler(async (req, res) => {
  await auditLog({ actor: req.user, action_type: "logout", entity_type: "user", entity_id: req.user?.user_id });
  ok(res, {}, "Logged out");
});
