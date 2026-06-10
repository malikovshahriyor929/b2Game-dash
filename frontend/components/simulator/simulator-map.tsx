"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCoffee, FiCreditCard, FiSearch, FiUsers } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SimulatorDetailSheet } from "@/components/simulator/simulator-detail-sheet";
import { AddTimeDialog } from "@/components/simulator/add-time-dialog";
import { PaymentDialog } from "@/components/simulator/payment-dialog";
import { StartSessionDialog } from "@/components/simulator/start-session-dialog";
import { StopSessionDialog } from "@/components/simulator/stop-session-dialog";
import { SimulatorCard } from "@/components/simulator/simulator-card";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { backendGet, backendPatch } from "@/server/api";
import { seconds } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Simulator, SimulatorMapPosition, SimulatorStatus } from "@/types/simulator";

const filters = ["All", "Standard", "VIP", "Ready", "Busy", "Reserved", "Unpaid", "Broken", "Repair", "Offline", "Locked"];
const mapColumns = 24;
const mapRows = 5;

type MapPosition = SimulatorMapPosition;
type FacilityKey = "cashier" | "wc" | "shop";
type LayoutSelection = { type: "simulator"; id: string } | { type: "facility"; key: FacilityKey };
type SimulatorMapLayout = { facilities?: Partial<Record<FacilityKey, MapPosition>> };

const facilities: Array<{ key: FacilityKey; label: string; icon: typeof FiCreditCard; position: MapPosition }> = [
  { key: "cashier", label: "Kassa", icon: FiCreditCard, position: { floor: "1", col: 21, row: 5, colSpan: 1, rowSpan: 1 } },
  { key: "wc", label: "WC", icon: FiUsers, position: { floor: "1", col: 22, row: 5, colSpan: 1, rowSpan: 1 } },
  { key: "shop", label: "Shop", icon: FiCoffee, position: { floor: "1", col: 23, row: 5, colSpan: 1, rowSpan: 1 } },
];

const statusClass: Record<SimulatorStatus, string> = {
  ready_to_play: "border-sky-400/70 bg-slate-900 text-slate-100 shadow-sky-950/40",
  busy: "border-emerald-400/70 bg-emerald-950/40 text-emerald-50 shadow-emerald-950/30",
  reserved: "border-amber-400/75 bg-amber-950/35 text-amber-50 shadow-amber-950/30",
  unpaid: "border-red-400/75 bg-red-950/40 text-red-50 shadow-red-950/30",
  broken: "border-red-500 bg-red-950/55 text-red-50 shadow-red-950/30",
  repair_requested: "border-amber-400/75 bg-amber-950/35 text-amber-50 shadow-amber-950/30",
  repair_approved: "border-fuchsia-400/70 bg-fuchsia-950/40 text-fuchsia-50 shadow-fuchsia-950/30",
  fixing: "border-sky-400/70 bg-sky-950/40 text-sky-50 shadow-sky-950/30",
  fixed_waiting_confirmation: "border-lime-400/75 bg-lime-950/35 text-lime-50 shadow-lime-950/30",
  offline: "border-slate-700 bg-slate-950 text-slate-400 shadow-black/20",
  locked: "border-slate-600 bg-slate-950/90 text-slate-400 shadow-black/20",
};

const statusDotClass: Record<SimulatorStatus, string> = {
  ready_to_play: "bg-sky-300",
  busy: "bg-emerald-300",
  reserved: "bg-amber-300",
  unpaid: "bg-red-300",
  broken: "bg-red-400",
  repair_requested: "bg-amber-300",
  repair_approved: "bg-fuchsia-300",
  fixing: "bg-sky-300",
  fixed_waiting_confirmation: "bg-lime-300",
  offline: "bg-slate-500",
  locked: "bg-slate-400",
};

const statusLabels: Record<SimulatorStatus, string> = {
  ready_to_play: "Ready",
  busy: "Band",
  reserved: "Bron",
  unpaid: "Qarz",
  broken: "Broken",
  repair_requested: "Req",
  repair_approved: "Approved",
  fixing: "Fixing",
  fixed_waiting_confirmation: "Confirm",
  offline: "Offline",
  locked: "Qulf",
};

function mapTypeLabel(simulator: Simulator) {
  return simulator.zone === "Standard" ? "LOGITECH" : "MOZA VIP";
}

function defaultMapPosition(simulator: Simulator): MapPosition {
  const number = Number(simulator.name.match(/\d+/)?.[0] ?? 1);
  const vipPositions: MapPosition[] = [
    { floor: "2", col: 2, row: 1, colSpan: 2 },
    { floor: "2", col: 5, row: 1, colSpan: 2 },
    { floor: "2", col: 2, row: 5, colSpan: 2 },
    { floor: "2", col: 5, row: 5, colSpan: 2 },
  ];
  const standardPositions: MapPosition[] = [
    { floor: "1", col: 9, row: 1, colSpan: 2 },
    { floor: "1", col: 11, row: 1, colSpan: 2 },
    { floor: "1", col: 13, row: 1, colSpan: 2 },
    { floor: "1", col: 15, row: 1, colSpan: 2 },
    { floor: "1", col: 17, row: 1, colSpan: 2 },
    { floor: "1", col: 19, row: 1, colSpan: 2 },
    { floor: "1", col: 21, row: 1, colSpan: 2 },
    { floor: "1", col: 23, row: 1, colSpan: 2 },
    { floor: "1", col: 9, row: 5, colSpan: 2 },
    { floor: "1", col: 11, row: 5, colSpan: 2 },
    { floor: "1", col: 13, row: 5, colSpan: 2 },
    { floor: "1", col: 15, row: 5, colSpan: 2 },
    { floor: "1", col: 17, row: 5, colSpan: 2 },
    { floor: "1", col: 19, row: 5, colSpan: 2 },
    { floor: "1", col: 21, row: 5, colSpan: 2 },
    { floor: "1", col: 23, row: 5, colSpan: 2 },
  ];
  const fallbackPosition = simulator.zone === "Standard"
    ? { floor: "1", col: 9 + (((number - 1) % 8) * 2), row: number <= 8 ? 1 : 5, colSpan: 2 }
    : { floor: "2", col: 2 + (((number - 1) % 2) * 3), row: number <= 2 ? 1 : 5, colSpan: 2 };
  return simulator.zone === "Standard"
    ? standardPositions[number - 1] ?? fallbackPosition
    : vipPositions[number - 1] ?? fallbackPosition;
}

function positionKey(position: MapPosition) {
  return `${position.floor ?? ""}:${position.col}:${position.row}:${position.colSpan ?? 1}:${position.rowSpan ?? 1}`;
}

function nextFreePosition(position: MapPosition, used: Set<string>) {
  const colSpan = position.colSpan ?? 2;
  const rowSpan = position.rowSpan ?? 1;
  const floor = position.floor === "2" ? "2" : "1";
  const startCol = floor === "2" ? 1 : 8;
  const endCol = floor === "2" ? 7 : mapColumns;
  for (let row = 1; row <= mapRows - rowSpan + 1; row += 1) {
    for (let col = startCol; col <= endCol - colSpan + 1; col += 1) {
      const next = { ...position, floor, col, row, colSpan, rowSpan };
      const key = positionKey(next);
      if (!used.has(key)) return next;
    }
  }
  return position;
}

function defaultLayoutPositions(simulators: Simulator[]) {
  const used = new Set<string>();
  return Object.fromEntries(simulators.map((item) => {
    let position = defaultMapPosition(item);
    if (used.has(positionKey(position))) position = nextFreePosition(position, used);
    used.add(positionKey(position));
    return [item.id, position];
  }));
}

function defaultFacilityPositions() {
  return Object.fromEntries(facilities.map((facility) => [facility.key, facility.position])) as Record<FacilityKey, MapPosition>;
}

function normalizedMapPosition(value: unknown, fallback: MapPosition): MapPosition {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const item = value as Record<string, unknown>;
  const col = Number(item.col);
  const row = Number(item.row);
  const colSpan = Number(item.colSpan ?? fallback.colSpan ?? 1);
  const rowSpan = Number(item.rowSpan ?? fallback.rowSpan ?? 1);
  if (![col, row, colSpan, rowSpan].every(Number.isFinite) || col < 1 || row < 1 || colSpan < 1 || rowSpan < 1) return fallback;
  return {
    floor: item.floor == null ? fallback.floor : String(item.floor),
    col,
    row,
    colSpan,
    rowSpan,
  };
}

function Tile({ simulator, position, selected, editing, onClick }: { simulator: Simulator; position: MapPosition; selected: boolean; editing: boolean; onClick: () => void }) {
  const detail = simulator.remainingSeconds && simulator.remainingSeconds > 0
    ? seconds(simulator.remainingSeconds)
    : simulator.currentUser ?? (simulator.status === "ready_to_play" ? "Ready" : simulator.deviceId);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative z-20 flex h-full min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-3 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-sky-300 hover:ring-2 hover:ring-sky-500/20",
        statusClass[simulator.status],
        selected && "border-sky-300 ring-2 ring-sky-400",
        editing && selected && "ring-4 ring-sky-400/40",
      )}
      style={{ gridColumn: `${position.col} / span ${position.colSpan ?? 1}`, gridRow: `${position.row} / span ${position.rowSpan ?? 1}` }}
    >
      <div className="min-w-0">
        <div className="truncate text-[10px] font-bold uppercase text-slate-500">{mapTypeLabel(simulator)}</div>
        <div className="mt-2 truncate text-[15px] font-black leading-5 text-slate-100">{simulator.name}</div>
      </div>
      <div className="mt-2 min-w-0 border-t border-white/10 pt-2">
        <div className="space-y-1">
          <span className="flex min-w-0 items-center gap-1 text-xs font-black text-slate-100">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass[simulator.status])} />
            <span className="truncate">{statusLabels[simulator.status]}</span>
          </span>
          <span className="block truncate text-[11px] font-semibold text-slate-400">{detail}</span>
        </div>
      </div>
    </button>
  );
}

export function SimulatorMap() {
  const { branches, selectedBranchId, simulators, selectedId, selected, setSelectedId } = useDashboardStore();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [editingLayout, setEditingLayout] = useState(false);
  const [layoutSelection, setLayoutSelection] = useState<LayoutSelection | null>(null);
  const [layoutDraft, setLayoutDraft] = useState<Record<string, MapPosition>>({});
  const [savedLayout, setSavedLayout] = useState<Record<string, MapPosition>>({});
  const [facilityPositions, setFacilityPositions] = useState<Record<FacilityKey, MapPosition>>(() => defaultFacilityPositions());
  const [facilityDraft, setFacilityDraft] = useState<Partial<Record<FacilityKey, MapPosition>>>({});
  const [savingLayout, setSavingLayout] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAction, setSheetAction] = useState<"start" | "addTime" | "payment" | "stop" | null>(null);

  const visible = useMemo(() => simulators.filter((item) => {
    const text = `${item.name} ${item.currentUser ?? ""} ${item.phone ?? ""} ${item.id} ${item.type} ${item.zone} ${item.orderItems.join(" ")}`.toLowerCase();
    const matchesSearch = text.includes(query.trim().toLowerCase());
    const normalizedFilter = filter.toLowerCase();
    const matchesFilter =
      filter === "All" ||
      item.zone.toLowerCase().includes(normalizedFilter) ||
      (filter === "Ready" && item.status === "ready_to_play") ||
      (filter === "Busy" && ["busy", "unpaid"].includes(item.status)) ||
      (filter === "Repair" && ["repair_requested", "repair_approved", "fixing", "fixed_waiting_confirmation"].includes(item.status)) ||
      item.status === normalizedFilter ||
      (filter === "VIP" && item.zone === "VIP") ||
      (filter === "Offline" && ["offline", "locked"].includes(item.status));
    return matchesSearch && matchesFilter;
  }), [filter, query, simulators]);

  const visibleIds = useMemo(() => new Set(visible.map((item) => item.id)), [visible]);
  const selectedLayoutSimulator = useMemo(() => {
    if (layoutSelection?.type !== "simulator") return null;
    return simulators.find((item) => item.id === layoutSelection.id) ?? null;
  }, [layoutSelection, simulators]);
  const resolvedPositions = useMemo(() => {
    const used = new Set<string>();
    return Object.fromEntries(simulators.map((item) => {
      const stored = layoutDraft[item.id] ?? savedLayout[item.id] ?? item.mapPosition;
      const raw = stored ?? defaultMapPosition(item);
      const floor = raw.floor === "0" ? "1" : raw.floor === "1" && raw.col <= 7 ? "2" : raw.floor;
      let position: MapPosition = { ...raw, floor };
      if (!stored && used.has(positionKey(position))) position = nextFreePosition(position, used);
      used.add(positionKey(position));
      return [item.id, position];
    }));
  }, [layoutDraft, savedLayout, simulators]);

  const resolvedFacilityPositions = useMemo(() => {
    const defaults = defaultFacilityPositions();
    return Object.fromEntries(facilities.map((facility) => [
      facility.key,
      normalizedMapPosition(facilityDraft[facility.key] ?? facilityPositions[facility.key], defaults[facility.key]),
    ])) as Record<FacilityKey, MapPosition>;
  }, [facilityDraft, facilityPositions]);

  const selectedLayoutLabel = useMemo(() => {
    if (layoutSelection?.type === "facility") return facilities.find((facility) => facility.key === layoutSelection.key)?.label ?? "None";
    if (layoutSelection?.type === "simulator") return selectedLayoutSimulator?.name ?? "None";
    return "None";
  }, [layoutSelection, selectedLayoutSimulator]);

  useEffect(() => {
    if (selectedBranchId === "all") return;
    let cancelled = false;
    void backendGet<SimulatorMapLayout>(`/settings/map-layout?branch_id=${encodeURIComponent(selectedBranchId)}`)
      .then((layout) => {
        if (cancelled) return;
        const defaults = defaultFacilityPositions();
        setFacilityPositions({
          cashier: normalizedMapPosition(layout.facilities?.cashier, defaults.cashier),
          wc: normalizedMapPosition(layout.facilities?.wc, defaults.wc),
          shop: normalizedMapPosition(layout.facilities?.shop, defaults.shop),
        });
        setFacilityDraft({});
      })
      .catch(() => {
        if (!cancelled) setFacilityPositions(defaultFacilityPositions());
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  function positionFor(item: Simulator) {
    return resolvedPositions[item.id] ?? defaultMapPosition(item);
  }

  function facilityPositionFor(key: FacilityKey) {
    return resolvedFacilityPositions[key] ?? defaultFacilityPositions()[key];
  }

  function openCard(item: Simulator) {
    if (editingLayout) {
      setSelectedId(item.id);
      setLayoutSelection({ type: "simulator", id: item.id });
      return;
    }
    setSelectedId(item.id);
    setSheetOpen(true);
  }

  function moveSelectedTo(col: number, row: number) {
    if (!editingLayout || !layoutSelection) return;
    const current = layoutSelection.type === "simulator"
      ? selectedLayoutSimulator ? positionFor(selectedLayoutSimulator) : null
      : facilityPositionFor(layoutSelection.key);
    if (!current) return;
    const colSpan = current.colSpan ?? 2;
    const rowSpan = current.rowSpan ?? 1;
    const safeCol = Math.min(Math.max(1, col), mapColumns - colSpan + 1);
    const floor = safeCol <= 7 ? "2" : "1";
    const next = { ...current, floor, col: safeCol, row, colSpan, rowSpan };
    if (layoutSelection.type === "simulator") {
      setSelectedId(layoutSelection.id);
      setLayoutDraft((items) => ({
        ...items,
        [layoutSelection.id]: next,
      }));
      return;
    }
    setFacilityDraft((items) => ({
      ...items,
      [layoutSelection.key]: next,
    }));
  }

  async function saveLayout() {
    if (selectedBranchId === "all") return;
    setSavingLayout(true);
    try {
      const nextSimulatorLayout = Object.fromEntries(simulators.map((item) => [item.id, positionFor(item)]));
      const nextFacilityLayout = Object.fromEntries(facilities.map((facility) => [facility.key, facilityPositionFor(facility.key)])) as Record<FacilityKey, MapPosition>;
      setSavedLayout((items) => ({ ...items, ...nextSimulatorLayout }));
      setFacilityPositions(nextFacilityLayout);
      await Promise.all([
        ...simulators.map((item) => backendPatch(`/simulators/${item.id}/map-position`, { map_position: nextSimulatorLayout[item.id] })),
        backendPatch(`/settings/map-layout?branch_id=${encodeURIComponent(selectedBranchId)}`, { layout: { facilities: nextFacilityLayout } }),
      ]);
      setLayoutDraft({});
      setFacilityDraft({});
      setEditingLayout(false);
    } finally {
      setSavingLayout(false);
    }
  }

  function resetDefaultLayout() {
    setEditingLayout(true);
    setLayoutDraft(defaultLayoutPositions(simulators));
    setFacilityDraft(defaultFacilityPositions());
    const nextId = selectedId ?? visible[0]?.id ?? null;
    setSelectedId(nextId);
    setLayoutSelection(nextId ? { type: "simulator", id: nextId } : { type: "facility", key: "cashier" });
  }

  const dialogs = (
    <>
      <SimulatorDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} simulator={selected} onAction={(action) => setSheetAction(action)} />
      <StartSessionDialog open={sheetAction === "start"} onOpenChange={(open) => setSheetAction(open ? "start" : null)} simulator={selected} />
      <AddTimeDialog open={sheetAction === "addTime"} onOpenChange={(open) => setSheetAction(open ? "addTime" : null)} simulator={selected} />
      <PaymentDialog open={sheetAction === "payment"} onOpenChange={(open) => setSheetAction(open ? "payment" : null)} simulator={selected} />
      <StopSessionDialog open={sheetAction === "stop"} onOpenChange={(open) => setSheetAction(open ? "stop" : null)} simulator={selected} onTakePayment={() => setSheetAction("payment")} />
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "secondary"} onClick={() => setFilter(item)}>{item}</Button>)}
        <div className="relative w-full sm:ml-auto sm:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-slate-500" />
          <Input className="h-9 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, customer, phone, order ID" />
        </div>
      </div>
      {selectedBranchId === "all" ? (
        <div className="space-y-5">
          {branches.map((branch) => {
            const branchSimulators = visible.filter((item) => item.branchId === branch.id);
            if (!branchSimulators.length) return null;
            return (
              <section key={branch.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>{branch.name}</Badge>
                  <Badge variant="muted">{branchSimulators.filter((item) => item.status === "ready_to_play").length} ready</Badge>
                  <Badge variant="success">{branchSimulators.filter((item) => ["busy", "unpaid"].includes(item.status)).length} active</Badge>
                  <Badge variant="warning">{branchSimulators.filter((item) => item.status.startsWith("repair") || item.status === "fixing" || item.status === "fixed_waiting_confirmation").length} repair</Badge>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
                  {branchSimulators.map((item) => <SimulatorCard key={item.id} simulator={item} selected={selectedId === item.id} onClick={() => openCard(item)} compact />)}
                </div>
              </section>
            );
          })}
          {dialogs}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge>Logitech Standard</Badge>
              <Badge variant="vip">Moza VIP</Badge>
              <Badge variant="success">{simulators.filter((item) => ["busy", "unpaid"].includes(item.status)).length} band</Badge>
              <Badge variant="muted">{simulators.filter((item) => item.status === "ready_to_play").length} ready</Badge>
              <Badge variant="warning">{simulators.filter((item) => item.status === "reserved").length} bron</Badge>
              <span className="ml-auto text-xs font-semibold text-slate-500">{visible.length} / {simulators.length} shown</span>
              <Button className="ml-2" size="sm" variant={editingLayout ? "default" : "secondary"} disabled={!simulators.length} onClick={() => {
                setEditingLayout((value) => {
                  const next = !value;
                  const nextId = selectedId ?? visible[0]?.id ?? null;
                  if (next && !layoutSelection) setLayoutSelection(nextId ? { type: "simulator", id: nextId } : { type: "facility", key: "cashier" });
                  return next;
                });
                const nextId = selectedId ?? visible[0]?.id ?? null;
                setSelectedId(nextId);
              }}>
                {editingLayout ? "Editing layout" : "Edit layout"}
              </Button>
              <Button size="sm" variant="secondary" disabled={!simulators.length || savingLayout} onClick={resetDefaultLayout}>
                Reset default
              </Button>
              <Button className="ml-2" size="sm" variant="outline" disabled={savingLayout || !simulators.length} onClick={() => void saveLayout()}>
                {savingLayout ? "Saving..." : "Save layout"}
              </Button>
            </div>
            {editingLayout ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/65 px-3 py-2">
                <Badge variant="muted">Selected</Badge>
                <span className="text-sm font-bold text-slate-100">{selectedLayoutLabel}</span>
                <span className="text-xs font-semibold text-slate-500">click any map cell to move</span>
              </div>
            ) : null}

            <div
              className="operator-grid relative grid min-w-[1580px] gap-2 rounded-xl border border-slate-800/80 bg-[#080d18] p-3 shadow-inner shadow-black/30"
              style={{
                gridTemplateColumns: `repeat(${mapColumns}, minmax(58px, 1fr))`,
                gridTemplateRows: `repeat(${mapRows}, 112px)`,
                backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.16) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            >
              <div
                className="pointer-events-none z-0 flex items-center justify-center rounded-[30px] border border-slate-700/80 bg-slate-900/80 text-sm font-black uppercase text-slate-500 shadow-xl shadow-black/20"
                style={{ gridColumn: "1 / span 7", gridRow: "1 / span 5" }}
              >
                2 floor
              </div>
              <div
                className="pointer-events-none z-0 flex items-center justify-center rounded-[30px] border border-slate-700/80 bg-slate-900/80 text-sm font-black uppercase text-slate-500 shadow-xl shadow-black/20"
                style={{ gridColumn: "8 / span 17", gridRow: "1 / span 5" }}
              >
                1 floor
              </div>
              <div
                className="pointer-events-none z-20 overflow-hidden rounded-2xl border border-slate-600/70 bg-slate-900/70 shadow-2xl shadow-black/30 ring-1 ring-white/5"
                style={{ gridColumn: "22 / span 3", gridRow: "3 / span 2" }}
                aria-label="Entrance"
              >
                <div className="relative flex h-full min-h-0 w-full items-stretch justify-center gap-3 px-5 py-4">
                  <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-sky-300/45 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 h-px bg-gradient-to-r from-transparent via-slate-400/35 to-transparent" />
                  {[0, 1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className="h-full flex-1 rounded-full border border-slate-500/50 bg-gradient-to-b from-slate-500 via-slate-700 to-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_rgba(0,0,0,0.35)]"
                    />
                  ))}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-600/70 bg-slate-950/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-100 shadow-xl shadow-black/40">
                    Entrance
                  </span>
                </div>
              </div>

              {Array.from({ length: mapColumns * mapRows }).map((_, index) => (
                <button
                  type="button"
                  key={`empty-${index}`}
                  aria-label={`Move selected simulator to column ${(index % mapColumns) + 1}, row ${Math.floor(index / mapColumns) + 1}`}
                  disabled={!editingLayout}
                  onClick={() => moveSelectedTo((index % mapColumns) + 1, Math.floor(index / mapColumns) + 1)}
                  className={cn(
                    "z-10 rounded-xl border border-dashed border-slate-800/70 bg-slate-950/10 transition",
                    editingLayout && "cursor-crosshair hover:border-sky-400/60 hover:bg-sky-500/10",
                  )}
                  style={{ gridColumn: (index % mapColumns) + 1, gridRow: Math.floor(index / mapColumns) + 1 }}
                />
              ))}

              {facilities.map((facility) => {
                const Icon = facility.icon;
                return (
                  <button
                    type="button"
                    key={facility.key}
                    disabled={!editingLayout}
                    onClick={() => setLayoutSelection({ type: "facility", key: facility.key })}
                    className={cn(
                      "z-20 flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/85 text-xs font-bold text-slate-200 shadow-lg shadow-black/20 transition",
                      editingLayout && "cursor-pointer hover:border-sky-400 hover:ring-2 hover:ring-sky-500/20",
                      layoutSelection?.type === "facility" && layoutSelection.key === facility.key && "border-sky-300 ring-4 ring-sky-400/40",
                    )}
                    style={{
                      gridColumn: `${facilityPositionFor(facility.key).col} / span ${facilityPositionFor(facility.key).colSpan ?? 1}`,
                      gridRow: `${facilityPositionFor(facility.key).row} / span ${facilityPositionFor(facility.key).rowSpan ?? 1}`,
                    }}
                  >
                    <Icon className="mb-1 text-lg" />
                    {facility.label}
                  </button>
                );
              })}

              {simulators.map((item) => (
                visibleIds.has(item.id) ? <Tile key={item.id} simulator={item} position={positionFor(item)} selected={selectedId === item.id || (layoutSelection?.type === "simulator" && layoutSelection.id === item.id)} editing={editingLayout} onClick={() => openCard(item)} /> : null
              ))}
            </div>
          </div>
          {dialogs}
        </>
      )}
    </div>
  );
}
