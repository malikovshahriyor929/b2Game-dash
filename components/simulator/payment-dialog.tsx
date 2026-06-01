"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { tariffs } from "@/lib/mock-data";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

export function PaymentDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { pay } = useDashboardStore();
  const [method, setMethod] = useState("Karta");
  const [cash, setCash] = useState("0");
  const [card, setCard] = useState("0");
  const [qr, setQr] = useState("0");
  const tariff = tariffs.find((item) => item.name === simulator?.tariff);
  const due = Math.max((tariff?.price ?? 50000) - (simulator?.paidAmount ?? 0), 0);
  const mixedTotal = useMemo(() => Number(cash) + Number(card) + Number(qr), [cash, card, qr]);
  const amount = method === "Aralash" ? mixedTotal : due || tariff?.price || 50000;

  function submit() {
    if (!simulator) return;
    pay(simulator.id, amount, method);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>{simulator?.name} - {simulator?.currentUser ?? "Guest"} - amount due {money(due)}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-950 p-3"><Label>Tariff / package</Label><div className="mt-2 font-semibold">{simulator?.tariff ?? "Manual payment"}</div></div>
          <div className="rounded-xl bg-slate-950 p-3"><Label>Amount due</Label><div className="mt-2 text-xl font-black text-sky-200">{money(due)}</div></div>
          <div className="space-y-2"><Label>Payment method</Label><Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Naqd", "Karta", "QR", "Balans", "Aralash"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        </div>
        {method === "Aralash" ? (
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 p-3">
            <div className="space-y-2"><Label>Cash</Label><Input value={cash} onChange={(e) => setCash(e.target.value)} /></div>
            <div className="space-y-2"><Label>Card</Label><Input value={card} onChange={(e) => setCard(e.target.value)} /></div>
            <div className="space-y-2"><Label>QR</Label><Input value={qr} onChange={(e) => setQr(e.target.value)} /></div>
            <div className="col-span-3 text-sm text-slate-400">Mixed total: {money(mixedTotal)} {mixedTotal !== due ? <span className="text-amber-300">- validation warning</span> : <span className="text-emerald-300">- valid</span>}</div>
          </div>
        ) : null}
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button><Button onClick={submit} disabled={!simulator || (method === "Aralash" && mixedTotal <= 0)}>Pay</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
