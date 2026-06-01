"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SimulatorCard } from "@/components/simulator/simulator-card";
import { SimulatorDetailSheet } from "@/components/simulator/simulator-detail-sheet";
import { AddTimeDialog } from "@/components/simulator/add-time-dialog";
import { PaymentDialog } from "@/components/simulator/payment-dialog";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { StopSessionDialog } from "@/components/simulator/stop-session-dialog";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

const filters = ["All", "Racing", "VR", "Console", "VIP", "Free", "Busy", "Reserved", "Offline", "Maintenance"];

export function SimulatorMap() {
  const { simulators, selectedId, selected, setSelectedId } = useDashboardStore();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState<"start" | "addTime" | "payment" | "stop" | null>(null);

  const visible = useMemo(() => simulators.filter((item) => {
    const text = `${item.name} ${item.currentUser ?? ""} ${item.phone ?? ""} ${item.id}`.toLowerCase();
    const matchesSearch = text.includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      item.type.includes(filter) ||
      (filter === "Console" && item.type.includes("Console")) ||
      item.status === filter.toLowerCase() ||
      (filter === "VIP" && item.type === "VIP Room");
    return matchesSearch && matchesFilter;
  }), [filter, query, simulators]);

  const zones = ["Main Racing Zone", "VR Zone", "Console Zone", "VIP Zone", "Service Area"];

  function openCard(item: Simulator) {
    setSelectedId(item.id);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "secondary"} onClick={() => setFilter(item)}>{item}</Button>)}
        <div className="relative ml-auto w-80">
          <FiSearch className="absolute left-3 top-2.5 text-slate-500" />
          <Input className="h-9 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, customer, phone, order ID" />
        </div>
      </div>
      <div className="operator-grid rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {zones.map((zone) => {
            const list = visible.filter((item) => item.zone === zone || (zone === "Service Area" && ["maintenance", "offline", "locked"].includes(item.status)));
            return (
              <section key={zone} className="min-h-[360px] rounded-2xl border border-slate-800/80 bg-slate-950/45 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-200">{zone}</h2>
                  <Badge variant="muted">{list.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {list.map((item) => <SimulatorCard key={item.id} simulator={item} selected={selectedId === item.id} onClick={() => openCard(item)} />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <SimulatorDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} simulator={selected} onAction={(action) => setSheetAction(action)} />
      <StartSessionDialog open={sheetAction === "start"} onOpenChange={(open) => setSheetAction(open ? "start" : null)} simulator={selected} />
      <AddTimeDialog open={sheetAction === "addTime"} onOpenChange={(open) => setSheetAction(open ? "addTime" : null)} simulator={selected} />
      <PaymentDialog open={sheetAction === "payment"} onOpenChange={(open) => setSheetAction(open ? "payment" : null)} simulator={selected} />
      <StopSessionDialog open={sheetAction === "stop"} onOpenChange={(open) => setSheetAction(open ? "stop" : null)} simulator={selected} />
    </div>
  );
}
