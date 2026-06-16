import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { changePasswordSchema, loginSchema, refreshSchema } from "../../validators/auth.validator";
import * as controller from "./auth.controller";

export const authRoutes = Router();
authRoutes.post("/login", validate(loginSchema), controller.login);
authRoutes.post("/refresh", validate(refreshSchema), controller.refresh);
authRoutes.get("/me", requireAuth, controller.me);
authRoutes.post("/change-password", requireAuth, validate(changePasswordSchema), controller.changePassword);
authRoutes.post("/logout", requireAuth, controller.logout);
