import { Request } from "express";
import { prisma } from "../../db/prisma";
import { auditLog } from "../../services/auditLog.service";

const defaultPaymentMethods = [
  { label: "Naqd", value: "cash", enabled: true },
  { label: "Karta", value: "card", enabled: true },
  { label: "Balans", value: "balance", enabled: true },
  { label: "Aralash", value: "mixed", enabled: true },
];

function branchId(req: Request) {
  const value = req.user?.role === "admin" ? req.user.branch_id : req.body.branch_id ?? req.query.branch_id;
  return !value || value === "all" ? null : String(value);
}

export async function listSettings(req: Request) {
  const branch = branchId(req);
  return prisma.$queryRawUnsafe("select * from settings where ($1::uuid is null or branch_id=$1::uuid) order by key, updated_at desc", branch);
}

export async function paymentMethods(req: Request) {
  const branch = branchId(req);
  const rows = await prisma.$queryRawUnsafe<Array<{ value: unknown }>>(
    "select value from settings where key='payment_methods' and ($1::uuid is null or branch_id=$1::uuid or branch_id is null) order by branch_id nulls last, updated_at desc limit 1",
    branch,
  );
  const methods = Array.isArray(rows[0]?.value) ? rows[0].value : defaultPaymentMethods;
  return methods;
}

export async function patchSettings(req: Request) {
  const branch = branchId(req);
  const entries = Object.entries(req.body.settings ?? {});
  for (const [key, value] of entries) {
    if (branch) {
      await prisma.$executeRawUnsafe(
        "insert into settings(branch_id,key,value) values($1::uuid,$2,$3::jsonb) on conflict(branch_id,key) do update set value=excluded.value, updated_at=now()",
        branch,
        key,
        JSON.stringify(value),
      );
      continue;
    }

    const updated = await prisma.$executeRawUnsafe("update settings set value=$1::jsonb, updated_at=now() where branch_id is null and key=$2", JSON.stringify(value), key);
    if (!updated) await prisma.$executeRawUnsafe("insert into settings(branch_id,key,value) values(null,$1,$2::jsonb)", key, JSON.stringify(value));
  }
  await auditLog({ actor: req.user, branch_id: branch, action_type: "settings_updated", entity_type: "settings", details: req.body.settings });
  return { updated: entries.length };
}
