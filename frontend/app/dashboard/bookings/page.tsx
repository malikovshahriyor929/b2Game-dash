import { BookingsWorkspace } from "@/components/bookings/bookings-workspace";
import { PageHeader } from "@/components/shared/page-header";

export default function BookingsPage() {
  return (
    <div>
      <PageHeader title="Bronlar" description="Ziddiyat ogohlantirishi va band qilingan simulyatorlarni ko'rsatuvchi bronlar." />
      <BookingsWorkspace />
    </div>
  );
}
