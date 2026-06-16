import { baseRole } from "../../types/auth.types";
import { Request } from "express";
import { prisma } from "../../db/prisma";
import { listRigMvpRigs } from "../../services/rigMvp.service";

const branchId = (req: Request) => (baseRole(req.user?.role) === "admin" ? (req.user?.branch_id ?? null) : req.query.branch_id === "all" ? null : req.query.branch_id ?? null);
const num = (value: unknown) => Number(value ?? 0);

export async function summary(req: Request) {
  const branch = branchId(req);
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select
      (select coalesce(sum(amount),0) from payments where status='paid' and ($1::uuid is null or branch_id=$1)) revenue,
      (select coalesce(sum(profit),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1)) profit,
      (select count(*)::int from sessions where status='active' and ($1::uuid is null or branch_id=$1)) active_sessions,
      (select count(*)::int from repair_requests where status in ('requested','approved','fixing') and ($1::uuid is null or branch_id=$1)) pending_repairs,
      (select coalesce(sum(total),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1)) shop_sales,
      (select coalesce(sum(profit),0) from sales where payment_status='paid' and ($1::uuid is null or branch_id=$1)) product_profit,
      (select coalesce(sum(debt_amount),0) from sessions where debt_amount>0 and ($1::uuid is null or branch_id=$1)) unpaid_amount,
      (select count(*)::int from bookings where start_time::date=current_date and ($1::uuid is null or branch_id=$1)) bookings_today`,
    branch,
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
