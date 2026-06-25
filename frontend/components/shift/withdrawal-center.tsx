"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FiDollarSign } from "react-icons/fi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import type { WithdrawalRequest } from "@/lib/withdrawals-api";

// Naqd выemka (inkassatsiya) markazi: so'rov yuborish + tasdiqlash/rad etish + habarlar.
// Super admin "Kassadan pul so'rash" qiladi; admin "Berdim" deb tasdiqlaydi.
// Admin "Kassadan pul berish" qiladi; super admin "Oldim" deb tasdiqlaydi.
export function WithdrawalCenter() {
  const { data } = useSession();
  const { withdrawalRequests, requestWithdrawal, confirmWithdrawal, rejectWithdrawal, selectedBranchId } = useDashboardStore();
  const isSuper = data?.user?.role === "super_admin";
  const myInitiatorRole = isSuper ? "super_admin" : "admin";

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const pending = withdrawalRequests.filter((w) => w.status === "pending");
  // Men tasdiqlashim kerak bo'lganlar (qarama-qarshi tomon yuborgan so'rovlar).
  const actionable = pending.filter((w) => w.initiatorRole !== myInitiatorRole);
  // Men yuborgan, javob kutilayotgan so'rovlar.
  const mineWaiting = pending.filter((w) => w.initiatorRole === myInitiatorRole);
  const recent = withdrawalRequests.filter((w) => w.status !== "pending").slice(0, 5);

  const actionableKey = useMemo(() => actionable.map((w) => w.id).join(","), [actionable]);

  // Yangi kelgan so'rovlar uchun bir martalik habar (toast).
  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const w of actionable) {
      if (seen.current.has(w.id)) continue;
      seen.current.add(w.id);
      toast(
        isSuper
          ? `${w.initiatedByName || "Admin"} kassadan ${money(w.amount)} berdi — oldingizmi?`
          : `${w.initiatedByName || "Boshliq"} kassadan ${money(w.amount)} so'radi — berasizmi?`,
        { icon: "💸", duration: 8000 },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionableKey, isSuper]);

  const canCreate = isSuper ? selectedBranchId !== "all" : true;
  const badgeCount = actionable.length + mineWaiting.length;

  async function submitCreate() {
    const value = Math.round(Number(amount));
    if (!(value > 0)) return toast.error("Summani kiriting");
    setBusy(true);
    try {
      await requestWithdrawal(value, note.trim() || undefined);
      toast.success(isSuper ? "Pul so'rovi yuborildi" : "Pul berish so'rovi yuborildi");
      setAmount("");
      setNote("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuborib bo'lmadi");
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, kind: "confirm" | "reject") {
    setBusy(true);
    try {
      if (kind === "confirm") await confirmWithdrawal(id);
      else await rejectWithdrawal(id);
      toast.success(kind === "confirm" ? "Tasdiqlandi" : "Rad etildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  const confirmLabel = isSuper ? "Oldim" : "Berdim";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Kassa выemka"
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/20"
      >
        <FiDollarSign />
        {badgeCount ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {badgeCount}
          </span>
        ) : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-100 thin-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Kassadan pul olish (выemka)</DialogTitle>
            <DialogDescription className="text-slate-400">
              {isSuper
                ? "Admin kassasidan qancha pul olishni so'rang. Admin berganini tasdiqlaydi."
                : "Kassadan boshliqqa berayotgan pulingizni qayd eting. Boshliq olganini tasdiqlaydi."}
            </DialogDescription>
          </DialogHeader>

          {/* So'rov yuborish */}
          <div className="space-y-3 rounded-lg bg-slate-950 p-3.5">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {isSuper ? "Kassadan pul so'rash" : "Kassadan pul berish"}
            </div>
            {!canCreate ? (
              <p className="text-xs text-amber-300">Avval yuqoridan aniq filialni tanlang.</p>
            ) : null}
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Summa (so'm)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="Masalan: 900 000"
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Izoh (ixtiyoriy)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Izoh..." className="bg-slate-900 border-slate-800" />
            </div>
            <Button className="w-full" disabled={busy || !canCreate || !amount} onClick={submitCreate}>
              {isSuper ? "Pul so'rash" : "Pul berish"}
            </Button>
          </div>

          {/* Tasdiqlash kerak bo'lgan so'rovlar */}
          {actionable.length ? (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Tasdiqlash kerak</div>
              {actionable.map((w) => (
                <WithdrawalRow key={w.id} w={w} subtitle={isSuper ? `${w.initiatedByName} kassadan berdi` : `${w.initiatedByName} so'radi`}>
                  <Button size="sm" disabled={busy} onClick={() => act(w.id, "confirm")}>{confirmLabel}</Button>
                  <Button size="sm" variant="destructive" disabled={busy} onClick={() => act(w.id, "reject")}>Rad</Button>
                </WithdrawalRow>
              ))}
            </div>
          ) : null}

          {/* Men yuborgan, kutilayotganlar */}
          {mineWaiting.length ? (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Javob kutilmoqda</div>
              {mineWaiting.map((w) => (
                <WithdrawalRow key={w.id} w={w} subtitle="Tasdiq kutilmoqda...">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => act(w.id, "reject")}>Bekor</Button>
                </WithdrawalRow>
              ))}
            </div>
          ) : null}

          {/* Oxirgi yakunlanganlar */}
          {recent.length ? (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Oxirgilar</div>
              {recent.map((w) => (
                <WithdrawalRow
                  key={w.id}
                  w={w}
                  subtitle={`${w.adminName || "Admin"} · ${w.confirmedByName ?? ""}`}
                  trailing={
                    <Badge variant={w.status === "confirmed" ? "success" : "destructive"}>
                      {w.status === "confirmed" ? "Tasdiqlandi" : "Rad etildi"}
                    </Badge>
                  }
                />
              ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" className="w-full" onClick={() => setOpen(false)}>Yopish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WithdrawalRow({ w, subtitle, children, trailing }: { w: WithdrawalRequest; subtitle: string; children?: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
      <div className="min-w-0">
        <div className="font-semibold text-white">{money(w.amount)}</div>
        <div className="truncate text-xs text-slate-500">{subtitle}</div>
        {w.note ? <div className="truncate text-xs text-slate-600">“{w.note}”</div> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">{trailing}{children}</div>
    </div>
  );
}
