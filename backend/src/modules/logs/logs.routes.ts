import { Router } from "express";
import { list } from "./logs.controller";
export const logsRoutes = Router();
logsRoutes.get("/", list);
