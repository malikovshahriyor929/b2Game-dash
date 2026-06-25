"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { FiClock, FiKey, FiLock, FiLogOut, FiMenu, FiMoon, FiPlay, FiPlus, FiPlusCircle, FiRefreshCw, FiSearch, FiSquare, FiSun } from "react-icons/fi";
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
import { CreateBranchDialog } from "@/components/layout/create-branch-dialog";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";
import { WithdrawalCenter } from "@/components/shift/withdrawal-center";

// Smena turlari: Kunduzgi 10:00–19:00, Tungi 19:00–03:00. Tanlov yorliqlari (admin o'zgartira oladi).
const SHIFT_DAY = "Kunduzgi (10:00 - 19:00)";
const SHIFT_NIGHT = "Tungi (19:00 - 03:00)";
type ShiftTypeOption = typeof SHIFT_DAY | typeof SHIFT_NIGHT;

// Joriy vaqt bo'yicha smena turini taklif qiladi: 10:00–19:00 oralig'i kunduzgi, qolgani tungi.
function currentShiftType(): ShiftTypeOption {
  const hour = new Date().getHours();
  return hour >= 10 && hour < 19 ? SHIFT_DAY : SHIFT_NIGHT;
}

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
  } = useDashboardStore();

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [branchSelectOpen, setBranchSelectOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("");
  const [shiftType, setShiftType] = useState<ShiftTypeOption>(SHIFT_DAY);
  const [actualCash, setActualCash] = useState("");
  const [cashWithdrawn, setCashWithdrawn] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  const role = data?.user?.role;
  const branchOptions = role === "super_admin" ? branches : branches.filter((branch) => data?.user?.branchIds?.includes(branch.id));
  const active = simulators.filter((item) => ["busy", "unpaid"].includes(item.status)).length;
  const ready = simulators.filter((item) => item.status === "ready_to_play").length;
  const reserved = simulators.filter((item) => item.status === "reserved").length;
  const selectedBranchName = selectedBranchId === "all" ? "Barcha filiallar" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Filial";

  // Smena pul ko'rsatkichlari (backend payments'dan jonli hisoblangan)
  const cashSales = activeShift?.cashSales ?? 0;
  const cardTotal = activeShift?.cardRevenue ?? 0;
  const bankTotal = activeShift?.qrRevenue ?? 0;
  const balanceSales = activeShift?.balanceSales ?? 0;
  const totalRevenue = activeShift?.totalRevenue ?? cashSales + cardTotal + bankTotal;
  const startingCashVal = activeShift?.startingCash ?? 0;
  const expectedCashVal = activeShift?.expectedCash ?? startingCashVal + cashSales; // kassada bo'lishi kerak bo'lgan naqd
  const cashWithdrawnNum = Number(cashWithdrawn || 0);
  const remainingAfterWithdraw = expectedCashVal - cashWithdrawnNum; // keyingi smenaga qoladigan naqd
  const actualCashNum = actualCash === "" ? null : Number(actualCash);
  const cashDifference = actualCashNum === null ? 0 : actualCashNum - expectedCashVal;
  // Oldingi smena qoldirgan naqd (yangi smena boshlanishi uchun)
  const previousRemaining = shifts.find((s) => s.status === "closed")?.remainingCash ?? 0;

  // Yangi smena ochilayotganda boshlang'ich naqdni oldingi qoldiq bilan to'ldiramiz
  useEffect(() => {
    if (shiftModalOpen && !activeShift) {
      setStartingCash(previousRemaining ? String(previousRemaining) : "");
      setShiftType(currentShiftType()); // joriy vaqt bo'yicha avto-tanlov
    }
  }, [shiftModalOpen, activeShift, previousRemaining]);

  const quickActions = [
    { key: "refresh", label: "Yangilash", icon: FiRefreshCw, enabled: true, click: () => location.reload() },
    { key: "start", label: "Boshlash", icon: FiPlay, enabled: Boolean(selected && ["ready_to_play", "reserved"].includes(selected.status) && canUseAction(role, "start")), click: () => onAction("start") },
    { key: "addTime", label: "Vaqt qo'shish", icon: FiPlusCircle, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "addTime")), click: () => onAction("addTime") },
    { key: "payment", label: "To'lov", icon: FiClock, enabled: Boolean(selected && selected.status !== "ready_to_play" && canUseAction(role, "payment")), click: () => onAction("payment") },
    { key: "stop", label: "To'xtatish", icon: FiSquare, enabled: Boolean(selected && ["busy", "unpaid"].includes(selected.status) && canUseAction(role, "stop")), click: () => onAction("stop") },
    { key: "lock", label: "Qulflash", icon: FiLock, enabled: Boolean(selected && canUseAction(role, "lock")), click: () => selected && toggleLock(selected.id) },
  ];

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-800 bg-[#151c31]/95 px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button className="shrink-0 md:hidden" size="icon" variant="secondary" onClick={onOpenSidebar} aria-label="Menyuni ochish"><FiMenu /></Button>
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
          <WithdrawalCenter />
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
              <DropdownMenuItem onSelect={() => setTimeout(() => setPasswordDialogOpen(true), 0)}><FiKey /> Parolni o&apos;zgartirish</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}><FiLogOut /> Chiqish</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-2 grid min-w-0 gap-2 lg:grid-cols-[360px_minmax(220px,1fr)_auto] xl:grid-cols-[420px_minmax(260px,1fr)_auto]">
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Select open={branchSelectOpen} onOpenChange={setBranchSelectOpen} value={selectedBranchId} onValueChange={setSelectedBranchId} disabled={role !== "super_admin"}>
            <SelectTrigger className="h-9 min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              {role === "super_admin" ? <SelectItem value="all">Barcha filiallar</SelectItem> : null}
              {branchOptions.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
              {role === "super_admin" ? (
                <>
                  <div className="my-1 h-px bg-slate-700" />
                  <button
                    type="button"
                    onClick={() => { setBranchSelectOpen(false); setTimeout(() => setBranchDialogOpen(true), 0); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sky-300 outline-none transition hover:bg-slate-800 focus:bg-slate-800"
                  >
                    <FiPlus className="shrink-0" /> Filial qo&apos;shish
                  </button>
                </>
              ) : null}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="h-9 min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugun</SelectItem>
              <SelectItem value="yesterday">Kecha</SelectItem>
              <SelectItem value="week">Hafta</SelectItem>
              <SelectItem value="month">Oy</SelectItem>
              <SelectItem value="year">Yil</SelectItem>
              <SelectItem value="custom">Maxsus oraliq</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input className="h-9 pl-9" placeholder="Simulyator, mijoz, buyurtma qidirish..." />
        </div>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 thin-scrollbar lg:justify-end lg:pb-0">
          <Badge className="shrink-0 whitespace-nowrap">{money(revenue)}</Badge>
          <Badge variant="success" className="shrink-0 whitespace-nowrap">{active} faol</Badge>
          <Badge variant="muted" className="shrink-0 whitespace-nowrap">{ready} tayyor</Badge>
          <Badge variant="warning" className="shrink-0 whitespace-nowrap">{reserved} bron</Badge>
        </div>
      </div>

      <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-100 thin-scrollbar">
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
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Admin / smena:</span>
                <span className="font-semibold text-white">{activeShift.operator} · {activeShift.shiftType.split(" ")[0]}</span>
              </div>

              {/* Bugungacha bo'lgan pul */}
              <div className="rounded-lg bg-slate-950 p-3.5 space-y-2 text-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Bugungacha bo'lgan pul</div>
                <div className="flex justify-between"><span className="text-slate-400">Karta:</span><span className="font-semibold text-white">{money(cardTotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Naqd:</span><span className="font-semibold text-white">{money(cashSales)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Bank (Click/Payme/Uzum/Karmon):</span><span className="font-semibold text-white">{money(bankTotal)}</span></div>
                {balanceSales > 0 ? (
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Balansdan (info):</span><span className="text-slate-400">{money(balanceSales)}</span></div>
                ) : null}
                <div className="border-t border-slate-800 mt-1 pt-2 flex justify-between font-bold text-white text-base">
                  <span>Obshi:</span><span className="text-emerald-300">{money(totalRevenue)}</span>
                </div>
              </div>

              {/* Pul yechish (Jasur akaga) */}
              <div className="rounded-lg bg-slate-950 p-3.5 space-y-3 text-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Pul yechish</div>
                <div className="flex justify-between"><span className="text-slate-400">Karta:</span><span className="font-semibold text-emerald-300">{money(cardTotal)} <span className="text-[10px] font-normal text-slate-500">avtomat</span></span></div>
                <div className="flex justify-between"><span className="text-slate-400">Bank:</span><span className="font-semibold text-emerald-300">{money(bankTotal)} <span className="text-[10px] font-normal text-slate-500">avtomat</span></span></div>
                <div className="border-t border-slate-800 pt-2.5 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Boshlang'ich naqd (oldingi smenadan):</span><span className="text-slate-300">{money(startingCashVal)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Smenadagi naqd savdo:</span><span className="text-slate-300">+{money(cashSales)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Kassadagi naqd (kutilgan):</span><span className="font-semibold text-sky-300">{money(expectedCashVal)}</span></div>
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="cashWithdrawn" className="text-sm font-semibold text-slate-300">Naqddan qancha yechamiz?</Label>
                    <Input
                      id="cashWithdrawn"
                      placeholder="Masalan: 300 000"
                      value={cashWithdrawn}
                      onChange={(e) => setCashWithdrawn(e.target.value.replace(/\D/g, ""))}
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span className="text-white">Kassada qoladi:</span>
                    <span className={remainingAfterWithdraw < 0 ? "text-rose-400" : "text-emerald-300"}>{money(remainingAfterWithdraw)}</span>
                  </div>
                </div>
              </div>

              {/* Haqiqiy naqd (ixtiyoriy reconciliation) */}
              <div className="space-y-2">
                <Label htmlFor="actualCash" className="text-sm font-semibold text-slate-300">Kassadagi haqiqiy naqd</Label>
                <Input
                  id="actualCash"
                  placeholder="Masalan: 350 000"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ""))}
                  className="bg-slate-950 border-slate-800"
                />
                {actualCashNum !== null ? (
                  <div className={`text-xs font-semibold ${cashDifference === 0 ? "text-slate-400" : cashDifference < 0 ? "text-rose-400" : "text-amber-300"}`}>
                    Farq (haqiqiy − kutilgan): {cashDifference > 0 ? "+" : ""}{money(cashDifference)}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeNotes" className="text-sm font-semibold text-slate-300">Izoh (ixtiyoriy)</Label>
                <Input
                  id="closeNotes"
                  placeholder="Izoh yozing..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="flex-1" onClick={() => setShiftModalOpen(false)}>Bekor qilish</Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => {
                    closeShift(actualCashNum ?? expectedCashVal, cashWithdrawnNum, closeNotes);
                    setActualCash("");
                    setCashWithdrawn("");
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
                <Input value={data?.user?.name ?? "Admin"} disabled className="bg-slate-950 border-slate-800" />
              </div>

              {/* Carry-over: oldingi smenadan qolgan naqd */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Hozir kassada bo'lishi kerak naqd:</span>
                  <span className="font-bold text-amber-300">{money(previousRemaining)}</span>
                </div>
                <p className="text-xs text-slate-400">Bu pul oldingi smenadan qolgan — yangi smenadagi odamning puli emas. Agar kassada bundan kam bo'lsa, oldingi smenachidan so'rang.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-300">Smena turi</Label>
                <Select value={shiftType} onValueChange={(val) => setShiftType(val as any)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value={SHIFT_DAY}>{SHIFT_DAY}</SelectItem>
                    <SelectItem value={SHIFT_NIGHT}>{SHIFT_NIGHT}</SelectItem>
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

      <CreateBranchDialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen} />
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </header>
  );
}
