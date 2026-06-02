"use client";

import { useMemo, useState } from "react";
import { FiCoffee, FiCreditCard, FiSearch, FiUsers } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SimulatorDetailSheet } from "@/components/simulator/simulator-detail-sheet";
import { AddTimeDialog } from "@/components/simulator/add-time-dialog";
import { PaymentDialog } from "@/components/simulator/payment-dialog";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { StopSessionDialog } from "@/components/simulator/stop-session-dialog";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { minutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Simulator, SimulatorStatus } from "@/types/simulator";

const filters = ["All", "Racing", "VR", "Console", "VIP", "Free", "Busy", "Reserved", "Offline", "Maintenance"];
const mapColumns = 16;
const mapRows = 9;

type MapPosition = { col: number; row: number; colSpan?: number; rowSpan?: number };

const simulatorPositions: Record<string, MapPosition> = {
  "race-01": { col: 2, row: 1 },
  "race-02": { col: 2, row: 2 },
  "race-03": { col: 2, row: 3 },
  "race-04": { col: 2, row: 4 },
  "race-05": { col: 15, row: 1 },
  "vr-01": { col: 7, row: 1 },
  "vr-02": { col: 7, row: 2 },
  "ps5-01": { col: 10, row: 1 },
  "ps5-02": { col: 10, row: 2 },
  "ps5-03": { col: 15, row: 2 },
  "xbox-01": { col: 15, row: 3 },
  "vip-01": { col: 12, row: 1 },
  "vip-02": { col: 13, row: 1 },
  "vip-03": { col: 12, row: 2 },
};

const facilities = [
  { key: "cashier", label: "Kassa", icon: FiCreditCard, position: { col: 8, row: 6 } },
  { key: "wc", label: "WC", icon: FiUsers, position: { col: 8, row: 2 } },
  { key: "shop", label: "Shop", icon: FiCoffee, position: { col: 1, row: 5 } },
];

const statusClass: Record<SimulatorStatus, string> = {
  free: "border-slate-600 bg-slate-800/70 text-slate-200",
  busy: "border-emerald-400/70 bg-emerald-950/35 text-emerald-50",
  reserved: "border-amber-400/80 bg-amber-950/30 text-amber-50",
  ending_soon: "border-orange-400 bg-orange-950/35 text-orange-50",
  unpaid: "border-red-400/80 bg-red-950/35 text-red-50",
  offline: "border-slate-700 bg-slate-950/80 text-slate-500 opacity-70",
  maintenance: "border-fuchsia-400/70 bg-fuchsia-950/35 text-fuchsia-50",
  locked: "border-slate-600 bg-slate-950/75 text-slate-400 opacity-80",
  paused: "border-amber-400/80 bg-amber-950/35 text-amber-50",
};

const statusLabels: Record<SimulatorStatus, string> = {
  free: "Bo'sh",
  busy: "Band",
  reserved: "Bron",
  ending_soon: "Tugayapti",
  unpaid: "Qarz",
  offline: "Offline",
  maintenance: "Servis",
  locked: "Qulf",
  paused: "Pauza",
};

function mapTypeLabel(simulator: Simulator) {
  if (simulator.type === "VIP Room") return "VIP";
  if (simulator.type.includes("Console")) return simulator.type.replace(" / ", " ");
  return simulator.type.toUpperCase();
}

function Tile({ simulator, selected, onClick }: { simulator: Simulator; selected: boolean; onClick: () => void }) {
  const position = simulatorPositions[simulator.id] ?? { col: 1, row: 1 };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative z-10 flex min-h-[74px] flex-col justify-between rounded-lg border p-2 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-sky-300 hover:ring-2 hover:ring-sky-500/20",
        statusClass[simulator.status],
        selected && "border-sky-300 ring-2 ring-sky-400",
      )}
      style={{ gridColumn: `${position.col} / span ${position.colSpan ?? 1}`, gridRow: `${position.row} / span ${position.rowSpan ?? 1}` }}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-1">
          <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{mapTypeLabel(simulator)}</span>
          <span className="shrink-0 rounded-full bg-slate-950/45 px-1.5 py-0.5 text-[10px] font-bold">{statusLabels[simulator.status]}</span>
        </div>
        <div className="mt-1 truncate text-base font-black text-white">{simulator.name}</div>
      </div>
      <div className="truncate text-[11px] font-semibold text-slate-300">
        {simulator.remainingMinutes > 0 ? minutes(simulator.remainingMinutes) : simulator.currentUser ?? "Ready"}
      </div>
    </button>
  );
}

export function SimulatorMap() {
  const { simulators, selectedId, selected, setSelectedId } = useDashboardStore();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState<"start" | "addTime" | "payment" | "stop" | null>(null);

  const visible = useMemo(() => simulators.filter((item) => {
    const text = `${item.name} ${item.currentUser ?? ""} ${item.phone ?? ""} ${item.id} ${item.type} ${item.zone} ${item.orderItems.join(" ")}`.toLowerCase();
    const matchesSearch = text.includes(query.trim().toLowerCase());
    const normalizedFilter = filter.toLowerCase();
    const matchesFilter =
      filter === "All" ||
      item.type.toLowerCase().includes(normalizedFilter) ||
      (filter === "Console" && item.type.includes("Console")) ||
      (filter === "Busy" && ["busy", "ending_soon", "unpaid", "paused"].includes(item.status)) ||
      item.status === normalizedFilter ||
      (filter === "VIP" && item.type === "VIP Room") ||
      (filter === "Offline" && ["offline", "locked"].includes(item.status));
    return matchesSearch && matchesFilter;
  }), [filter, query, simulators]);

  const visibleIds = useMemo(() => new Set(visible.map((item) => item.id)), [visible]);

  function openCard(item: Simulator) {
    setSelectedId(item.id);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "secondary"} onClick={() => setFilter(item)}>{item}</Button>)}
        <div className="relative w-full sm:ml-auto sm:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-slate-500" />
          <Input className="h-9 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, customer, phone, order ID" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>Main</Badge>
          <Badge variant="success">{simulators.filter((item) => ["busy", "ending_soon", "unpaid"].includes(item.status)).length} band</Badge>
          <Badge variant="muted">{simulators.filter((item) => item.status === "free").length} bo'sh</Badge>
          <Badge variant="warning">{simulators.filter((item) => item.status === "reserved").length} bron</Badge>
          <span className="ml-auto text-xs font-semibold text-slate-500">{visible.length} / {simulators.length} shown</span>
        </div>

        <div
          className="operator-grid relative grid min-w-[1320px] gap-1.5 rounded-xl border border-slate-800/80 bg-[#080d18] p-2"
          style={{
            gridTemplateColumns: `repeat(${mapColumns}, minmax(72px, 1fr))`,
            gridTemplateRows: `repeat(${mapRows}, 76px)`,
          }}
        >
          {Array.from({ length: mapColumns * mapRows }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="rounded-lg border border-dashed border-slate-800/80 bg-slate-900/25"
              style={{ gridColumn: (index % mapColumns) + 1, gridRow: Math.floor(index / mapColumns) + 1 }}
            />
          ))}

          {facilities.map((facility) => {
            const Icon = facility.icon;
            return (
              <div
                key={facility.key}
                className="z-10 flex flex-col items-center justify-center rounded-lg border border-sky-500/50 bg-sky-500/25 text-xs font-bold text-sky-100 shadow-lg shadow-black/20"
                style={{ gridColumn: facility.position.col, gridRow: facility.position.row }}
              >
                <Icon className="mb-1 text-lg" />
                {facility.label}
              </div>
            );
          })}

          {simulators.map((item) => (
            visibleIds.has(item.id) ? <Tile key={item.id} simulator={item} selected={selectedId === item.id} onClick={() => openCard(item)} /> : null
          ))}
        </div>
      </div>
      <SimulatorDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} simulator={selected} onAction={(action) => setSheetAction(action)} />
      <StartSessionDialog open={sheetAction === "start"} onOpenChange={(open) => setSheetAction(open ? "start" : null)} simulator={selected} />
      <AddTimeDialog open={sheetAction === "addTime"} onOpenChange={(open) => setSheetAction(open ? "addTime" : null)} simulator={selected} />
      <PaymentDialog open={sheetAction === "payment"} onOpenChange={(open) => setSheetAction(open ? "payment" : null)} simulator={selected} />
      <StopSessionDialog open={sheetAction === "stop"} onOpenChange={(open) => setSheetAction(open ? "stop" : null)} simulator={selected} onTakePayment={() => setSheetAction("payment")} />
    </div>
  );
}
