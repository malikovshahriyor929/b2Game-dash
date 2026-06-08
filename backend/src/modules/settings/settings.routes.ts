import { Router } from "express";
import * as controller from "./settings.controller";
export const settingsRoutes = Router();
settingsRoutes.get("/", controller.list);
settingsRoutes.get("/payment-methods", controller.paymentMethods);
settingsRoutes.patch("/", controller.patch);
