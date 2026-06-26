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

const baseService = createGenericService({ table: "tariffs", entity: "tariff", branchScoped: true, writableColumns: ["branch_id","name","simulator_zone","duration_minutes","price","weekday_price","weekend_price","weekday_bonus","weekend_bonus","type","is_active"] });

// Happy hour (skidka): Logitech soatlik tarifiga Dushanba–Payshanba (isodow 1–4)
// soat 10:00–18:00 oralig'ida chegirma narxi. Sessiya 18:00 dan oshmasligi shart, ya'ni
// boshlanish vaqti + tarif davomiyligi <= 18:00 bo'lganda chegirma qo'llanadi:
//   - 1 soatlik tarif faqat 17:00 gacha ochilsa chegirma (17:00 dan keyin eski narx);
//   - qo'shimcha vaqt 18:00 dan o'tib ketsa, u ham eski (to'liq) narxda.
// Hisoblash bitta joyda (tariff list) bo'lgani uchun start-session ham, add-time ham
// avtomatik chegirmali/to'liq narxni oladi.
const HAPPY_HOUR = {
  price: 25000,
  startHour: 10,
  endHour: 18,
  brandPattern: "Logitech%",
  // Dushanba–Payshanba (isodow: 1=Du ... 7=Ya).
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
    return prisma.$queryRawUnsafe(
      `with clock as (
         select
           extract(isodow from now() at time zone 'Asia/Tashkent')::int as dow,
           (now() at time zone 'Asia/Tashkent')::time as local_time
       ),
       scoped as (
         select
           t.*,
           c.dow in (6,7) as is_weekend,
           (
             c.dow between ${HAPPY_HOUR.isodowFrom} and ${HAPPY_HOUR.isodowTo}
             and (
               (lower(t.type) = 'time' and t.name ilike '${HAPPY_HOUR.brandPattern}')
               or ${happyHourSql("t")}
             )
             and c.local_time >= time '${HAPPY_HOUR.startHour}:00'
             and (c.local_time + make_interval(mins => t.duration_minutes)) <= time '${HAPPY_HOUR.endHour}:00'
           ) as is_happy_hour
         from tariffs t
         cross join clock c
         where ${s.where} and t.is_active=true
       ),
       priced as (
         select
           sc.*,
           sc.price as base_price,
           false as is_evening,
           case
             when sc.is_happy_hour then ${HAPPY_HOUR.price}
             when sc.is_weekend then coalesce(sc.weekend_price, sc.price)
             else coalesce(sc.weekday_price, sc.price)
           end as current_price,
           case when sc.is_weekend then sc.weekend_bonus else sc.weekday_bonus end as current_bonus,
           case
             when sc.is_happy_hour then 'happy_hour'
             when sc.is_weekend then 'weekend'
             else 'weekday'
           end as price_period
         from scoped sc
       )
       select distinct on (branch_id, simulator_zone, lower(trim(name)), duration_minutes, type)
         *,
         current_price as price,
         current_bonus as bonus
       from priced
       where not ${happyHourSql("priced")} or is_happy_hour
       order by branch_id, simulator_zone, lower(trim(name)), duration_minutes, type, updated_at desc, id`,
      ...s.values,
    );
  },
};

export async function assertTariffAvailableNow(tariffId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `with clock as (
       select
         extract(isodow from now() at time zone 'Asia/Tashkent')::int as dow,
         (now() at time zone 'Asia/Tashkent')::time as local_time
     )
     select t.id
       from tariffs t cross join clock c
      where t.id=$1::uuid
        and t.is_active=true
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
