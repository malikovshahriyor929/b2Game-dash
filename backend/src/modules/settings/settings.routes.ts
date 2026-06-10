import { Router } from "express";
import { requireRole } from "../../middleware/role.middleware";
import * as controller from "./settings.controller";
export const settingsRoutes = Router();
settingsRoutes.get("/", controller.list);
settingsRoutes.get("/payment-methods", controller.paymentMethods);
settingsRoutes.get("/start-session-options", controller.startSessionOptions);
settingsRoutes.patch("/", requireRole(["super_admin"]), controller.patch);
