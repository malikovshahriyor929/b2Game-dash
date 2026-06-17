import { Request } from "express";
import { prisma } from "../../db/prisma";
import { baseRole, isDevRole } from "../../types/auth.types";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

function strParam(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function list(req: Request) {
  const q = req.query;
  const params: unknown[] = [];
  const conds: string[] = [];
  // Push a value and return its positional placeholder ($1, $2, ...).
  const add = (value: unknown) => `$${params.push(value)}`;

  // Branch scope: admin/dev_admin locked to their branch; (dev_)super_admin can pass branch_id.
  const branch = baseRole(req.user?.role) === "admin"
    ? req.user?.branch_id ?? null
    : q.branch_id === "all"
      ? null
      : strParam(q.branch_id);
  if (branch) conds.push(`l.branch_id = ${add(branch)}::uuid`);

  // Developer activity (dev_admin / dev_super_admin) is hidden from regular viewers.
  if (!isDevRole(req.user?.role)) conds.push(`(l.actor_role is null or l.actor_role not in ('dev_admin','dev_super_admin'))`);

  // Action type — substring match so category values ("payment", "session") hit
  // "payment_received", "start_session", etc. Also matches entity_type.
  const actionType = strParam(q.action_type);
  if (actionType && actionType !== "all") {
    const like = add(`%${actionType}%`);
    conds.push(`(l.action_type ilike ${like} or l.entity_type ilike ${like})`);
  }

  // Admin / actor name.
  const actor = strParam(q.actor);
  if (actor) conds.push(`l.actor_name ilike ${add(`%${actor}%`)}`);

  // Simulator by name or code (joined from the simulators table).
  const simulator = strParam(q.simulator);
  if (simulator) {
    const like = add(`%${simulator}%`);
    conds.push(`(s.name ilike ${like} or s.code ilike ${like})`);
  }

  // Payment method (stored inside the log details JSON).
  const method = strParam(q.payment_method);
  if (method && method !== "all") conds.push(`l.details->>'method' = ${add(method)}`);

  // Single calendar day (UTC, matching how created_at is stored).
  const date = strParam(q.date);
  if (date) {
    conds.push(`l.created_at >= ${add(date)}::date`);
    conds.push(`l.created_at < (${add(date)}::date + interval '1 day')`);
  }

  // Free-text search across the human-readable columns.
  const search = strParam(q.search);
  if (search) {
    const like = add(`%${search}%`);
    conds.push(`(l.actor_name ilike ${like} or l.action_type ilike ${like} or l.entity_type ilike ${like} or s.name ilike ${like} or s.code ilike ${like} or l.details::text ilike ${like})`);
  }

  // Keyset pagination cursor: rows strictly older than (before, before_id).
  // created_at is truncated to milliseconds to match the precision the client receives
  // (Prisma returns Date = ms), so rows sharing a timestamp aren't skipped at page edges.
  // Casting to ::timestamp keeps the comparison timezone-independent.
  const before = strParam(q.before);
  const beforeId = strParam(q.before_id);
  if (before && beforeId) {
    const ts = add(before);
    const id = add(beforeId);
    conds.push(`(date_trunc('milliseconds', l.created_at) < ${ts}::timestamp or (date_trunc('milliseconds', l.created_at) = ${ts}::timestamp and l.id < ${id}::uuid))`);
  }

  const limitRaw = Number(q.limit ?? DEFAULT_LIMIT);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? Math.trunc(limitRaw) : DEFAULT_LIMIT, 1), MAX_LIMIT);

  const where = conds.length ? `where ${conds.join(" and ")}` : "";
  const sql = `
    select l.*, s.name as simulator_name, s.code as simulator_code
    from logs l
    left join simulators s on s.id = l.simulator_id
    ${where}
    order by date_trunc('milliseconds', l.created_at) desc, l.id desc
    limit ${add(limit)}`;

  return prisma.$queryRawUnsafe(sql, ...params);
}
