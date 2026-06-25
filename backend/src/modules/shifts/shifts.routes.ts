import { Router } from "express";
import * as c from "./shifts.controller";
import { validate } from "../../middleware/validate.middleware";
import { openShiftSchema, closeShiftSchema, withdrawalRequestSchema } from "../../validators/shift.validator";

export const shiftsRoutes = Router();
shiftsRoutes.get("/", c.list);
shiftsRoutes.get("/current", c.current);
shiftsRoutes.get("/open-info", c.openInfo);
shiftsRoutes.get("/withdrawals", c.withdrawals);
// Naqd выemka (inkassatsiya) so'rov + tasdiqlash
shiftsRoutes.get("/withdrawals/requests", c.listWithdrawalRequests);
shiftsRoutes.post("/withdrawals/requests", validate(withdrawalRequestSchema), c.createWithdrawalRequest);
shiftsRoutes.post("/withdrawals/requests/:id/confirm", c.confirmWithdrawalRequest);
shiftsRoutes.post("/withdrawals/requests/:id/reject", c.rejectWithdrawalRequest);
shiftsRoutes.post("/open", validate(openShiftSchema), c.open);
shiftsRoutes.get("/:id", c.get);
shiftsRoutes.post("/:id/close", validate(closeShiftSchema), c.close);
