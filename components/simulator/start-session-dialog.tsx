"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tariffs } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

const customerTypes = ["Guest", "Registered"] as const;
const paymentMethods = ["Naqd", "Karta", "QR", "Balans", "Aralash"] as const;
const paymentModes = [
  { value: "paid", label: "Prepaid" },
  { value: "unpaid", label: "Postpaid" },
  { value: "partial", label: "Balance" },
] as const;
const durations = [30, 60, 90, 120, 180];

function durationFromTariff(name: string) {
  const minuteMatch = name.match(/(\d+)\s*min/i);
  if (minuteMatch) return minuteMatch[1];
  const hourMatch = name.match(/(\d+)\s*(hour|soat)/i);
  if (hourMatch) return String(Number(hourMatch[1]) * 60);
  return "60";
}

export function StartSessionDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { startSession } = useDashboardStore();
  const [customerType, setCustomerType] = useState<(typeof customerTypes)[number]>("Guest");
  const [customerName, setCustomerName] = useState("Guest");
  const [phone, setPhone] = useState("");
  const [tariff, setTariff] = useState("Racing 60 min");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "partial">("paid");
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]>("Karta");
  const selectedTariff = tariffs.find((item) => item.name === tariff) ?? tariffs[0];
  const canSubmit = Boolean(simulator) && customerName.trim().length > 0 && Number(duration) > 0;
  const totalAmount = paymentStatus === "unpaid" ? 0 : selectedTariff.price;

  const summary = useMemo(() => {
    const mode = paymentModes.find((item) => item.value === paymentStatus)?.label ?? "Prepaid";
    return `${duration} min - ${money(selectedTariff.price)} - ${mode}`;
  }, [duration, paymentStatus, selectedTariff.price]);

  useEffect(() => {
    if (!open) return;
    setCustomerType("Guest");
    setCustomerName("Guest");
    setPhone("");
    setTariff("Racing 60 min");
    setDuration("60");
    setPaymentStatus("paid");
    setPaymentMethod("Karta");
  }, [open, simulator?.id]);

  function handleTariffChange(value: string) {
    setTariff(value);
    setDuration(durationFromTariff(value));
  }

  function submit() {
    if (!canSubmit || !simulator) return;
    startSession(simulator.id, {
      customerName: customerName.trim(),
      phone,
      tariff,
      duration: Number(duration),
      amount: totalAmount,
      paymentStatus,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,860px)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Start session</DialogTitle>
          <DialogDescription>{simulator?.name ?? "No simulator selected"} uchun yangi sessiya.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer type</Label>
            <Select
              value={customerType}
              onValueChange={(value) => {
                const type = value as (typeof customerTypes)[number];
                setCustomerType(type);
                if (type === "Guest" && !customerName.trim()) setCustomerName("Guest");
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Guest">Guest</SelectItem>
                <SelectItem value="Registered">Registered user</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-customer-name">Customer name</Label>
            <Input id="start-customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-phone">Phone</Label>
            <Input id="start-phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="998..." />
          </div>

          <div className="space-y-2">
            <Label>Tariff / package</Label>
            <Select value={tariff} onValueChange={handleTariffChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tariffs.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {durations.map((item) => <SelectItem key={item} value={String(item)}>{item} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment mode</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as "paid" | "unpaid" | "partial")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentModes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as (typeof paymentMethods)[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-4">
            <Label>Total amount</Label>
            <div className="mt-2 text-2xl font-black text-sky-200">{money(totalAmount)}</div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">{summary}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit}>Start session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
