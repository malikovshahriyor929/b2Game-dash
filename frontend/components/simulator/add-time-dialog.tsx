"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, seconds } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useBackendTariffs } from "@/lib/use-backend-tariffs";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

export function AddTimeDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { addTime } = useDashboardStore();
  const paymentMethods = usePaymentMethods(simulator?.branchId, open);
  const tariffs = useBackendTariffs(simulator?.branchId, open);
  const presets = useMemo(() => {
    const zone = simulator?.zone === "VIP" ? "vip" : "main";
    return tariffs
      .filter((item) => (item.simulatorZone === zone || item.simulatorZone === "all") && item.type !== "night")
      .map((item) => ({ min: item.durationMinutes, price: item.price, bonus: item.bonus, name: item.name }));
  }, [simulator?.zone, tariffs]);
  const fallbackPreset = useMemo(() => presets[0] ?? { min: 60, price: 0, bonus: undefined, name: "" }, [presets]);
  const [selectedPreset, setSelectedPreset] = useState(fallbackPreset);
  const [customMin, setCustomMin] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [method, setMethod] = useState("Karta");

  const customMinutes = Number(customMin);
  const customAmount = Number(customPrice);
  const isCustom = customMin.length > 0 || customPrice.length > 0;
  const selectedMinutes = isCustom ? customMinutes : selectedPreset.min;
  const selectedAmount = isCustom ? customAmount : selectedPreset.price;
  const canSubmit = Boolean(simulator) && Number.isFinite(selectedMinutes) && Number.isFinite(selectedAmount) && selectedMinutes > 0 && selectedAmount > 0;

  const summary = useMemo(() => {
    if (!canSubmit) return "Vaqt va narxni kiriting";
    return `${selectedMinutes} min - ${money(selectedAmount)}`;
  }, [canSubmit, selectedAmount, selectedMinutes]);

  useEffect(() => {
    if (!open) return;
    setSelectedPreset(fallbackPreset);
    setCustomMin("");
    setCustomPrice("");
    setMethod("Karta");
  }, [fallbackPreset, open, simulator?.id]);

  function submit() {
    if (!canSubmit || !simulator) return;
    addTime(simulator.id, selectedMinutes, selectedAmount, method);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,860px)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add time</DialogTitle>
          <DialogDescription>{simulator?.name ?? "No simulator selected"} - current remaining {seconds(simulator?.remainingSeconds ?? (simulator?.remainingMinutes ?? 0) * 60)}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {presets.map((preset) => (
            <Button
              key={preset.min}
              type="button"
              variant="secondary"
              className={cn(
                "h-auto min-h-16 justify-between rounded-xl border border-transparent px-4 py-4 text-left",
                !isCustom && selectedPreset.min === preset.min && "border-sky-400 bg-sky-500/15 text-sky-100 ring-2 ring-sky-500/20",
              )}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomMin("");
                setCustomPrice("");
              }}
            >
              <span className="text-base font-bold">{preset.min} min</span>
              <span className="text-right text-base font-bold">{money(preset.price)}{preset.bonus ? <span className="block text-xs text-emerald-300">+ {preset.bonus}</span> : null}</span>
            </Button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="custom-minutes">Custom minutes</Label>
            <Input
              id="custom-minutes"
              inputMode="numeric"
              min={1}
              type="number"
              value={customMin}
              onChange={(event) => setCustomMin(event.target.value)}
              placeholder="Masalan, 45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-price">Custom price</Label>
            <Input
              id="custom-price"
              inputMode="numeric"
              min={1}
              type="number"
              value={customPrice}
              onChange={(event) => setCustomPrice(event.target.value)}
              placeholder="Masalan, 40000"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">{summary}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit}>Add time</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
