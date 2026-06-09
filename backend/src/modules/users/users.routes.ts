import { Router } from "express";
import { requireRole } from "../../middleware/role.middleware";
import { usersController } from "./users.controller";

export const usersRoutes = Router();
usersRoutes.get("/", usersController.list);
usersRoutes.get("/:id", usersController.get);
usersRoutes.post("/", requireRole(["super_admin"]), usersController.create);
usersRoutes.patch("/:id", requireRole(["super_admin"]), usersController.update);
usersRoutes.delete("/:id", requireRole(["super_admin"]), usersController.remove);
