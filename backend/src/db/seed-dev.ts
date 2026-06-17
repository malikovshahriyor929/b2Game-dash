import bcrypt from "bcrypt";
import { pool } from "./pool";

// Non-destructive: creates (or resets) ONLY the hidden developer accounts.
// Safe to run against a live database — it touches nothing else.
//
//   dev_super_admin -> global, super_admin powers
//   dev_admin       -> branch-scoped (defaults to the MAIN branch), admin powers
//
// Override defaults via env when needed:
//   DEV_SUPER_EMAIL=... DEV_ADMIN_EMAIL=... DEV_PASSWORD=secret DEV_ADMIN_BRANCH_CODE=MAIN npm run seed:dev
const password = process.env.DEV_PASSWORD ?? "devb2game2026";
const devSuperEmail = (process.env.DEV_SUPER_EMAIL ?? "devsuper@b2game.uz").trim().toLowerCase();
const devAdminEmail = (process.env.DEV_ADMIN_EMAIL ?? "devadmin@b2game.uz").trim().toLowerCase();
const devAdminBranchCode = process.env.DEV_ADMIN_BRANCH_CODE ?? "MAIN";

async function upsert(name: string, email: string, role: "dev_admin" | "dev_super_admin", branchId: string | null) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `insert into users(name,email,password_hash,role,branch_id,is_active)
     values($1,$2,$3,$4,$5,true)
     on conflict(email) do update set name=excluded.name, password_hash=excluded.password_hash, role=excluded.role, branch_id=excluded.branch_id, is_active=true
     returning id, email, role, branch_id`,
    [name, email, hash, role, branchId],
  );
  return rows[0];
}

async function run() {
  await pool.query("create extension if not exists pgcrypto");

  // dev_admin must belong to a branch — pick the requested code, else the first branch.
  const branch = await pool.query("select id from branches where code=$1 limit 1", [devAdminBranchCode]);
  const branchId: string | null = branch.rows[0]?.id ?? (await pool.query("select id from branches order by created_at limit 1")).rows[0]?.id ?? null;
  if (!branchId) throw new Error("No branch found — create a branch before seeding dev_admin.");

  console.log("dev super admin:", await upsert("Dev Super Admin", devSuperEmail, "dev_super_admin", null));
  console.log("dev admin:", await upsert("Dev Admin", devAdminEmail, "dev_admin", branchId));
}

run()
  .then(() => pool.end())
  .catch((error) => {
    console.error(error);
    pool.end().finally(() => process.exit(1));
  });
