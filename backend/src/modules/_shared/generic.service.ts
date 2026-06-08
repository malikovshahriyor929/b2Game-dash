import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";

type ModuleConfig = {
  table: string;
  entity: string;
  branchScoped?: boolean;
  writableColumns: string[];
  searchableColumns?: string[];
};

function scope(req: Request, alias = "") {
  const prefix = alias ? `${alias}.` : "";
  if (req.user?.role === "admin") return { where: `${prefix}branch_id = $1::uuid`, values: [req.user.branch_id] };
  const branchId = req.query.branch_id ?? req.body?.branch_id;
  if (!branchId || branchId === "all") return { where: "1=1", values: [] as unknown[] };
  return { where: `${prefix}branch_id = $1::uuid`, values: [branchId] };
}

function placeholder(column: string, index: number) {
  const token = `$${index}`;
  return column === "id" || column === "branch_id" || column.endsWith("_id") ? `${token}::uuid` : token;
}

export function createGenericService(config: ModuleConfig) {
  return {
    async list(req: Request) {
      const s = config.branchScoped ? scope(req) : { where: "1=1", values: [] as unknown[] };
      const rows = await prisma.$queryRawUnsafe(`select * from ${config.table} where ${s.where} order by created_at desc limit 200`, ...s.values);
      return rows;
    },
    async get(req: Request, id: string) {
      const s = config.branchScoped ? scope(req) : { where: "1=1", values: [] as unknown[] };
      const idParam = placeholder("id", s.values.length + 1);
      const rows = await prisma.$queryRawUnsafe<unknown[]>(`select * from ${config.table} where id = ${idParam} and ${s.where} limit 1`, ...s.values, id);
      if (!rows.length) throw new ApiError(404, `${config.entity} not found`);
      return rows[0];
    },
    async create(req: Request) {
      const body = { ...req.body };
      if (config.branchScoped && req.user?.role === "admin") body.branch_id = req.user.branch_id;
      const keys = config.writableColumns.filter((key) => body[key] !== undefined);
      if (!keys.length) throw new ApiError(400, "No writable fields provided");
      const placeholders = keys.map((key, index) => placeholder(key, index + 1)).join(",");
      const rows = await prisma.$queryRawUnsafe<unknown[]>(
        `insert into ${config.table}(${keys.join(",")}) values(${placeholders}) returning *`,
        ...keys.map((key) => body[key]),
      );
      const row = rows[0] as { id?: string; branch_id?: string };
      await auditLog({ actor: req.user, branch_id: row.branch_id ?? body.branch_id ?? null, action_type: `${config.entity}_created`, entity_type: config.entity, entity_id: row.id ?? null });
      return row;
    },
    async update(req: Request, id: string) {
      const body = { ...req.body };
      delete body.branch_id;
      const keys = config.writableColumns.filter((key) => key !== "branch_id" && body[key] !== undefined);
      if (!keys.length) throw new ApiError(400, "No writable fields provided");
      await this.get(req, id);
      const setSql = keys.map((key, index) => `${key}=${placeholder(key, index + 1)}`).join(",");
      const rows = await prisma.$queryRawUnsafe<unknown[]>(
        `update ${config.table} set ${setSql}, updated_at=now() where id=${placeholder("id", keys.length + 1)} returning *`,
        ...keys.map((key) => body[key]),
        id,
      );
      const row = rows[0] as { id?: string; branch_id?: string };
      await auditLog({ actor: req.user, branch_id: row.branch_id ?? null, action_type: `${config.entity}_updated`, entity_type: config.entity, entity_id: id });
      return row;
    },
    async remove(req: Request, id: string) {
      await this.get(req, id);
      const rows = await prisma.$queryRawUnsafe<unknown[]>(`delete from ${config.table} where id=$1::uuid returning *`, id);
      await auditLog({ actor: req.user, action_type: `${config.entity}_deleted`, entity_type: config.entity, entity_id: id });
      return rows[0];
    },
  };
}
