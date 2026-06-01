"use client";

import { FiActivity, FiCreditCard, FiMonitor, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function DashboardPage() {
  const { revenue, simulators } = useDashboardStore();
  return (
    <div>
      <PageHeader title="Operator dashboard" description="Real-time simulator control, shift counters, and club floor map." badge="Desktop-first control room" />
      <div className="mb-4 grid grid-cols-4 gap-3">
        <ReportCard label="Today revenue" value={revenue} icon={FiCreditCard} />
        <ReportCard label="Active sessions" value={simulators.filter((s) => s.status === "busy").length} icon={FiActivity} />
        <ReportCard label="Free simulators" value={simulators.filter((s) => s.status === "free").length} icon={FiMonitor} />
        <ReportCard label="Shop sales" value={128000} icon={FiShoppingBag} />
      </div>
      <div className="mb-4"><RevenueChart /></div>
      <SimulatorMap />
    </div>
  );
}
