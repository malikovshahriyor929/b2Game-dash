"use client";

import { FiActivity, FiCreditCard, FiMonitor, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function DashboardPage() {
  const { revenue, simulators } = useDashboardStore();
  const activeCount = simulators.filter((s) => ["busy", "ending_soon", "unpaid"].includes(s.status)).length;
  const freeCount = simulators.filter((s) => s.status === "free").length;

  return (
    <div>
      <PageHeader title="Operator dashboard" description="Real-time simulator control, shift counters, and club floor map." badge="Desktop-first control room" />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Today revenue" value={revenue} icon={FiCreditCard} />
        <ReportCard label="Active sessions" value={activeCount} icon={FiActivity} format="number" />
        <ReportCard label="Free simulators" value={freeCount} icon={FiMonitor} format="number" />
        <ReportCard label="Shop sales" value={128000} icon={FiShoppingBag} />
      </div>
      <div className="mb-4"><RevenueChart /></div>
      <SimulatorMap />
    </div>
  );
}
