import { Request } from "express";
import { prisma } from "../../db/prisma";
import { createGenericService } from "../_shared/generic.service";
export const customersService = createGenericService({ table: "customers", entity: "customer", branchScoped: true, writableColumns: ["branch_id","name","phone","balance","bonus","total_spent","sessions_count","last_visit_at","status"] });
export async function customerSessions(req: Request) { return prisma.$queryRawUnsafe("select * from sessions where customer_id=$1 order by created_at desc", req.params.id); }
export async function customerSales(req: Request) { return prisma.$queryRawUnsafe("select * from sales where customer_id=$1 order by created_at desc", req.params.id); }
