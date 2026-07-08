"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

type PaymentParts = {
  cash_amount: number;
  card_amount: number;
};

const emptyParts: PaymentParts = { cash_amount: 0, card_amount: 0 };

function numeric(value: string) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

export function PaymentDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { pay } = useDashboardStore();
  const paymentMethods = usePaymentMethods(simulator?.branchId, open);
  const simulatorPaymentMethods = useMemo(() => paymentMethods.filter((item) => ["cash", "card", "balance", "mixed"].includes(item.value)), [paymentMethods]);
  const [method, setMethod] = useState("Karta");
  const [parts, setParts] = useState<PaymentParts>(emptyParts);
  const openTotal = (simulator?.accruedAmount ?? 0) + (simulator?.addedTimeAmount ?? 0) + (simulator?.shopAmount ?? 0);
  const fixedTotal = simulator?.totalAmount ?? simulator?.sessionAmount ?? 0;
  const due = Math.max((simulator?.billingMode === "open" ? openTotal : fixedTotal) - (simulator?.paidAmount ?? 0), 0);
  const mixedTotal = useMemo(() => parts.cash_amount + parts.card_amount, [parts]);
  const amount = method === "Aralash" ? mixedTotal : due;
  const canSubmit = Boolean(simulator) && amount > 0 && Number.isFinite(amount);

  useEffect(() => {
    if (!open) return;
    setMethod(simulatorPaymentMethods[0]?.label ?? "Karta");
    setParts({ ...emptyParts, card_amount: due });
  }, [due, open, simulator?.id, simulatorPaymentMethods]);

  function setPart(key: keyof PaymentParts, value: string) {
    setParts((current) => ({ ...current, [key]: numeric(value) }));
  }

  function submit() {
    if (!simulator || !canSubmit) return;
    pay(simulator.id, amount, method, method === "Aralash" ? parts : undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>To&apos;lov</DialogTitle>
          <DialogDescription>{simulator?.name} - {simulator?.currentUser ?? "Mehmon"} - to&apos;lov summasi {money(due)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-950 p-3"><Label>Tarif / paket</Label><div className="mt-2 font-semibold">{simulator?.tariff ?? "Qo'lda to'lov"}</div></div>
          <div className="rounded-xl bg-slate-950 p-3"><Label>To&apos;lov summasi</Label><div className="mt-2 text-xl font-black text-sky-200">{money(due)}</div></div>
          <div className="space-y-2 sm:col-span-2">
            <Label>To&apos;lov usuli</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{simulatorPaymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {method === "Aralash" ? (
          <div className="grid gap-3 rounded-2xl border border-slate-800 p-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Naqd</Label><Input inputMode="numeric" min={0} type="number" value={parts.cash_amount} onChange={(e) => setPart("cash_amount", e.target.value)} /></div>
            <div className="space-y-2"><Label>Karta</Label><Input inputMode="numeric" min={0} type="number" value={parts.card_amount} onChange={(e) => setPart("card_amount", e.target.value)} /></div>
            <div className="text-sm text-slate-400 sm:col-span-2">Aralash jami: {money(mixedTotal)} {mixedTotal !== due ? <span className="text-amber-300">- to&apos;lov summasiga teng emas</span> : <span className="text-emerald-300">- to&apos;g&apos;ri</span>}</div>
          </div>
        ) : null}
        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">To&apos;lanmoqda: {money(amount)}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Yopish</Button>
          <Button onClick={submit} disabled={!canSubmit || (method === "Aralash" && mixedTotal !== due)}>To&apos;lash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
