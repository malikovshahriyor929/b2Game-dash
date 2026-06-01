import { BookingForm } from "@/components/bookings/booking-form";
import { BookingTable } from "@/components/bookings/booking-table";
import { PageHeader } from "@/components/shared/page-header";

export default function BookingsPage() {
  return (
    <div>
      <PageHeader title="Bronlar" description="Reservations with conflict warning and reserved simulator visibility." />
      <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-4"><BookingForm /><BookingTable /></div>
    </div>
  );
}
