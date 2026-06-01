"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tariffs } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

export function StartSessionDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { startSession } = useDashboardStore();
  const [customerName, setCustomerName] = useState("Guest");
  const [phone, setPhone] = useState("");
  const [tariff, setTariff] = useState("Racing 60 min");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "partial">("paid");
  const selectedTariff = tariffs.find((item) => item.name === tariff) ?? tariffs[0];

  function submit() {
    if (!simulator) return;
    startSession(simulator.id, { customerName, phone, tariff, duration: Number(duration), amount: selectedTariff.price, paymentStatus });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start session</DialogTitle>
          <DialogDescription>{simulator?.name ?? "No simulator selected"} uchun yangi sessiya.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Customer type</Label><Select defaultValue="Guest"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Guest">Guest</SelectItem><SelectItem value="Registered">Registered user</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Customer name</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="998..." /></div>
          <div className="space-y-2"><Label>Tariff / package</Label><Select value={tariff} onValueChange={setTariff}>{<SelectTrigger><SelectValue /></SelectTrigger>}<SelectContent>{tariffs.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Duration</Label><Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30, 60, 90, 120, 180].map((item) => <SelectItem key={item} value={String(item)}>{item} min</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Payment mode</Label><Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as "paid" | "unpaid" | "partial")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Prepaid</SelectItem><SelectItem value="unpaid">Postpaid</SelectItem><SelectItem value="partial">Balance</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Payment method</Label><Select defaultValue="Karta"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Naqd", "Karta", "QR", "Balans", "Aralash"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="rounded-xl bg-slate-950 p-3"><Label>Total amount</Label><div className="mt-2 text-xl font-black text-sky-200">{money(selectedTariff.price)}</div></div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={!simulator}>Start session</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
