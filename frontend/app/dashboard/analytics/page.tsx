"use client";

import { FiActivity, FiClock, FiRepeat, FiTrendingUp } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { Card } from "@/components/ui/card";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function AnalyticsPage() {
  const { revenue, revenueEvents, simulators, cashTransactions } = useDashboardStore();
  const active = simulators.filter((item) => item.status === "busy").length;
  const occupancy = simulators.length ? Math.round((active / simulators.length) * 100) : 0;
  const averageCheck = cashTransactions.length ? Math.round(revenue / cashTransactions.length) : 0;
  const peak = revenueEvents.reduce((max, event) => Math.max(max, event.amount), 0);
  const repeatCustomers = 0;
  const insights = [
    `Backend events: ${revenueEvents.length}`,
    `Active simulators: ${active}`,
    `Total simulators: ${simulators.length}`,
    `Cash transactions: ${cashTransactions.length}`,
  ];

  return (
    <div>
      <PageHeader title="Analitika" description="Management view for occupancy, average check and repeat customer behavior." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Occupancy rate" value={occupancy} icon={FiActivity} />
        <ReportCard label="Average check" value={averageCheck} icon={FiTrendingUp} />
        <ReportCard label="Peak event revenue" value={peak} icon={FiClock} />
        <ReportCard label="Repeat customers" value={repeatCustomers} icon={FiRepeat} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RevenueChart title="Daily / weekly revenue trend" />
        <Card className="space-y-3 p-4">
          {insights.map((item) => <div key={item} className="rounded-xl bg-slate-950 p-3 text-sm text-slate-300">{item}</div>)}
        </Card>
      </div>
    </div>
  );
}
