"use client";

import { FiCheckCircle, FiEdit2, FiTrash2, FiUserX, FiXCircle } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDashboardStore } from "@/components/providers/dashboard-store";
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

export function BookingTable({ onEdit, onArrive }: { onEdit?: (booking: Booking) => void; onArrive?: (booking: Booking) => void }) {
  const { bookings, allSimulators, updateBooking, deleteBooking, noShowBooking } = useDashboardStore();
  const confirm = useConfirm();

  function patchStatus(booking: Booking, status: Booking["status"]) {
    updateBooking({ ...booking, status });
  }

  async function confirmCancel(booking: Booking) {
    const ok = await confirm({
      title: "Bron bekor qilinsinmi?",
      description: `${booking.customerName} — ${booking.date} ${booking.startTime}. Bron bekor qilinadi.`,
      confirmLabel: "Bekor qilish",
      cancelLabel: "Yo'q",
      tone: "warning",
    });
    if (ok) patchStatus(booking, "Cancelled");
  }

  async function confirmNoShow(booking: Booking) {
    const ok = await confirm({
      title: "Kelmadi (no-show)?",
      description: `${booking.customerName} kelmadi deb belgilanadi va simulyator bo'shatiladi.`,
      confirmLabel: "Kelmadi",
      cancelLabel: "Yo'q",
      tone: "warning",
    });
    if (ok) noShowBooking(booking);
  }

  async function confirmArrive(booking: Booking) {
    const ok = await confirm({
      title: "Mijoz keldi — sessiya boshlansinmi?",
      description: `${booking.customerName} uchun sessiya boshlash oynasi ochiladi.`,
      confirmLabel: "Davom etish",
      tone: "success",
    });
    if (ok) onArrive?.(booking);
  }

  async function confirmDelete(booking: Booking) {
    const ok = await confirm({
      title: "Bron o'chirilsinmi?",
      description: `${booking.customerName} — ${booking.date} ${booking.startTime}. Bu amalni qaytarib bo'lmaydi.`,
      confirmLabel: "O'chirish",
      tone: "destructive",
    });
    if (ok) deleteBooking(booking.id);
  }

  const isPending = (status: Booking["status"]) => status === "Pending" || status === "Confirmed";

  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Simulator</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((item) => {
          const simulator = allSimulators.find((sim) => sim.id === item.simulatorId);
          // Prefer the live simulator, then the name resolved by the backend, else a dash.
          const simulatorLabel = simulator
            ? `${simulator.branchName} - ${simulator.name}`
            : item.simulatorName
              ? (item.branchName ? `${item.branchName} - ${item.simulatorName}` : item.simulatorName)
              : "—";
          return (
            <TableRow key={item.id}>
              <TableCell>{item.customerName}<div className="text-xs text-slate-500">{formatUzPhone(item.phone)}</div></TableCell>
              <TableCell className="whitespace-nowrap">{simulatorLabel}</TableCell>
              <TableCell className="whitespace-nowrap">{item.date}</TableCell>
              <TableCell className="whitespace-nowrap">{item.startTime} - {item.endTime}</TableCell>
              <TableCell><Badge variant={badgeVariant(item.status)}>{item.status}</Badge></TableCell>
              <TableCell>
                <div className="flex justify-end gap-2 whitespace-nowrap">
                  <IconButton tooltip="Tahrirlash" variant="secondary" onClick={() => onEdit?.(item)}><FiEdit2 /></IconButton>
                  <IconButton tooltip="Keldi → sessiya boshlash" variant="success" disabled={!isPending(item.status)} onClick={() => confirmArrive(item)}><FiCheckCircle /></IconButton>
                  <IconButton tooltip="Kelmadi (no-show)" variant="warning" disabled={!isPending(item.status)} onClick={() => confirmNoShow(item)}><FiUserX /></IconButton>
                  <IconButton tooltip="Bekor qilish" variant="warning" disabled={!isPending(item.status)} onClick={() => confirmCancel(item)}><FiXCircle /></IconButton>
                  <IconButton tooltip="O'chirish" variant="destructive" onClick={() => confirmDelete(item)}><FiTrash2 /></IconButton>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
