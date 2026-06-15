import { backendGet, backendPost } from "@/server/api";

export type CustomerLite = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  bonus: number;
  status: string;
};

function mapCustomerLite(row: Record<string, unknown>): CustomerLite {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    balance: Number(row.balance ?? 0),
    bonus: Number(row.bonus ?? 0),
    status: String(row.status ?? "active"),
  };
}

// Backend name/phone bo'yicha qidiradi (?q=...). branchId "all" yoki aniq filial bo'lishi mumkin.
export async function searchCustomers(query: string, branchId?: string, limit = 20) {
  const params = new URLSearchParams();
  params.set("branch_id", branchId && branchId !== "all" ? branchId : "all");
  if (query.trim()) params.set("q", query.trim());
  params.set("limit", String(limit));
  const rows = await backendGet<Array<Record<string, unknown>>>(`/customers?${params.toString()}`);
  return rows.map(mapCustomerLite);
}

export async function createCustomer(payload: { name: string; phone: string; branchId: string }) {
  const row = await backendPost<Record<string, unknown>>("/customers", {
    branch_id: payload.branchId,
    name: payload.name,
    phone: payload.phone,
    status: "active",
  });
  return mapCustomerLite(row);
}
