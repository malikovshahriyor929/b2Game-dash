"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { FiClock, FiLock, FiLogOut, FiMenu, FiMoon, FiPlay, FiPlusCircle, FiRefreshCw, FiSearch, FiSquare, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { canUseAction } from "@/lib/permissions";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export function Topbar({ onAction, onOpenSidebar }: { onAction: (action: "start" | "addTime" | "payment" | "stop") => void; onOpenSidebar: () => void }) {
  const { data } = useSession();
  const {
    branches,
    period,
    revenue,
    selected,
    selectedBranchId,
    setPeriod,
    setSelectedBranchId,
    simulators,
    toggleLock,
    shifts,
    activeShift,
    openShift,
    closeShift,
    barSales,
  } = useDashboardStore();

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("");
  const [shiftType, setShiftType] = useState<"Kunduzgi (09:00 - 18:00)" | "Tungi (18:01 - 09:00)">("Kunduzgi (09:00 - 18:00)");
  const [actualCash, setActualCash] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  const role = data?.user?.role;
  const branchOptions = role === "super_admin" ? branches : branches.filter((branch) => data?.user?.branchIds?.includes(branch.id));
  const active = simulators.filter((item) => ["busy", "unpaid"].includes(item.status)).length;
  const ready = simulators.filter((item) => item.status === "ready_to_play").length;
  const reserved = simulators.filter((item) => item.status === "reserved").length;
  const selectedBranchName = selectedBranchId === "all" ? "All branches" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Branch";

  const shiftBarCash = activeShift
    ? barSales
        .filter((s) => s.shiftId === activeShift.id && s.paymentMethod === "Naqd")
        .reduce((sum, s) => sum + s.totalAmount, 0)
    : 0;

  const expectedCashVal = activeShift
    ? activeShift.startingCash + activeShift.totalIncome - activeShift.totalExpense + shiftBarCash
    : 0;

  const quickActions = [
    { key: "refresh", label: "Refresh", icon: FiRefreshCw, enabled: true, click: () => location.reload() },
    { key: "start", label: "Start", icon: FiPlay, enabled: Boolean(selected && ["ready_to_play", "reserved"].includes(selected.status) && canUseAction(role, "start")), click: () => onAction("start") },
    { key: "addTime", label: "Add time", icon: FiPlusCircle, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "addTime")), click: () => onAction("addTime") },
    { key: "payment", label: "Payment", icon: FiClock, enabled: Boolean(selected && selected.status !== "ready_to_play" && canUseAction(role, "payment")), click: () => onAction("payment") },
    { key: "stop", label: "Stop", icon: FiSquare, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "stop")), click: () => onAction("stop") },
    { key: "lock", label: "Lock", icon: FiLock, enabled: Boolean(selected && canUseAction(role, "lock")), click: () => selected && toggleLock(selected.id) },
  ];

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-800 bg-[#151c31]/95 px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button className="shrink-0 md:hidden" size="icon" variant="secondary" onClick={onOpenSidebar} aria-label="Open sidebar"><FiMenu /></Button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">B2 Game Club</div>
          <div className="truncate text-xs text-slate-400">{selectedBranchName}</div>
        </div>
        {activeShift ? (
          <button
            onClick={() => setShiftModalOpen(true)}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Smena ochiq ({activeShift.operator})
          </button>
        ) : (
          <button
            onClick={() => setShiftModalOpen(true)}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Smena yopiq
          </button>
        )}
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5">
          <TooltipProvider>
            <div className="flex gap-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Tooltip key={action.key}>
                    <TooltipTrigger asChild>
                      <Button className="h-9 w-9 shrink-0" size="icon" variant={action.key === "stop" ? "destructive" : "secondary"} disabled={!action.enabled} onClick={action.click}><Icon /></Button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
          <Button className="h-9 w-9 shrink-0" size="icon" variant="ghost"><FiMoon /><span className="sr-only"><FiSun /></span></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 rounded-full outline-none ring-sky-400 focus:ring-2">
                <Avatar><AvatarFallback>{data?.user?.name?.slice(0, 2).toUpperCase() ?? "U"}</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{data?.user?.name} - {data?.user?.role}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}><FiLogOut /> Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-2 grid min-w-0 gap-2 lg:grid-cols-[360px_minmax(220px,1fr)_auto] xl:grid-cols-[420px_minmax(260px,1fr)_auto]">
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={role !== "super_admin"}>
            <SelectTrigger className="h-9 min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              {role === "super_admin" ? <SelectItem value="all">All branches</SelectItem> : null}
              {branchOptions.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="h-9 min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input className="h-9 pl-9" placeholder="Search simulator, customer, order..." />
        </div>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 thin-scrollbar lg:justify-end lg:pb-0">
          <Badge className="shrink-0 whitespace-nowrap">{money(revenue)}</Badge>
          <Badge variant="success" className="shrink-0 whitespace-nowrap">{active} active</Badge>
          <Badge variant="muted" className="shrink-0 whitespace-nowrap">{ready} ready</Badge>
          <Badge variant="warning" className="shrink-0 whitespace-nowrap">{reserved} bron</Badge>
        </div>
      </div>

      <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {activeShift ? "Smenani Yopish" : "Yangi Smena Ochish"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {activeShift
                ? "Smenani yakunlash uchun naqd pul qoldig'ini kiriting."
                : "Ishni boshlash uchun smena ma'lumotlarini kiriting."}
            </DialogDescription>
          </DialogHeader>

          {activeShift ? (
            <div className="space-y-4 pt-3">
              <div className="rounded-lg bg-slate-950 p-3.5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Admin:</span><span className="font-semibold text-white">{activeShift.operator}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Smena turi:</span><span className="font-semibold text-white">{activeShift.shiftType}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ochilgan vaqt:</span><span className="font-semibold text-white">{activeShift.date} {activeShift.openTime}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Boshlang'ich naqd:</span><span className="font-semibold text-sky-300">{money(activeShift.startingCash)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Kirimlar (Prixod):</span><span className="font-semibold text-emerald-300">+{money(activeShift.totalIncome)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Chiqimlar (Rasxod):</span><span className="font-semibold text-rose-300">-{money(activeShift.totalExpense)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Bar savdosi (Naqd):</span><span className="font-semibold text-emerald-300">+{money(shiftBarCash)}</span></div>
                <div className="border-t border-slate-800 my-2 pt-2 flex justify-between font-bold text-white text-base">
                  <span>Kutilayotgan naqd:</span>
                  <span className="text-sky-300">{money(expectedCashVal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCash" className="text-sm font-semibold text-slate-300">Kassadagi haqiqiy naqd pul summasi</Label>
                <Input
                  id="actualCash"
                  placeholder="Masalan: 350 000"
                  type="text"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ""))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeNotes" className="text-sm font-semibold text-slate-300">Smena bo'yicha izoh (ixtiyoriy)</Label>
                <Input
                  id="closeNotes"
                  placeholder="Izoh yozing..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShiftModalOpen(false)}>Bekor qilish</Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  disabled={!actualCash}
                  onClick={() => {
                    closeShift(Number(actualCash), closeNotes);
                    setActualCash("");
                    setCloseNotes("");
                    setShiftModalOpen(false);
                  }}
                >
                  Smenani yopish
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-300">Operator (Admin)</Label>
                <Input
                  value={data?.user?.name ?? "Admin"}
                  disabled
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-300">Smena turi</Label>
                <Select
                  value={shiftType}
                  onValueChange={(val) => setShiftType(val as any)}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="Kunduzgi (09:00 - 18:00)">Kunduzgi (09:00 - 18:00)</SelectItem>
                    <SelectItem value="Tungi (18:01 - 09:00)">Tungi (18:01 - 09:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingCash" className="text-sm font-semibold text-slate-300">Kassa boshlang'ich naqd summasi</Label>
                <Input
                  id="startingCash"
                  placeholder="Masalan: 150 000"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value.replace(/\D/g, ""))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShiftModalOpen(false)}>Bekor qilish</Button>
                <Button
                  className="flex-1"
                  disabled={!startingCash}
                  onClick={() => {
                    openShift(data?.user?.name ?? "Admin", shiftType, Number(startingCash));
                    setStartingCash("");
                    setShiftModalOpen(false);
                  }}
                >
                  Smenani ochish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
