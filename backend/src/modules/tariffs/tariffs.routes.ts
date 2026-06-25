import { Router } from "express";
import { requireRole } from "../../middleware/role.middleware";
import { tariffsController } from "./tariffs.controller";

export const tariffsRoutes = Router();

// Every authenticated admin may read tariffs, but only a (developer) super admin
// may change prices, discounts/bonuses, or remove a tariff.
tariffsRoutes.get("/", tariffsController.list);
tariffsRoutes.post("/", requireRole(["super_admin"]), tariffsController.create);
tariffsRoutes.get("/:id", tariffsController.get);
tariffsRoutes.patch("/:id", requireRole(["super_admin"]), tariffsController.update);
tariffsRoutes.delete("/:id", requireRole(["super_admin"]), tariffsController.remove);
