"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingTable } from "@/components/bookings/booking-table";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Booking } from "@/types/booking";
import { Simulator } from "@/types/simulator";

export function BookingsWorkspace() {
  const { loading, allSimulators, arriveBooking } = useDashboardStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [startSim, setStartSim] = useState<Simulator | undefined>(undefined);
  const [startPrefill, setStartPrefill] = useState<{ customerName?: string; phone?: string; tariffName?: string; prepayment?: number } | undefined>(undefined);
  const [fulfillBookingId, setFulfillBookingId] = useState<string | undefined>(undefined);
  const [startOpen, setStartOpen] = useState(false);

  function openCreate() {
    setEditingBooking(null);
    setModalOpen(true);
  }

  function openEdit(booking: Booking) {
    setEditingBooking(booking);
    setModalOpen(true);
  }

  function handleArrive(booking: Booking) {
    arriveBooking(booking);
    const simulator = allSimulators.find((item) => item.id === booking.simulatorId);
    if (!simulator) return; // Simulyator joriy filialda topilmasa, faqat "arrived" belgilanadi.
    setStartSim(simulator);
    setStartPrefill({ customerName: booking.customerName, phone: booking.phone, tariffName: booking.tariff, prepayment: booking.prepayment });
    setFulfillBookingId(booking.id);
    setStartOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBooking(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><FiPlus /> Bron qo'shish</Button>
      </div>
      {loading ? <TableSkeleton rows={6} cols={6} /> : <BookingTable onEdit={openEdit} onArrive={handleArrive} />}
      <StartSessionDialog open={startOpen} onOpenChange={setStartOpen} simulator={startSim} prefill={startPrefill} fulfillBookingId={fulfillBookingId} />
      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="max-h-[92dvh] w-[min(94vw,1040px)] max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBooking ? "Bronni tahrirlash" : "Bron qo'shish"}</DialogTitle>
            <DialogDescription>{editingBooking ? "Bron ma'lumotlarini yangilang." : "Yangi bron yaratish uchun mijoz va vaqt ma'lumotlarini kiriting."}</DialogDescription>
          </DialogHeader>
          <BookingForm key={editingBooking?.id ?? "new"} booking={editingBooking} onSaved={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
