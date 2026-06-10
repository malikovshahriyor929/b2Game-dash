import { Request } from "express";
import { prisma } from "../../db/prisma";
import { createGenericService } from "../_shared/generic.service";
const baseCustomersService = createGenericService({ table: "customers", entity: "customer", branchScoped: true, writableColumns: ["branch_id","name","phone","balance","bonus","total_spent","sessions_count","last_visit_at","status"] });

function branchFilter(req: Request) {
  if (req.user?.role === "admin") return { where: "branch_id=$1::uuid", values: [req.user.branch_id] as unknown[] };
  const branchId = req.query.branch_id;
  if (!branchId || branchId === "all") return { where: "1=1", values: [] as unknown[] };
  return { where: "branch_id=$1::uuid", values: [branchId] as unknown[] };
}

export const customersService = {
  ...baseCustomersService,
  async list(req: Request) {
    const scoped = branchFilter(req);
    const q = String(req.query.q ?? "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit ?? 200) || 200, 1), 200);
    const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);
    const values = [...scoped.values];
    let where = scoped.where;
    if (q) {
      values.push(`%${q.toLowerCase()}%`);
      const qParam = `$${values.length}`;
      where = `(${where}) and (lower(name) like ${qParam} or lower(coalesce(phone,'')) like ${qParam})`;
    }
    values.push(limit, offset);
    return prisma.$queryRawUnsafe(
      `select * from customers where ${where} order by name asc, created_at desc limit $${values.length - 1} offset $${values.length}`,
      ...values,
    );
  },
};
export async function customerSessions(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where customer_id=$1 order by created_at desc", req.params.id); }
export async function customerSales(req: Request) { return prisma.$queryRawUnsafe("select * from sales where customer_id=$1 order by created_at desc", req.params.id); }
