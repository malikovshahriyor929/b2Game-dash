import { backendGet } from "@/server/api";

export const LOGS_PAGE_SIZE = 50;

export type LogFilters = {
  branchId: string;
  search?: string;
  actor?: string;
  actionType?: string;
  simulator?: string;
  date?: string; // yyyy-MM-dd
  paymentMethod?: string;
};

export type LogCursor = { before: string; beforeId: string };

export type LogRow = {
  id: string;
  createdAt: string;
  operator: string;
  role: string | null;
  action: string;
  entityType: string;
  simulator: string | null;
  paymentMethod: string | null;
  amount: number | null;
};

export type LogsPage = {
  items: LogRow[];
  nextCursor: LogCursor | null;
};

function mapRow(row: Record<string, unknown>): LogRow {
  const details = row.details && typeof row.details === "object" ? (row.details as Record<string, unknown>) : {};
  const simulator = row.simulator_name ? String(row.simulator_name) : row.simulator_code ? String(row.simulator_code) : null;
  return {
    id: String(row.id),
    createdAt: String(row.created_at ?? ""),
    operator: String(row.actor_name ?? "System"),
    role: row.actor_role ? String(row.actor_role) : null,
    action: String(row.action_type ?? ""),
    entityType: String(row.entity_type ?? ""),
    simulator,
    paymentMethod: details.method != null ? String(details.method) : null,
    amount: row.amount != null && row.amount !== "" ? Number(row.amount) : null,
  };
}

export async function fetchLogs(filters: LogFilters, cursor: LogCursor | null): Promise<LogsPage> {
  const p = new URLSearchParams();
  p.set("branch_id", filters.branchId || "all");
  p.set("limit", String(LOGS_PAGE_SIZE));
  if (filters.search) p.set("search", filters.search);
  if (filters.actor) p.set("actor", filters.actor);
  if (filters.actionType && filters.actionType !== "all") p.set("action_type", filters.actionType);
  if (filters.simulator) p.set("simulator", filters.simulator);
  if (filters.date) p.set("date", filters.date);
  if (filters.paymentMethod && filters.paymentMethod !== "all") p.set("payment_method", filters.paymentMethod);
  if (cursor) {
    p.set("before", cursor.before);
    p.set("before_id", cursor.beforeId);
  }

  const rows = await backendGet<Array<Record<string, unknown>>>(`/logs?${p.toString()}`);
  const items = rows.map(mapRow);
  const last = rows[rows.length - 1];
  // A full page implies there may be more; keyset off the last row.
  const nextCursor = rows.length >= LOGS_PAGE_SIZE && last ? { before: String(last.created_at), beforeId: String(last.id) } : null;
  return { items, nextCursor };
}
