import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/apiResponse";
import * as service from "./settings.service";
export const list = asyncHandler(async (req, res) => ok(res, await service.listSettings(req)));
export const paymentMethods = asyncHandler(async (req, res) => ok(res, await service.paymentMethods(req)));
export const startSessionOptions = asyncHandler(async (req, res) => ok(res, await service.startSessionOptions(req)));
export const patch = asyncHandler(async (req, res) => ok(res, await service.patchSettings(req)));
