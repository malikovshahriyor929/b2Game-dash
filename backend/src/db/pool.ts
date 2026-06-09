import { Pool } from "pg";
import { env } from "../config/env";

const databaseUrlRequiresSsl = /[?&]sslmode=(require|verify-ca|verify-full)\b/i.test(env.DATABASE_URL);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" || env.DATABASE_SSL || databaseUrlRequiresSsl ? { rejectUnauthorized: false } : undefined,
});

export async function tx<T>(fn: (client: import("pg").PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
