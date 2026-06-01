"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, minutes } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

const presets = [
  { min: 30, price: 30000 },
  { min: 60, price: 50000 },
  { min: 90, price: 70000 },
  { min: 120, price: 90000 },
  { min: 180, price: 130000 },
];

export function AddTimeDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { addTime } = useDashboardStore();
  const [customMin, setCustomMin] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [method, setMethod] = useState("Karta");

  function submit(min: number, price: number) {
    if (!simulator) return;
    addTime(simulator.id, min, price, method);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add time</DialogTitle>
          <DialogDescription>{simulator?.name} - current remaining {minutes(simulator?.remainingMinutes ?? 0)}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <Button key={preset.min} variant="secondary" className="h-14 justify-between" onClick={() => submit(preset.min, preset.price)}>
              <span>{preset.min} min</span><span>{money(preset.price)}</span>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Custom minutes</Label><Input value={customMin} onChange={(e) => setCustomMin(e.target.value)} /></div>
          <div className="space-y-2"><Label>Custom price</Label><Input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} /></div>
          <div className="space-y-2"><Label>Payment</Label><Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Naqd", "Karta", "QR", "Balans", "Aralash"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => submit(Number(customMin), Number(customPrice))} disabled={!customMin || !customPrice}>Add time</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
