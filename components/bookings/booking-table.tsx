"use client";

import { FiCheckCircle, FiEdit2, FiTrash2, FiXCircle } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";
import { Booking } from "@/types/booking";

function badgeVariant(status: Booking["status"]) {
  if (status === "Cancelled" || status === "No-show") return "destructive";
  if (status === "Arrived" || status === "Completed") return "success";
  return "warning";
}

function formatUzPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("998") ? digits.slice(3) : digits;
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return digits.startsWith("998") ? `+998 ${parts.join(" ")}` : value;
}

export function BookingTable({ onEdit }: { onEdit?: (booking: Booking) => void }) {
  const { bookings, allSimulators, updateBooking, deleteBooking } = useDashboardStore();

  function patchStatus(booking: Booking, status: Booking["status"]) {
    updateBooking({ ...booking, status });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Simulator</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Tariff</TableHead>
          <TableHead>Prepay</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((item) => {
          const simulator = allSimulators.find((sim) => sim.id === item.simulatorId);
          return (
            <TableRow key={item.id}>
              <TableCell>{item.customerName}<div className="text-xs text-slate-500">{formatUzPhone(item.phone)}</div></TableCell>
              <TableCell>{simulator ? `${simulator.branchName} - ${simulator.name}` : item.simulatorId}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.startTime} - {item.endTime}</TableCell>
              <TableCell>{item.tariff}</TableCell>
              <TableCell>{money(item.prepayment)}</TableCell>
              <TableCell><Badge variant={badgeVariant(item.status)}>{item.status}</Badge></TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="secondary" onClick={() => onEdit?.(item)} aria-label="Edit booking"><FiEdit2 /></Button>
                  <Button size="icon" variant="success" disabled={item.status === "Arrived"} onClick={() => patchStatus(item, "Arrived")} aria-label="Mark arrived"><FiCheckCircle /></Button>
                  <Button size="icon" variant="warning" disabled={item.status === "Cancelled"} onClick={() => patchStatus(item, "Cancelled")} aria-label="Cancel booking"><FiXCircle /></Button>
                  <Button size="icon" variant="destructive" onClick={() => deleteBooking(item.id)} aria-label="Delete booking"><FiTrash2 /></Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
