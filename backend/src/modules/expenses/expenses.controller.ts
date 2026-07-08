import { asyncHandler } from "../../utils/asyncHandler";
import { created, ok } from "../../utils/apiResponse";
import * as service from "./expenses.service";

export const list = asyncHandler(async (req, res) => ok(res, await service.list(req)));
export const listAdminDeductions = asyncHandler(async (req, res) => ok(res, await service.listAdminDeductions(req)));
export const create = asyncHandler(async (req, res) => created(res, await service.create(req)));
