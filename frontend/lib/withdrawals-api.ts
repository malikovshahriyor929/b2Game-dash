import { backendGet, backendPost } from "@/server/api";

// Naqd выemka (inkassatsiya) so'rovi — boshliq yoki admin yuboradi, qarama-qarshi tomon tasdiqlaydi.
export type WithdrawalStatus = "pending" | "confirmed" | "rejected";
export type WithdrawalInitiator = "admin" | "super_admin";
export type WithdrawalPurpose = "owner_withdrawal" | "admin_debt" | "expense";

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
  purpose: WithdrawalPurpose;
  deductionType?: string;
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
    purpose: row.purpose === "admin_debt" ? "admin_debt" : row.purpose === "expense" ? "expense" : "owner_withdrawal",
    deductionType: row.deduction_type ? String(row.deduction_type) : undefined,
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

export async function createWithdrawalRequest(payload: { branch_id?: string; amount: number; note?: string; purpose?: WithdrawalPurpose }) {
  const row = await backendPost<Record<string, unknown>>("/shifts/withdrawals/requests", payload);
  return mapRow(row);
}

export async function confirmWithdrawalRequest(id: string) {
  const row = await backendPost<Record<string, unknown>>(`/shifts/withdrawals/requests/${id}/confirm`);
  return mapRow(row);
}

export async function rejectWithdrawalRequest(id: string) {
  const row = await backendPost<Record<string, unknown>>(`/shifts/withdrawals/requests/${id}/reject`);
  return mapRow(row);
}
