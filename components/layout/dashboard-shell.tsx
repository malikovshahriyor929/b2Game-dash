"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { AddTimeDialog } from "@/components/simulator/add-time-dialog";
import { PaymentDialog } from "@/components/simulator/payment-dialog";
import { StopSessionDialog } from "@/components/simulator/stop-session-dialog";
import { DashboardStoreProvider, useDashboardStore } from "@/components/providers/dashboard-store";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<"start" | "addTime" | "payment" | "stop" | null>(null);
  const { selected } = useDashboardStore();

  return (
    <div className="flex h-screen bg-[#070b15] text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onAction={setDialog} />
        <main className="min-h-0 flex-1 overflow-auto p-4 thin-scrollbar">{children}</main>
      </div>
      <StartSessionDialog open={dialog === "start"} onOpenChange={(open) => setDialog(open ? "start" : null)} simulator={selected} />
      <AddTimeDialog open={dialog === "addTime"} onOpenChange={(open) => setDialog(open ? "addTime" : null)} simulator={selected} />
      <PaymentDialog open={dialog === "payment"} onOpenChange={(open) => setDialog(open ? "payment" : null)} simulator={selected} />
      <StopSessionDialog open={dialog === "stop"} onOpenChange={(open) => setDialog(open ? "stop" : null)} simulator={selected} onTakePayment={() => setDialog("payment")} />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardStoreProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardStoreProvider>
  );
}
