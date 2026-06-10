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
      `with tariff_time as (
         select
           extract(isodow from now() at time zone 'Asia/Tashkent')::int in (5,6,7) as is_weekend,
           extract(hour from now() at time zone 'Asia/Tashkent')::int >= 18 as is_evening
       ),
       scoped as (
         select
           t.*,
           t.price as base_price,
           tt.is_weekend,
           tt.is_evening,
           case when tt.is_weekend or tt.is_evening then coalesce(t.weekend_price, t.price) else coalesce(t.weekday_price, t.price) end as current_price,
           case when tt.is_weekend or tt.is_evening then t.weekend_bonus else t.weekday_bonus end as current_bonus,
           case when tt.is_weekend then 'weekend' when tt.is_evening then 'evening' else 'weekday' end as price_period
         from tariffs t
         cross join tariff_time tt
         where ${s.where} and t.is_active=true
       )
       select distinct on (branch_id, simulator_zone, lower(trim(name)), duration_minutes, type)
         *,
         current_price as price,
         current_bonus as bonus
       from scoped
       order by branch_id, simulator_zone, lower(trim(name)), duration_minutes, type, updated_at desc, id`,
      ...s.values,
    );
  },
};
