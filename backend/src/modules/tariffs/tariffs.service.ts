import { baseRole } from "../../types/auth.types";
import { createGenericService } from "../_shared/generic.service";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";

function branchScope(req: Request) {
  if (baseRole(req.user?.role) === "admin") return { where: "branch_id=$1::uuid", values: [(req.user?.branch_id ?? null)] };
  const branchId = req.query.branch_id ?? req.body?.branch_id;
  if (!branchId || branchId === "all") return { where: "1=1", values: [] as unknown[] };
  return { where: "branch_id=$1::uuid", values: [branchId] };
}

const baseService = createGenericService({
  table: "tariffs",
  entity: "tariff",
  branchScoped: true,
  writableColumns: [
    "branch_id",
    "name",
    "simulator_zone",
    "duration_minutes",
    "price",
    "weekday_price",
    "weekend_price",
    "weekday_bonus",
    "weekend_bonus",
    "available_days",
    "available_from",
    "available_until",
    "availability_label",
    "type",
    "is_active",
  ],
});

const HAPPY_HOUR = {
  price: 25000,
  startHour: 10,
  endHour: 18,
  brandPattern: "Logitech%",
  isodowFrom: 1,
  isodowTo: 4,
} as const;

function happyHourSql(alias = "t") {
  return `(
    lower(${alias}.type) = 'happy_hour'
    or (
      ${alias}.simulator_zone = 'main'
      and ${alias}.duration_minutes = 25
      and coalesce(${alias}.weekday_price, ${alias}.price)::numeric = ${HAPPY_HOUR.price}
    )
  )`;
}

export const tariffsService = {
  ...baseService,
  async list(req: Request) {
    const s = branchScope(req);
    const includeAllPeriods = req.query.availability === "all";
    return prisma.$queryRawUnsafe(
      `with clock as (
         select
           extract(isodow from now() at time zone 'Asia/Tashkent')::int as dow,
           case when extract(isodow from now() at time zone 'Asia/Tashkent')::int = 1
             then 7
             else extract(isodow from now() at time zone 'Asia/Tashkent')::int - 1
           end as prev_dow,
           (now() at time zone 'Asia/Tashkent')::time as local_time
       ),
       scoped as (
         select
           t.*,
           c.dow in (6,7) as is_weekend,
           t.available_from is not null and t.available_until is not null and t.available_from > t.available_until as crosses_midnight,
           case
             when t.available_from is null or t.available_until is null then
               cardinality(t.available_days) = 0 or c.dow = any(t.available_days)
             when t.available_from <= t.available_until then
               (cardinality(t.available_days) = 0 or c.dow = any(t.available_days))
               and c.local_time >= t.available_from
               and c.local_time < t.available_until
             else
               (
                 (cardinality(t.available_days) = 0 or c.dow = any(t.available_days))
                 and c.local_time >= t.available_from
               )
               or
               (
                 (cardinality(t.available_days) = 0 or c.prev_dow = any(t.available_days))
                 and c.local_time < t.available_until
               )
           end as is_available,
           (
             c.dow between ${HAPPY_HOUR.isodowFrom} and ${HAPPY_HOUR.isodowTo}
             and (
               (lower(t.type) = 'time' and t.name ilike '${HAPPY_HOUR.brandPattern}')
               or ${happyHourSql("t")}
             )
             and c.local_time >= time '${HAPPY_HOUR.startHour}:00'
             and (c.local_time + make_interval(mins => t.duration_minutes)) <= time '${HAPPY_HOUR.endHour}:00'
           ) as is_happy_hour,
           t.available_from = time '17:00' as is_evening
         from tariffs t
         cross join clock c
         where ${s.where} and t.is_active=true
       ),
       priced as (
         select
           sc.*,
           sc.price as base_price,
           case
             when sc.is_weekend then coalesce(sc.weekend_price, sc.weekday_price, sc.price)
             else coalesce(sc.weekday_price, sc.weekend_price, sc.price)
           end as current_price,
           case
             when sc.is_weekend then coalesce(sc.weekend_bonus, sc.weekday_bonus)
             else coalesce(sc.weekday_bonus, sc.weekend_bonus)
           end as current_bonus,
           case
             when sc.is_happy_hour then 'happy_hour'
             when sc.is_evening then 'evening'
             when sc.is_weekend then 'weekend'
             else 'weekday'
           end as price_period
         from scoped sc
       )
       select
         *,
         current_price as price,
         current_bonus as bonus
       from priced
       where ($${s.values.length + 1}::boolean = true or is_available)
         and ($${s.values.length + 1}::boolean = true or not ${happyHourSql("priced")} or is_happy_hour)
       order by branch_id, simulator_zone, lower(trim(name)), duration_minutes, type, updated_at desc, id`,
      ...s.values,
      includeAllPeriods,
    );
  },
  async getAvailableById(id: string) {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `with clock as (
         select
           extract(isodow from now() at time zone 'Asia/Tashkent')::int as dow,
           case when extract(isodow from now() at time zone 'Asia/Tashkent')::int = 1
             then 7
             else extract(isodow from now() at time zone 'Asia/Tashkent')::int - 1
           end as prev_dow,
           (now() at time zone 'Asia/Tashkent')::time as local_time
       )
       select t.*
         from tariffs t cross join clock c
        where t.id=$1::uuid
          and t.is_active=true
          and case
            when t.available_from is null or t.available_until is null then
              cardinality(t.available_days) = 0 or c.dow = any(t.available_days)
            when t.available_from <= t.available_until then
              (cardinality(t.available_days) = 0 or c.dow = any(t.available_days))
              and c.local_time >= t.available_from
              and c.local_time < t.available_until
            else
              ((cardinality(t.available_days) = 0 or c.dow = any(t.available_days)) and c.local_time >= t.available_from)
              or ((cardinality(t.available_days) = 0 or c.prev_dow = any(t.available_days)) and c.local_time < t.available_until)
          end
        limit 1`,
      id,
    );
    return rows[0] ?? null;
  },
};

export async function assertTariffAvailableNow(tariffId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
     `with clock as (
       select
         extract(isodow from now() at time zone 'Asia/Tashkent')::int as dow,
         case when extract(isodow from now() at time zone 'Asia/Tashkent')::int = 1
           then 7
           else extract(isodow from now() at time zone 'Asia/Tashkent')::int - 1
         end as prev_dow,
         (now() at time zone 'Asia/Tashkent')::time as local_time
     )
     select t.id
       from tariffs t cross join clock c
      where t.id=$1::uuid
        and t.is_active=true
        and case
          when t.available_from is null or t.available_until is null then
            cardinality(t.available_days) = 0 or c.dow = any(t.available_days)
          when t.available_from <= t.available_until then
            (cardinality(t.available_days) = 0 or c.dow = any(t.available_days))
            and c.local_time >= t.available_from
            and c.local_time < t.available_until
          else
            ((cardinality(t.available_days) = 0 or c.dow = any(t.available_days)) and c.local_time >= t.available_from)
            or ((cardinality(t.available_days) = 0 or c.prev_dow = any(t.available_days)) and c.local_time < t.available_until)
        end
        and (
          not ${happyHourSql("t")}
          or (
            c.dow between ${HAPPY_HOUR.isodowFrom} and ${HAPPY_HOUR.isodowTo}
            and c.local_time >= time '${HAPPY_HOUR.startHour}:00'
            and (c.local_time + make_interval(mins => t.duration_minutes)) <= time '${HAPPY_HOUR.endHour}:00'
          )
        )
      limit 1`,
    tariffId,
  );
  if (!rows.length) throw new ApiError(409, "Bu tarif hozir aktiv emas");
}
