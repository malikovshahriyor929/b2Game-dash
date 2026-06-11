"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { AddTimeDialog } from "@/components/simulator/add-time-dialog";
import { PaymentDialog } from "@/components/simulator/payment-dialog";
import { StopSessionDialog } from "@/components/simulator/stop-session-dialog";
import { DashboardStoreProvider, useDashboardStore } from "@/components/providers/dashboard-store";
import { Skeleton } from "@/components/ui/skeleton";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<"start" | "addTime" | "payment" | "stop" | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { selected } = useDashboardStore();

  return (
    <div className="flex h-dvh overflow-hidden bg-[#070b15] text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onAction={setDialog} onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto p-3 thin-scrollbar sm:p-4 lg:p-5">{children}</main>
      </div>
      <StartSessionDialog open={dialog === "start"} onOpenChange={(open) => setDialog(open ? "start" : null)} simulator={selected} />
      <AddTimeDialog open={dialog === "addTime"} onOpenChange={(open) => setDialog(open ? "addTime" : null)} simulator={selected} />
      <PaymentDialog open={dialog === "payment"} onOpenChange={(open) => setDialog(open ? "payment" : null)} simulator={selected} />
      <StopSessionDialog open={dialog === "stop"} onOpenChange={(open) => setDialog(open ? "stop" : null)} simulator={selected} onTakePayment={() => setDialog("payment")} />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated" || session?.authError === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/login" });
    }
  }, [session?.authError, status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex h-dvh gap-4 bg-[#070b15] p-4">
        <Skeleton className="hidden h-full w-60 shrink-0 rounded-2xl lg:block" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <DashboardStoreProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardStoreProvider>
  );
}
