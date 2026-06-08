"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { useBackendTariffs } from "@/lib/use-backend-tariffs";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

const paymentMethods = ["Naqd", "Karta", "QR", "Balans", "Aralash"] as const;

export function PaymentDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { pay } = useDashboardStore();
  const tariffs = useBackendTariffs();
  const [method, setMethod] = useState<(typeof paymentMethods)[number]>("Karta");
  const [cash, setCash] = useState("0");
  const [card, setCard] = useState("0");
  const [qr, setQr] = useState("0");
  const tariff = tariffs.find((item) => item.name === simulator?.tariff);
  const due = Math.max((tariff?.price ?? 50000) - (simulator?.paidAmount ?? 0), 0);
  const mixedTotal = useMemo(() => Number(cash) + Number(card) + Number(qr), [cash, card, qr]);
  const amount = method === "Aralash" ? mixedTotal : due;
  const canSubmit = Boolean(simulator) && amount > 0 && Number.isFinite(amount);

  useEffect(() => {
    if (!open) return;
    setMethod("Karta");
    setCash("0");
    setCard(String(due));
    setQr("0");
  }, [due, open, simulator?.id]);

  function submit() {
    if (!simulator || !canSubmit) return;
    pay(simulator.id, amount, method);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>{simulator?.name} - {simulator?.currentUser ?? "Guest"} - amount due {money(due)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-950 p-3"><Label>Tariff / package</Label><div className="mt-2 font-semibold">{simulator?.tariff ?? "Manual payment"}</div></div>
          <div className="rounded-xl bg-slate-950 p-3"><Label>Amount due</Label><div className="mt-2 text-xl font-black text-sky-200">{money(due)}</div></div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as (typeof paymentMethods)[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {method === "Aralash" ? (
          <div className="grid gap-3 rounded-2xl border border-slate-800 p-3 sm:grid-cols-3">
            <div className="space-y-2"><Label>Cash</Label><Input inputMode="numeric" min={0} type="number" value={cash} onChange={(e) => setCash(e.target.value)} /></div>
            <div className="space-y-2"><Label>Card</Label><Input inputMode="numeric" min={0} type="number" value={card} onChange={(e) => setCard(e.target.value)} /></div>
            <div className="space-y-2"><Label>QR</Label><Input inputMode="numeric" min={0} type="number" value={qr} onChange={(e) => setQr(e.target.value)} /></div>
            <div className="text-sm text-slate-400 sm:col-span-3">Mixed total: {money(mixedTotal)} {mixedTotal !== due ? <span className="text-amber-300">- amount due bilan teng emas</span> : <span className="text-emerald-300">- valid</span>}</div>
          </div>
        ) : null}
        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">Paying: {money(amount)}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={submit} disabled={!canSubmit || (method === "Aralash" && mixedTotal !== due)}>Pay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
