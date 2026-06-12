import { Router } from "express";
import * as c from "./shifts.controller";
import { validate } from "../../middleware/validate.middleware";
import { openShiftSchema, closeShiftSchema } from "../../validators/shift.validator";

export const shiftsRoutes = Router();
shiftsRoutes.get("/", c.list);
shiftsRoutes.get("/current", c.current);
shiftsRoutes.get("/open-info", c.openInfo);
shiftsRoutes.get("/withdrawals", c.withdrawals);
shiftsRoutes.post("/open", validate(openShiftSchema), c.open);
shiftsRoutes.get("/:id", c.get);
shiftsRoutes.post("/:id/close", validate(closeShiftSchema), c.close);
