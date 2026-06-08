import { Request } from "express"; import { prisma } from "../../db/prisma";
export async function overview(){const rows=await prisma.$queryRawUnsafe<any[]>(`select
 (select json_agg(x) from (select b.name, coalesce(sum(p.amount),0) revenue from branches b left join payments p on p.branch_id=b.id group by b.id order by revenue desc) x) branch_revenue_ranking,
 (select count(*) from repair_requests where status in ('requested','approved','fixing')) pending_repairs,
 (select count(*) from sessions where status='active') active_sessions,
 (select json_agg(y) from (select * from logs order by created_at desc limit 20) y) recent_logs`); return rows[0];}
export const branches=()=>prisma.$queryRawUnsafe("select b.*, count(s.id) simulators, coalesce(sum(p.amount),0) revenue from branches b left join simulators s on s.branch_id=b.id left join payments p on p.branch_id=b.id group by b.id order by b.name");
export const adminActions=()=>prisma.$queryRawUnsafe("select actor_name, actor_role, count(*) actions from logs where actor_id is not null group by actor_name, actor_role order by actions desc");
export const repairTimeline=()=>prisma.$queryRawUnsafe("select * from repair_requests order by created_at desc");
export const salesLive=()=>prisma.$queryRawUnsafe("select * from sales order by created_at desc limit 50");
export const simulatorLive=()=>prisma.$queryRawUnsafe("select * from simulators order by updated_at desc");
