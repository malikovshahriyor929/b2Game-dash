import { Router } from "express";
import * as c from "./shifts.controller";

export const shiftsRoutes = Router();
shiftsRoutes.get("/", c.list);
shiftsRoutes.get("/current", c.current);
shiftsRoutes.get("/open-info", c.openInfo);
shiftsRoutes.get("/withdrawals", c.withdrawals);
shiftsRoutes.post("/open", c.open);
shiftsRoutes.get("/:id", c.get);
shiftsRoutes.post("/:id/close", c.close);
