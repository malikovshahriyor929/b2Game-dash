import { CashierTabs } from "@/components/cashier/cashier-tabs";
import { PageHeader } from "@/components/shared/page-header";

export default function CashierPage() {
  return (
    <div>
      <PageHeader title="Kassa" description="Do'kon, balans to'ldirish, qaytarish, Post-pay va sessiya to'lovlari uchun ish maydoni." />
      <CashierTabs />
    </div>
  );
}
