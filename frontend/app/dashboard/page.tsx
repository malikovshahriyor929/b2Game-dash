"use client";

import { useSession } from "next-auth/react";
import { FiActivity, FiCreditCard, FiMonitor, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { WeeklyRevenueChart } from "@/components/reports/weekly-revenue-chart";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { StatCardsSkeleton, ChartSkeleton, MapSkeleton } from "@/components/ui/skeletons";
import { localDate } from "@/lib/datetime";

export default function DashboardPage() {
  const { loading, revenue, simulators, activeShift, shifts, barSales } = useDashboardStore();
  const { data: session } = useSession();
  const activeCount = simulators.filter((s) => ["busy", "unpaid"].includes(s.status)).length;
  const freeCount = simulators.filter((s) => s.status === "ready_to_play").length;
  const today = localDate();
  const todayShifts = shifts.filter((s) => s.date === today);
  const totalShiftEarnings = todayShifts.reduce((sum, s) => sum + s.totalIncome, 0);
  const shopSales = barSales.filter((sale) => sale.date === today).reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div>
      <PageHeader title="B2 dashboard" description="Branch-scoped simulator control, revenue, shop sales, and repair monitoring." badge="Admin control room" />
      
      {/* Active Session Info */}
      {activeShift && (
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 p-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="break-words text-lg font-semibold leading-snug">{activeShift.operator}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Shift Type</p>
              <p className="break-words text-lg font-semibold leading-snug">{activeShift.shiftType}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Start Cash</p>
              <p className="break-words text-lg font-semibold leading-snug">{activeShift.startingCash.toLocaleString()} UZS</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Today Earnings</p>
              <p className="break-words text-lg font-semibold leading-snug text-green-400">{(activeShift.totalIncome).toLocaleString()} UZS</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <>
          <StatCardsSkeleton className="mb-4" />
          <div className="mb-4"><ChartSkeleton /></div>
          <MapSkeleton />
        </>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ReportCard label="Today revenue" value={revenue} icon={FiCreditCard} />
            <ReportCard label="Active sessions" value={activeCount} icon={FiActivity} format="number" />
            <ReportCard label="Ready simulators" value={freeCount} icon={FiMonitor} format="number" />
            <ReportCard label="Shop sales" value={shopSales} icon={FiShoppingBag} />
          </div>
          <div className="mb-4 grid gap-4 xl:grid-cols-2">
            <RevenueChart />
            <WeeklyRevenueChart />
          </div>
          <SimulatorMap />
        </>
      )}
    </div>
  );
}
