import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/apiResponse";
import { createGenericController } from "../_shared/generic.controller";
import { customersService, customerSales, customerSessions } from "./customers.service";
export const customersController = { ...createGenericController(customersService), sessions: asyncHandler(async (req, res) => ok(res, await customerSessions(req))), sales: asyncHandler(async (req, res) => ok(res, await customerSales(req))) };
