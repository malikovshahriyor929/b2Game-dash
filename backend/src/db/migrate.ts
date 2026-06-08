import fs from "fs/promises";
import path from "path";
import { pool } from "./pool";

async function run() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    await pool.query("drop schema if exists public cascade; create schema public;");
  }
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const dir = path.join(__dirname, "migrations");
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const exists = await pool.query("select 1 from schema_migrations where filename=$1", [file]);
    if (exists.rowCount) continue;
    const sql = await fs.readFile(path.join(dir, file), "utf8");
    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into schema_migrations(filename) values($1)", [file]);
      await pool.query("commit");
      console.log(`applied ${file}`);
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }
  }
}

run().then(() => pool.end()).catch((error) => {
  console.error(error);
  pool.end().finally(() => process.exit(1));
});
