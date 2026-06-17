import { baseRole } from "../types/auth.types";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { RigMvpRig } from "./rigMvp.service";

export type BranchRecord = { id: string; name: string; code: string };

export async function getBranchById(branchId: string) {
  const rows = await prisma.$queryRawUnsafe<BranchRecord[]>(
    "select id, name, code from branches where id=$1::uuid limit 1",
    branchId,
  );
  return rows[0] ?? null;
}

export async function getBranchByCode(code: string) {
  const rows = await prisma.$queryRawUnsafe<BranchRecord[]>(
    "select id, name, code from branches where code=$1 limit 1",
    code,
  );
  return rows[0] ?? null;
}

/** Default branch for newly discovered rigs (today: MAIN). Override via RIG_DEFAULT_BRANCH_CODE. */
export async function getDefaultRigBranch() {
  const configured = await getBranchByCode(env.RIG_DEFAULT_BRANCH_CODE);
  if (configured) return configured;

  const rows = await prisma.$queryRawUnsafe<BranchRecord[]>(
    "select id, name, code from branches order by created_at asc limit 1",
  );
  if (!rows[0]) throw new Error("No branch configured for rig assignment");
  return rows[0];
}

/**
 * Resolve which branch a rig belongs to.
 * 1) Existing rig_connections assignment (sticky after first sync)
 * 2) Default branch from env (MAIN for now)
 */
export async function resolveRigBranchId(rig: RigMvpRig) {
  const existing = await prisma.$queryRawUnsafe<Array<{ branch_id: string }>>(
    "select branch_id from rig_connections where rig_id=$1 and branch_id is not null limit 1",
    rig.rig_id,
  );
  if (existing[0]?.branch_id) return existing[0].branch_id;
  return (await getDefaultRigBranch()).id;
}

export async function resolveRigBranch(rig: RigMvpRig) {
  const branchId = await resolveRigBranchId(rig);
  const branch = await getBranchById(branchId);
  if (!branch) return getDefaultRigBranch();
  return branch;
}

export async function filterRigsForScope(
  rigs: RigMvpRig[],
  requestedBranchId?: unknown,
  user?: { role?: string; branch_id?: string | null },
) {
  const branchId = baseRole(user?.role) === "admin"
    ? (user?.branch_id ?? null)
    : requestedBranchId && requestedBranchId !== "all"
      ? String(requestedBranchId)
      : null;

  if (!branchId) return rigs;

  const scoped: RigMvpRig[] = [];
  for (const rig of rigs) {
    const rigBranchId = await resolveRigBranchId(rig);
    if (rigBranchId === branchId) scoped.push(rig);
  }
  return scoped;
}
