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
