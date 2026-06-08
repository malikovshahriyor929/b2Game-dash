import { PoolClient } from "pg";
import { pool } from "../db/pool";
import { AuthUser } from "../types/auth.types";

type AuditInput = {
  branch_id?: string | null;
  actor?: AuthUser | null;
  action_type: string;
  entity_type: string;
  entity_id?: string | null;
  simulator_id?: string | null;
  session_id?: string | null;
  amount?: number | null;
  details?: Record<string, unknown>;
};

export async function auditLog(input: AuditInput, client?: PoolClient) {
  const db = client ?? pool;
  await db.query(
    `insert into logs(branch_id, actor_id, actor_name, actor_role, action_type, entity_type, entity_id, simulator_id, session_id, amount, details)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      input.branch_id ?? input.actor?.branch_id ?? null,
      input.actor?.user_id ?? null,
      input.actor?.name ?? null,
      input.actor?.role ?? null,
      input.action_type,
      input.entity_type,
      input.entity_id ?? null,
      input.simulator_id ?? null,
      input.session_id ?? null,
      input.amount ?? null,
      input.details ?? {},
    ],
  );
}
