"use client";

import { useSession } from "next-auth/react";
import { FiActivity, FiCreditCard, FiMonitor, FiShoppingBag } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export default function DashboardPage() {
  const { revenue, simulators, activeShift, shifts, barSales } = useDashboardStore();
  const { data: session } = useSession();
  const activeCount = simulators.filter((s) => ["busy", "unpaid"].includes(s.status)).length;
  const freeCount = simulators.filter((s) => s.status === "ready_to_play").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayShifts = shifts.filter((s) => s.date === today);
  const totalShiftEarnings = todayShifts.reduce((sum, s) => sum + s.totalIncome, 0);
  const shopSales = barSales.filter((sale) => sale.date === today).reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div>
      <PageHeader title="B2 dashboard" description="Branch-scoped simulator control, revenue, shop sales, and repair monitoring." badge="Admin control room" />
      
      {/* Active Session Info */}
      {activeShift && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="text-lg font-semibold">{activeShift.operator}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shift Type</p>
              <p className="text-lg font-semibold">{activeShift.shiftType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Cash</p>
              <p className="text-lg font-semibold">{activeShift.startingCash.toLocaleString()} UZS</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today Earnings</p>
              <p className="text-lg font-semibold text-green-400">{(activeShift.totalIncome).toLocaleString()} UZS</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Today revenue" value={revenue} icon={FiCreditCard} />
        <ReportCard label="Active sessions" value={activeCount} icon={FiActivity} format="number" />
        <ReportCard label="Ready simulators" value={freeCount} icon={FiMonitor} format="number" />
        <ReportCard label="Shop sales" value={shopSales} icon={FiShoppingBag} />
      </div>
      <div className="mb-4"><RevenueChart /></div>
      <SimulatorMap />
    </div>
  );
}
