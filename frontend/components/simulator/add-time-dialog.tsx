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
import { useConfirm } from "@/components/ui/confirm-dialog";
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

export function AddTimeDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { addTime } = useDashboardStore();
  const confirm = useConfirm();
  const paymentMethods = usePaymentMethods(simulator?.branchId, open);
  const simulatorPaymentMethods = useMemo(() => paymentMethods.filter((item) => ["cash", "card", "balance", "mixed"].includes(item.value)), [paymentMethods]);
  const tariffs = useBackendTariffs(simulator?.branchId, open);
  const presets = useMemo(() => {
    const zone = simulator?.zone === "VIP" ? "vip" : "main";
    const byDuration = new Map<number, { id: string; min: number; price: number; bonus: string | undefined; name: string; exactZone: boolean; happy: boolean }>();
    tariffs
      .filter((item) => (item.simulatorZone === zone || item.simulatorZone === "all") && item.type !== "night")
      .forEach((item) => {
        const preset = {
          id: item.id,
          min: item.durationMinutes,
          price: item.price,
          bonus: item.bonus,
          name: item.name,
          exactZone: item.simulatorZone === zone,
          happy: Boolean(item.isHappyHour || item.pricePeriod === "happy_hour"),
        };
        const existing = byDuration.get(preset.min);
        if (!existing) {
          byDuration.set(preset.min, preset);
          return;
        }
        // Add-time'da bir xil daqiqa ikki marta chiqmasin:
        // 1) avval shu zona tarifi, 2) happy-hour/skidka, 3) arzonroq narx.
        const presetScore = Number(preset.exactZone) * 100 + Number(preset.happy) * 10 - preset.price / 1_000_000;
        const existingScore = Number(existing.exactZone) * 100 + Number(existing.happy) * 10 - existing.price / 1_000_000;
        if (presetScore > existingScore) byDuration.set(preset.min, preset);
      });
    return Array.from(byDuration.values()).sort((a, b) => a.min - b.min);
  }, [simulator?.zone, tariffs]);
  const fallbackPreset = useMemo(() => presets[0] ?? { id: "", min: 60, price: 0, bonus: undefined, name: "" }, [presets]);
  const [selectedPreset, setSelectedPreset] = useState(fallbackPreset);
  const [customMin, setCustomMin] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [method, setMethod] = useState("Karta");
  const [parts, setParts] = useState<PaymentParts>(emptyParts);

  const customMinutes = Number(customMin);
  const customAmount = Number(customPrice);
  const isCustom = customMin.length > 0 || customPrice.length > 0;
  const selectedMinutes = isCustom ? customMinutes : selectedPreset.min;
  const selectedAmount = isCustom ? customAmount : selectedPreset.price;
  const minuteRate = selectedPreset.min > 0 ? selectedPreset.price / selectedPreset.min : 0;
  const isMixed = method === "Aralash";
  const mixedTotal = parts.cash_amount + parts.card_amount;
  const canSubmit = Boolean(simulator)
    && Number.isFinite(selectedMinutes)
    && Number.isFinite(selectedAmount)
    && selectedMinutes > 0
    && selectedAmount > 0
    && (!isMixed || mixedTotal === selectedAmount);

  const summary = useMemo(() => {
    if (!canSubmit) return "Vaqt va narxni kiriting";
    return `${selectedMinutes} min - ${money(selectedAmount)}`;
  }, [canSubmit, selectedAmount, selectedMinutes]);

  useEffect(() => {
    if (!open) return;
    setSelectedPreset(fallbackPreset);
    setCustomMin("");
    setCustomPrice("");
    setMethod(simulatorPaymentMethods[0]?.label ?? "Karta");
    setParts({ ...emptyParts, card_amount: fallbackPreset.price });
  }, [fallbackPreset, open, simulator?.id, simulatorPaymentMethods]);

  useEffect(() => {
    if (!open || isMixed) return;
    setParts({ ...emptyParts, card_amount: selectedAmount > 0 ? selectedAmount : 0 });
  }, [isMixed, open, selectedAmount]);

  function handleCustomMinutes(value: string) {
    setCustomMin(value);
    const minutes = numeric(value);
    setCustomPrice(minutes > 0 && minuteRate > 0 ? String(Math.round(minutes * minuteRate)) : "");
  }

  function handleCustomPrice(value: string) {
    setCustomPrice(value);
    const price = numeric(value);
    setCustomMin(price > 0 && minuteRate > 0 ? String(Math.max(1, Math.round(price / minuteRate))) : "");
  }

  function setPart(key: keyof PaymentParts, value: string) {
    setParts((current) => ({ ...current, [key]: numeric(value) }));
  }

  async function submit() {
    if (!canSubmit || !simulator) return;
    const ok = await confirm({
      title: "Vaqt qo'shilsinmi?",
      description: `${simulator.name} — ${selectedMinutes} min · ${money(selectedAmount)}`,
      confirmLabel: "Qo'shish",
      tone: "default",
    });
    if (!ok) return;
    addTime(simulator.id, selectedMinutes, selectedAmount, method, isMixed ? parts : undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,860px)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Vaqt qo'shish</DialogTitle>
          <DialogDescription>{simulator?.name ?? "Simulyator tanlanmagan"} - hozir qolgan {seconds(simulator?.remainingSeconds ?? (simulator?.remainingMinutes ?? 0) * 60)}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="secondary"
              className={cn(
                "h-auto min-h-16 justify-between rounded-xl border border-transparent px-4 py-4 text-left",
                !isCustom && selectedPreset.id === preset.id && "border-sky-400 bg-sky-500/15 text-sky-100 ring-2 ring-sky-500/20",
              )}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomMin("");
                setCustomPrice("");
                setParts({ ...emptyParts, card_amount: preset.price });
              }}
            >
              <span className="text-base font-bold">{preset.min} min</span>
              <span className="text-right text-base font-bold">{money(preset.price)}{preset.bonus ? <span className="block text-xs text-emerald-300">+ {preset.bonus}</span> : null}</span>
            </Button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="custom-minutes">Maxsus daqiqalar</Label>
            <Input
              id="custom-minutes"
              inputMode="numeric"
              min={1}
              type="number"
              value={customMin}
              onChange={(event) => handleCustomMinutes(event.target.value)}
              placeholder="Masalan, 45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-price">Maxsus narx</Label>
            <Input
              id="custom-price"
              inputMode="numeric"
              min={1}
              type="number"
              value={customPrice}
              onChange={(event) => handleCustomPrice(event.target.value)}
              placeholder="Masalan, 40000"
            />
          </div>
          <div className="space-y-2">
            <Label>To'lov</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {simulatorPaymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isMixed ? (
          <div className="grid gap-3 rounded-2xl border border-slate-800 p-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Naqd</Label><Input inputMode="numeric" min={0} type="number" value={parts.cash_amount} onChange={(e) => setPart("cash_amount", e.target.value)} /></div>
            <div className="space-y-2"><Label>Karta</Label><Input inputMode="numeric" min={0} type="number" value={parts.card_amount} onChange={(e) => setPart("card_amount", e.target.value)} /></div>
            <div className="text-sm text-slate-400 sm:col-span-2">Aralash jami: {money(mixedTotal)} {mixedTotal !== selectedAmount ? <span className="text-amber-300">- narxga teng emas</span> : <span className="text-emerald-300">- to&apos;g&apos;ri</span>}</div>
          </div>
        ) : null}

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">{summary} · {selectedPreset.name || "Tarif"}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!canSubmit}>Vaqt qo'shish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
