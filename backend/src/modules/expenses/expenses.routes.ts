import { Router } from "express";
import * as controller from "./expenses.controller";

export const expensesRoutes = Router();

expensesRoutes.get("/", controller.list);
expensesRoutes.get("/admin-deductions", controller.listAdminDeductions);
expensesRoutes.post("/", controller.create);
