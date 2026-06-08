import { BookingsWorkspace } from "@/components/bookings/bookings-workspace";
import { PageHeader } from "@/components/shared/page-header";

export default function BookingsPage() {
  return (
    <div>
      <PageHeader title="Bronlar" description="Reservations with conflict warning and reserved simulator visibility." />
      <BookingsWorkspace />
    </div>
  );
}
