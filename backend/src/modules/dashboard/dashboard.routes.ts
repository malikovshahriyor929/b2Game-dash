import { Router } from "express"; import { summary } from "./dashboard.controller"; export const dashboardRoutes=Router(); dashboardRoutes.get("/summary",summary);
