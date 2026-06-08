import { CashierTabs } from "@/components/cashier/cashier-tabs";
import { PageHeader } from "@/components/shared/page-header";

export default function CashierPage() {
  return (
    <div>
      <PageHeader title="Kassa" description="Shop, top-up, return, post-payment, and session payment workspace." />
      <CashierTabs />
    </div>
  );
}
