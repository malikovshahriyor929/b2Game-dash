"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingTable } from "@/components/bookings/booking-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Booking } from "@/types/booking";

export function BookingsWorkspace() {
  const { loading } = useDashboardStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  function openCreate() {
    setEditingBooking(null);
    setModalOpen(true);
  }

  function openEdit(booking: Booking) {
    setEditingBooking(booking);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBooking(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><FiPlus /> Add bron</Button>
      </div>
      {loading ? <TableSkeleton rows={6} cols={6} /> : <BookingTable onEdit={openEdit} />}
      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="max-h-[92dvh] w-[min(94vw,1040px)] max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBooking ? "Bronni tahrirlash" : "Add bron"}</DialogTitle>
            <DialogDescription>{editingBooking ? "Bron ma'lumotlarini yangilang." : "Yangi bron yaratish uchun mijoz va vaqt ma'lumotlarini kiriting."}</DialogDescription>
          </DialogHeader>
          <BookingForm key={editingBooking?.id ?? "new"} booking={editingBooking} onSaved={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
