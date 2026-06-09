import { Router } from "express";
import { requireRole } from "../../middleware/role.middleware";
import { branchesController } from "./branches.controller";

export const branchesRoutes = Router();
branchesRoutes.get("/", branchesController.list);
branchesRoutes.get("/:id", branchesController.get);
branchesRoutes.post("/", requireRole(["super_admin"]), branchesController.create);
branchesRoutes.patch("/:id", requireRole(["super_admin"]), branchesController.update);
branchesRoutes.delete("/:id", requireRole(["super_admin"]), branchesController.remove);
