"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { useBackendTariffs } from "@/lib/use-backend-tariffs";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

const customerTypes = ["Guest", "Registered"] as const;
const paymentModes = [
  { value: "paid", label: "Prepaid" },
  { value: "unpaid", label: "Postpaid" },
  { value: "partial", label: "Balance" },
] as const;
export function StartSessionDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { startSession } = useDashboardStore();
  const tariffs = useBackendTariffs();
  const paymentMethods = usePaymentMethods();
  const zoneTariffs = useMemo(() => {
    const zone = simulator?.zone === "VIP" ? "vip" : "main";
    return tariffs.filter((item) => item.simulatorZone === zone || item.simulatorZone === "all");
  }, [simulator?.zone, tariffs]);
  const [customerType, setCustomerType] = useState<(typeof customerTypes)[number]>("Guest");
  const [customerName, setCustomerName] = useState("Guest");
  const [phone, setPhone] = useState("");
  const [tariff, setTariff] = useState("");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "partial">("paid");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const selectedTariff = zoneTariffs.find((item) => item.name === tariff) ?? zoneTariffs[0];
  const canSubmit = Boolean(simulator) && customerName.trim().length > 0 && Number(duration) > 0 && Boolean(selectedTariff);
  const totalAmount = paymentStatus === "unpaid" ? 0 : selectedTariff?.price ?? 0;

  const summary = useMemo(() => {
    const mode = paymentModes.find((item) => item.value === paymentStatus)?.label ?? "Prepaid";
    return `${duration} min - ${money(selectedTariff?.price ?? 0)}${selectedTariff?.bonus ? ` - bonus: ${selectedTariff.bonus}` : ""} - ${mode}`;
  }, [duration, paymentStatus, selectedTariff?.bonus, selectedTariff?.price]);

  useEffect(() => {
    if (!open) return;
    setCustomerType("Guest");
    setCustomerName("Guest");
    setPhone("");
    const first = zoneTariffs[0];
    setTariff(first?.name ?? "");
    setDuration(String(first?.durationMinutes || 60));
    setPaymentStatus("paid");
    setPaymentMethod("Karta");
  }, [open, simulator?.id, zoneTariffs]);

  function handleTariffChange(value: string) {
    setTariff(value);
    const item = zoneTariffs.find((row) => row.name === value);
    setDuration(String(item?.durationMinutes || 60));
  }

  function handleDurationChange(value: string) {
    setDuration(value);
    const item = zoneTariffs.find((row) => String(row.durationMinutes) === value);
    if (item) setTariff(item.name);
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
      paymentMethod,
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
                {zoneTariffs.map((item) => <SelectItem key={item.id} value={item.name}>{item.name} - {money(item.price)}{item.bonus ? ` + ${item.bonus}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={handleDurationChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {zoneTariffs.map((item) => <SelectItem key={item.id} value={String(item.durationMinutes)}>{item.durationMinutes} min</SelectItem>)}
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
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl bg-slate-950/80 p-4">
            <Label>Total amount</Label>
            <div className="mt-2 text-2xl font-black text-sky-200">{money(totalAmount)}</div>
            {selectedTariff?.bonus ? <div className="mt-1 text-xs font-semibold text-emerald-300">Bonus: {selectedTariff.bonus}</div> : null}
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
