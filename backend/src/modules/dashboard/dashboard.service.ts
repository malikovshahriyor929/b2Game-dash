import { Request } from "express";
import { prisma } from "../../db/prisma";
import { listRigMvpRigs } from "../../services/rigMvp.service";
import { actorScope } from "../../utils/scope";

const num = (value: unknown) => Number(value ?? 0);

// $1 = filial (null=barchasi), $2 = admin (null=cheklamaydi, ya'ni super_admin).
// Daromad real olingan pul (naqd+karta+QR); balansdan to'lov chiqariladi (ikki marta sanamaslik uchun).
export async function summary(req: Request) {
  const s = actorScope(req);
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select
      (select coalesce(sum(cash_amount+card_amount+qr_amount),0) from payments where status='paid' and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or paid_by_admin_id=$2)) revenue,
      (select coalesce(sum(profit),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or sold_by=$2)) profit,
      (select count(*)::int from sessions where status='active' and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or created_by=$2)) active_sessions,
      (select count(*)::int from repair_requests where status in ('requested','approved','fixing') and ($1::uuid is null or branch_id=$1)) pending_repairs,
      (select coalesce(sum(total),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or sold_by=$2)) shop_sales,
      (select coalesce(sum(profit),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or sold_by=$2)) product_profit,
      (select coalesce(sum(debt_amount),0) from sessions where debt_amount>0 and ($1::uuid is null or branch_id=$1) and ($2::uuid is null or created_by=$2)) unpaid_amount,
      (select count(*)::int from bookings where start_time::date=current_date and ($1::uuid is null or branch_id=$1)) bookings_today`,
    s.branch, s.actor,
  );
  const row = rows[0] ?? {};
  const rigs = await listRigMvpRigs().catch(() => []);
  const ready = rigs.filter((rig) => rig.online && (rig.locked || rig.state === "Available")).length;
  const busy = rigs.filter((rig) => rig.online && !rig.locked && rig.state !== "Available").length;
  const offline = rigs.filter((rig) => !rig.online || rig.state === "Offline").length;

  return {
    revenue: num(row.revenue),
    profit: num(row.profit),
    active_sessions: num(row.active_sessions),
    ready_simulators: ready,
    busy_simulators: busy,
    broken_simulators: 0,
    offline_simulators: offline,
    pending_repairs: num(row.pending_repairs),
    shop_sales: num(row.shop_sales),
    product_profit: num(row.product_profit),
    unpaid_amount: num(row.unpaid_amount),
    bookings_today: num(row.bookings_today),
  };
}

// Oxirgi 7 kun (bugun ham kirgan) bo'yicha kunlik daromad — naqd+karta+QR (balanssiz), per-admin.
// generate_series har kun uchun qator beradi, to'lov bo'lmagan kun 0 bo'lib chiqadi.
export async function revenue7d(req: Request) {
  const s = actorScope(req);
  const rows = await prisma.$queryRawUnsafe<Array<{ day: string; revenue: unknown }>>(
    `select to_char(d.day::date,'YYYY-MM-DD') as day,
            coalesce(sum(p.cash_amount+p.card_amount+p.qr_amount),0) as revenue
       from generate_series((current_date - interval '6 days')::date, current_date, interval '1 day') d(day)
       left join payments p on p.paid_at::date = d.day::date and p.status='paid'
            and ($1::uuid is null or p.branch_id=$1::uuid)
            and ($2::uuid is null or p.paid_by_admin_id=$2::uuid)
      group by d.day order by d.day`,
    s.branch, s.actor,
  );
  return rows.map((r) => ({ day: r.day, revenue: num(r.revenue) }));
}
