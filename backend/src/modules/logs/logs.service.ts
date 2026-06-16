import { Request } from "express";
import { prisma } from "../../db/prisma";
import { baseRole, isDevRole } from "../../types/auth.types";

export function list(req: Request) {
  const branch = baseRole(req.user?.role) === "admin"
    ? req.user?.branch_id ?? null
    : req.query.branch_id === "all"
      ? null
      : req.query.branch_id ?? null;

  // Developer activity (dev_admin / dev_super_admin) is hidden from regular
  // admins/super_admins. Only a developer sees it.
  const viewerIsDev = isDevRole(req.user?.role);

  return prisma.$queryRawUnsafe(
    "select * from logs where ($1::uuid is null or branch_id=$1::uuid) and ($2::text is null or action_type=$2::text) and ($3::text is null or entity_type=$3::text) and ($4::boolean or actor_role is null or actor_role not in ('dev_admin','dev_super_admin')) order by created_at desc limit 500",
    branch,
    req.query.action_type ?? null,
    req.query.entity_type ?? null,
    viewerIsDev,
  );
}
