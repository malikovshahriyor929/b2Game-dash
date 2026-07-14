import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { isUuid } from "../../utils/ids";
import { baseRole } from "../../types/auth.types";

function branch(req: Request) {
  const value = baseRole(req.user?.role) === "admin" ? req.user?.branch_id : req.body.branch_id ?? req.query.branch_id;
  return value === "all" ? null : value;
}

function listBranch(req: Request) {
  const value = baseRole(req.user?.role) === "admin" ? req.user?.branch_id : req.query.branch_id;
  return !value || value === "all" ? null : value;
}

function bookingType(value: unknown) {
  return value === "repair_booking" ? "repair_booking" : "customer_booking";
}

async function assertSimulatorInBranch(simulatorId: unknown, branchId: unknown) {
  if (!isUuid(simulatorId)) throw new ApiError(400, "Booking simulator_id must be backend simulator UUID");
  if (!isUuid(branchId)) throw new ApiError(400, "branch_id is required");

  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    "select id from simulators where id=$1::uuid and branch_id=$2::uuid limit 1",
    simulatorId,
    branchId,
  );
  if (!rows.length) throw new ApiError(404, "Simulator not found in selected branch");
}

async function getScopedBooking(req: Request, id: string) {
  const scopedBranch = baseRole(req.user?.role) === "admin" ? req.user?.branch_id ?? null : null;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "select * from bookings where id=$1::uuid and ($2::uuid is null or branch_id=$2::uuid) limit 1",
    id,
    scopedBranch,
  );
  if (!rows.length) throw new ApiError(404, "Booking not found");
  return rows[0];
}

export const list = (req: Request) =>
  prisma.$queryRawUnsafe(
    "select b.*, s.name as simulator_name, s.code as simulator_code, s.zone as simulator_zone, br.name as branch_name from bookings b left join simulators s on s.id=b.simulator_id left join branches br on br.id=b.branch_id where ($1::uuid is null or b.branch_id=$1::uuid) order by b.start_time desc",
    listBranch(req),
  );

export async function create(req: Request) {
  const b = branch(req);
  await assertSimulatorInBranch(req.body.simulator_id, b);

  const conflict = await prisma.$queryRawUnsafe<any[]>(
    "select id from bookings where simulator_id=$1::uuid and status not in ('cancelled','no_show','completed') and tstzrange(start_time,end_time) && tstzrange($2::timestamptz,$3::timestamptz)",
    req.body.simulator_id,
    req.body.start_time,
    req.body.end_time,
  );
  if (conflict.length) throw new ApiError(409, "Booking time conflict");

  const row = (await prisma.$queryRawUnsafe<any[]>(
    "insert into bookings(branch_id,simulator_id,booking_type,customer_id,customer_name,phone,repair_request_id,start_time,end_time,status,tariff_name,prepayment,note,created_by) values($1::uuid,$2::uuid,$3,$4::uuid,$5,$6,$7::uuid,$8::timestamptz,$9::timestamptz,$10,$11,$12,$13,$14::uuid) returning *",
    b,
    req.body.simulator_id,
    bookingType(req.body.booking_type),
    req.body.customer_id ?? null,
    req.body.customer_name ?? null,
    req.body.phone ?? null,
    req.body.repair_request_id ?? null,
    req.body.start_time,
    req.body.end_time,
    req.body.status ?? "confirmed",
    req.body.tariff_name ?? null,
    Number(req.body.prepayment ?? 0),
    req.body.note ?? null,
    req.user!.user_id,
  ))[0];
  await auditLog({ actor: req.user, branch_id: b, action_type: "booking_created", entity_type: "booking", entity_id: row.id });
  broadcastDashboard("booking_created", row, b);
  return row;
}

export async function update(req: Request) {
  const existing = await getScopedBooking(req, String(req.params.id));
  if (req.body.simulator_id) await assertSimulatorInBranch(req.body.simulator_id, existing.branch_id);

  const row = (await prisma.$queryRawUnsafe<any[]>(
    "update bookings set customer_name=coalesce($1,customer_name), phone=coalesce($2,phone), simulator_id=coalesce($3::uuid,simulator_id), start_time=coalesce($4::timestamptz,start_time), end_time=coalesce($5::timestamptz,end_time), status=coalesce($6,status), tariff_name=coalesce($7,tariff_name), prepayment=coalesce($8,prepayment), note=coalesce($9,note), updated_at=now() where id=$10::uuid returning *",
    req.body.customer_name ?? null,
    req.body.phone ?? null,
    req.body.simulator_id ?? null,
    req.body.start_time ?? null,
    req.body.end_time ?? null,
    req.body.status ?? null,
    req.body.tariff_name ?? null,
    req.body.prepayment == null ? null : Number(req.body.prepayment),
    req.body.note ?? null,
    String(req.params.id),
  ))[0];
  if (!row) throw new ApiError(404, "Booking not found");
  return row;
}

export async function status(req: Request, status: string, action: string) {
  await getScopedBooking(req, String(req.params.id));
  const row = (await prisma.$queryRawUnsafe<any[]>("update bookings set status=$1, updated_at=now() where id=$2::uuid returning *", status, String(req.params.id)))[0];
  if (!row) throw new ApiError(404, "Booking not found");
  await auditLog({ actor: req.user, branch_id: row.branch_id, action_type: action, entity_type: "booking", entity_id: row.id });
  return row;
}
