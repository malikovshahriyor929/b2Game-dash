import { Request } from "express";
import { prisma } from "../../db/prisma";
import { createGenericService } from "../_shared/generic.service";
import { ApiError } from "../../utils/apiError";

const baseService = createGenericService({ table: "branches", entity: "branch", writableColumns: ["name","code","address","phone","status"] });

function branchFilter(req: Request, requestedId?: string) {
  if (req.user?.role === "admin") return req.user.branch_id;
  return requestedId ?? null;
}

export const branchesService = {
  ...baseService,

  async list(req: Request) {
    const branchId = branchFilter(req, req.query.branch_id === "all" ? undefined : req.query.branch_id ? String(req.query.branch_id) : undefined);
    return prisma.$queryRawUnsafe(
      "select * from branches where ($1::uuid is null or id=$1::uuid) order by created_at desc limit 200",
      branchId,
    );
  },

  async get(req: Request, id: string) {
    const branchId = branchFilter(req, id);
    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      "select * from branches where id=$1::uuid and ($2::uuid is null or id=$2::uuid) limit 1",
      id,
      branchId,
    );
    if (!rows.length) throw new ApiError(404, "branch not found");
    return rows[0];
  },
};
