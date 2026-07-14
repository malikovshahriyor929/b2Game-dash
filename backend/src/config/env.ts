import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const DEFAULT_ACCESS_SECRET = "change_me_access";
const DEFAULT_REFRESH_SECRET = "change_me_refresh";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/b2_game_club"),
  DATABASE_SSL: z.coerce.boolean().default(false),
  JWT_ACCESS_SECRET: z.string().min(8).default(DEFAULT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: z.string().min(8).default(DEFAULT_REFRESH_SECRET),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  WS_HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
  WS_OFFLINE_AFTER_MS: z.coerce.number().default(60000),
  LATEST_AGENT_VERSION: z.string().default("1.0.17"),
  RIG_MVP_API_URL: z.string().default("http://127.0.0.1:8000"),
  // Server-to-server key sent as the X-API-Key header on every Rig-MVP
  RIG_MVP_API_KEY: z.string().default(""),
  RIG_MVP_SYNC_INTERVAL_MS: z.coerce.number().default(30000),
  RIG_MVP_DB_SYNC_INTERVAL_MS: z.coerce.number().default(60000),
  RIG_DEFAULT_BRANCH_CODE: z.string().default("MAIN"),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production") return;

  if (value.JWT_ACCESS_SECRET === DEFAULT_ACCESS_SECRET || value.JWT_ACCESS_SECRET.length < 32) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["JWT_ACCESS_SECRET"], message: "Production JWT_ACCESS_SECRET must be custom and at least 32 characters" });
  }
  if (value.JWT_REFRESH_SECRET === DEFAULT_REFRESH_SECRET || value.JWT_REFRESH_SECRET.length < 32) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["JWT_REFRESH_SECRET"], message: "Production JWT_REFRESH_SECRET must be custom and at least 32 characters" });
  }
  if (value.FRONTEND_URL === "*") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["FRONTEND_URL"], message: "Production FRONTEND_URL must list explicit origins" });
  }
});

export const env = envSchema.parse(process.env);
