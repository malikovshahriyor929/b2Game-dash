"use client";

import { FiActivity, FiCreditCard, FiMonitor, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function DashboardPage() {
  const { revenue, simulators } = useDashboardStore();
  const activeCount = simulators.filter((s) => ["busy", "unpaid"].includes(s.status)).length;
  const freeCount = simulators.filter((s) => s.status === "ready_to_play").length;

  return (
    <div>
      <PageHeader title="B2 dashboard" description="Branch-scoped simulator control, revenue, shop sales, and repair monitoring." badge="Admin control room" />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Today revenue" value={revenue} icon={FiCreditCard} />
        <ReportCard label="Active sessions" value={activeCount} icon={FiActivity} format="number" />
        <ReportCard label="Ready simulators" value={freeCount} icon={FiMonitor} format="number" />
        <ReportCard label="Shop sales" value={128000} icon={FiShoppingBag} />
      </div>
      <div className="mb-4"><RevenueChart /></div>
      <SimulatorMap />
    </div>
  );
}
