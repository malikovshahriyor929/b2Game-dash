import cors from "cors";
import { env } from "./env";

export const corsMiddleware = cors({
  origin: env.FRONTEND_URL === "*" ? true : env.FRONTEND_URL.split(",").map((item) => item.trim()),
  credentials: true,
});
