import { asyncHandler } from "../../utils/asyncHandler";
import { created, ok } from "../../utils/apiResponse";
import * as s from "./shifts.service";

export const list = asyncHandler(async (req, res) => ok(res, await s.list(req)));
export const current = asyncHandler(async (req, res) => ok(res, await s.current(req)));
export const openInfo = asyncHandler(async (req, res) => ok(res, await s.openInfo(req)));
export const withdrawals = asyncHandler(async (req, res) => ok(res, await s.withdrawals(req)));
export const open = asyncHandler(async (req, res) => created(res, await s.open(req)));
export const close = asyncHandler(async (req, res) => ok(res, await s.close(req)));
export const get = asyncHandler(async (req, res) => ok(res, await s.get(req)));

export const listWithdrawalRequests = asyncHandler(async (req, res) => ok(res, await s.listWithdrawalRequests(req)));
export const createWithdrawalRequest = asyncHandler(async (req, res) => created(res, await s.createWithdrawalRequest(req)));
export const confirmWithdrawalRequest = asyncHandler(async (req, res) => ok(res, await s.confirmWithdrawalRequest(req)));
export const rejectWithdrawalRequest = asyncHandler(async (req, res) => ok(res, await s.rejectWithdrawalRequest(req)));
