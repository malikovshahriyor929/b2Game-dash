import { backendGet, backendPost } from "@/server/api";

// Naqd выemka (inkassatsiya) so'rovi — boshliq yoki admin yuboradi, qarama-qarshi tomon tasdiqlaydi.
export type WithdrawalStatus = "pending" | "confirmed" | "rejected";
export type WithdrawalInitiator = "admin" | "super_admin";

export type WithdrawalRequest = {
  id: string;
  branchId: string;
  shiftId: string | null;
  adminId: string;
  adminName: string;
  amount: number;
  initiatedBy: string;
  initiatedByName: string;
  initiatorRole: WithdrawalInitiator;
  status: WithdrawalStatus;
  note?: string;
  confirmedBy?: string;
  confirmedByName?: string;
  createdAt: string;
  resolvedAt?: string;
};

function numberValue(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function mapRow(row: Record<string, unknown>): WithdrawalRequest {
  return {
    id: String(row.id),
    branchId: String(row.branch_id ?? ""),
    shiftId: row.shift_id ? String(row.shift_id) : null,
    adminId: String(row.admin_id ?? ""),
    adminName: String(row.admin_name ?? ""),
    amount: numberValue(row.amount),
    initiatedBy: String(row.initiated_by ?? ""),
    initiatedByName: String(row.initiated_by_name ?? ""),
    initiatorRole: row.initiator_role === "super_admin" ? "super_admin" : "admin",
    status: row.status === "confirmed" ? "confirmed" : row.status === "rejected" ? "rejected" : "pending",
    note: row.note ? String(row.note) : undefined,
    confirmedBy: row.confirmed_by ? String(row.confirmed_by) : undefined,
    confirmedByName: row.confirmed_by_name ? String(row.confirmed_by_name) : undefined,
    createdAt: String(row.created_at ?? ""),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
  };
}

export async function fetchWithdrawalRequests(branchId: string): Promise<WithdrawalRequest[]> {
  const rows = await backendGet<Array<Record<string, unknown>>>(`/shifts/withdrawals/requests?branch_id=${encodeURIComponent(branchId)}`);
  return rows.map(mapRow);
}

export function createWithdrawalRequest(payload: { branch_id?: string; amount: number; note?: string }) {
  return backendPost<Record<string, unknown>>("/shifts/withdrawals/requests", payload);
}

export function confirmWithdrawalRequest(id: string) {
  return backendPost<Record<string, unknown>>(`/shifts/withdrawals/requests/${id}/confirm`);
}

export function rejectWithdrawalRequest(id: string) {
  return backendPost<Record<string, unknown>>(`/shifts/withdrawals/requests/${id}/reject`);
}
