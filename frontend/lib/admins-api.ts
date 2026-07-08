import { backendDelete, backendGet, backendPatch, backendPost } from "@/server/api";

export type AdminRole = "admin" | "super_admin" | "dev_admin" | "dev_super_admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  branchId: string | null;
  isActive: boolean;
  penaltyTotal: number;
};

export type AdminDeductionType = "salary_advance" | "personal_cash" | "fine" | "damage" | "shortage" | "other";

export type AdminDeduction = {
  id: string;
  adminId: string;
  adminName: string;
  branchName: string;
  type: AdminDeductionType;
  amount: number;
  status: string;
  note: string;
  source: string;
  createdByName: string;
  createdAt: string;
};

export type AssignableSimulator = {
  id: string;
  name: string;
  code: string;
  zone: string;
  branchName: string;
  assignedAdminIds: string[];
};

export type AdminBranch = { id: string; name: string };

export type AdminPayload = {
  name: string;
  email: string;
  password?: string;
  role?: AdminRole;
  branch_id?: string | null;
  is_active?: boolean;
};

function mapUser(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    role:
      row.role === "dev_super_admin" ? "dev_super_admin"
      : row.role === "dev_admin" ? "dev_admin"
      : row.role === "super_admin" ? "super_admin"
      : "admin",
    branchId: row.branch_id == null ? null : String(row.branch_id),
    isActive: Boolean(row.is_active),
    penaltyTotal: Number(row.penalty_total ?? 0),
  };
}

export async function fetchAdmins() {
  const rows = await backendGet<Array<Record<string, unknown>>>("/users");
  return rows.map(mapUser);
}

export async function fetchAdminDeductions(params?: { branchId?: string; type?: AdminDeductionType | "all" }) {
  const query = new URLSearchParams();
  if (params?.branchId) query.set("branch_id", params.branchId);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  const rows = await backendGet<Array<Record<string, unknown>>>(`/expenses/admin-deductions${query.size ? `?${query}` : ""}`);
  return rows.map((row) => ({
    id: String(row.id),
    adminId: String(row.admin_id ?? ""),
    adminName: String(row.admin_name ?? ""),
    branchName: String(row.branch_name ?? ""),
    type: (row.type === "personal_cash" || row.type === "fine" || row.type === "damage" || row.type === "shortage" || row.type === "other" ? row.type : "salary_advance") as AdminDeductionType,
    amount: Number(row.amount ?? 0),
    status: String(row.status ?? "open"),
    note: String(row.note ?? ""),
    source: String(row.expense_source ?? ""),
    createdByName: String(row.created_by_name ?? ""),
    createdAt: String(row.created_at ?? ""),
  } satisfies AdminDeduction));
}

export async function fetchBranches() {
  const rows = await backendGet<Array<Record<string, unknown>>>("/branches");
  return rows.map((row) => ({ id: String(row.id), name: String(row.name ?? "") } as AdminBranch));
}

export async function fetchAssignableSimulators() {
  const rows = await backendGet<Array<Record<string, unknown>>>("/simulators/assignable");
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    code: String(row.code ?? ""),
    zone: String(row.zone ?? ""),
    branchName: String(row.branch_name ?? ""),
    assignedAdminIds: Array.isArray(row.assigned_admin_ids) ? row.assigned_admin_ids.map(String) : [],
  } as AssignableSimulator));
}

export function createAdmin(payload: AdminPayload) {
  return backendPost<Record<string, unknown>>("/users", payload);
}

export function updateAdmin(id: string, payload: AdminPayload) {
  return backendPatch<Record<string, unknown>>(`/users/${id}`, payload);
}

export function deleteAdmin(id: string) {
  return backendDelete<Record<string, unknown>>(`/users/${id}`);
}

export function setAdminSimulators(adminId: string, simulatorIds: string[]) {
  return backendPost<Record<string, unknown>>("/simulators/assignments", { admin_id: adminId, simulator_ids: simulatorIds });
}

export function payAdminPenalty(adminId: string, payload: {
  method: "cash" | "card" | "qr";
  cash_amount: number;
  card_amount: number;
  qr_amount: number;
  received_amount?: number;
  change_amount?: number;
  note?: string;
}) {
  return backendPost<Record<string, unknown>>(`/payments/admin-penalties/${adminId}/pay`, payload);
}
