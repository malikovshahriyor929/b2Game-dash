import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/b2_game_club"),
  DATABASE_SSL: z.coerce.boolean().default(false),
  JWT_ACCESS_SECRET: z.string().min(8).default("change_me_access"),
  JWT_REFRESH_SECRET: z.string().min(8).default("change_me_refresh"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  WS_HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
  WS_OFFLINE_AFTER_MS: z.coerce.number().default(60000),
  LATEST_AGENT_VERSION: z.string().default("1.0.17"),
  RIG_MVP_API_URL: z.string().default("http://127.0.0.1:8000"),
  RIG_MVP_SYNC_INTERVAL_MS: z.coerce.number().default(2000),
});

export const env = envSchema.parse(process.env);
