import { createGenericService } from "../_shared/generic.service";
import { Request } from "express";
import { prisma } from "../../db/prisma";

function branchScope(req: Request) {
  if (req.user?.role === "admin") return { where: "branch_id=$1::uuid", values: [req.user.branch_id] };
  const branchId = req.query.branch_id ?? req.body?.branch_id;
  if (!branchId || branchId === "all") return { where: "1=1", values: [] as unknown[] };
  return { where: "branch_id=$1::uuid", values: [branchId] };
}

const baseService = createGenericService({ table: "tariffs", entity: "tariff", branchScoped: true, writableColumns: ["branch_id","name","simulator_zone","duration_minutes","price","weekday_price","weekend_price","weekday_bonus","weekend_bonus","type","is_active"] });

export const tariffsService = {
  ...baseService,
  async list(req: Request) {
    const s = branchScope(req);
    return prisma.$queryRawUnsafe(
      `select *,
        price as base_price,
        extract(isodow from now())::int in (5,6,7) as is_weekend,
        case when extract(isodow from now())::int in (5,6,7) then coalesce(weekend_price, price) else coalesce(weekday_price, price) end as price,
        case when extract(isodow from now())::int in (5,6,7) then weekend_bonus else weekday_bonus end as bonus
       from tariffs
       where ${s.where} and is_active=true
       order by simulator_zone, duration_minutes, type, name`,
      ...s.values,
    );
  },
};
