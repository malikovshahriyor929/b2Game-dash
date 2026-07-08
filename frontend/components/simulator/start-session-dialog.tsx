"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { formatTariffOptionLabel, tariffPricePeriodLabel, useBackendTariffs } from "@/lib/use-backend-tariffs";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useStartSessionOptions } from "@/lib/use-start-session-options";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CustomerSelect, SelectedCustomer } from "@/components/shared/customer-select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

function normalizeUzPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("998")) return digits.slice(0, 12);
  if (digits.length === 9) digits = `998${digits}`;
  if (digits.startsWith("8") && digits.length === 11) digits = `99${digits}`;
  return digits.slice(0, 12);
}

function formatUzLocalPhone(value: string) {
  const digits = normalizeUzPhone(value);
  const local = digits.startsWith("998") ? digits.slice(3) : digits.slice(0, 9);
  const area = local.slice(0, 2);
  const prefix = local.slice(2, 5);
  const line = local.slice(5, 9);
  if (!area) return "";
  if (!prefix) return `(${area}`;
  return `(${area}) ${prefix}${line ? ` ${line}` : ""}`;
}

function localPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
}

function formatGap(minutes: number) {
  if (!Number.isFinite(minutes)) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours} soat ${mins} daqiqa`;
  if (hours) return `${hours} soat`;
  return `${mins} daqiqa`;
}

type PaymentParts = {
  cash_amount: number;
  card_amount: number;
};

const emptyParts: PaymentParts = { cash_amount: 0, card_amount: 0 };

function numeric(value: string) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function matchesTariffZone(value: string | undefined, zone: "main" | "vip") {
  const normalized = String(value ?? "all").toLowerCase();
  return normalized === "all" || normalized === zone;
}

function isVipOnlyTariff(item: { name: string; type: string; simulatorZone: string }) {
  const type = item.type.toLowerCase();
  const name = item.name.toLowerCase();
  return item.simulatorZone === "vip" || type === "vip" || name.includes("moza") || name.includes("vip");
}

export function StartSessionDialog({ open, onOpenChange, simulator, prefill, fulfillBookingId }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; prefill?: { customerName?: string; phone?: string; tariffName?: string; prepayment?: number }; fulfillBookingId?: string }) {
  const { startSession, selectedBranchId, bookings } = useDashboardStore();
  const confirm = useConfirm();
  const tariffBranchId = simulator?.branchId ?? (selectedBranchId === "all" ? undefined : selectedBranchId);
  const tariffs = useBackendTariffs(tariffBranchId, open, "all");
  const paymentMethods = usePaymentMethods(tariffBranchId, open);
  const simulatorPaymentMethods = useMemo(() => paymentMethods.filter((item) => ["cash", "card", "balance", "mixed"].includes(item.value)), [paymentMethods]);
  const startOptions = useStartSessionOptions(tariffBranchId, open);
  const simulatorTariffZone = String(simulator?.zone ?? "").toLowerCase() === "vip" ? "vip" : "main";
  const isVipSimulator = simulatorTariffZone === "vip";
  const zoneTariffs = useMemo(() => {
    const matchingZone = tariffs.filter((item) => matchesTariffZone(item.simulatorZone, simulatorTariffZone));
    if (!isVipSimulator) return matchingZone
      .filter((item) => !isVipOnlyTariff(item))
      .sort((a, b) => Number(b.isAvailable !== false) - Number(a.isAvailable !== false) || a.durationMinutes - b.durationMinutes);
    return [...matchingZone].sort((a, b) => Number(b.isAvailable !== false) - Number(a.isAvailable !== false) || a.durationMinutes - b.durationMinutes);
  }, [isVipSimulator, simulatorTariffZone, tariffs]);
  const durationOptions = useMemo(() => {
    return Array.from(new Set(zoneTariffs.map((item) => item.durationMinutes)))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
  }, [zoneTariffs]);
  const vipBaseTariff = useMemo(() => {
    const activeRows = zoneTariffs.filter((item) => item.isAvailable !== false);
    return activeRows.find((item) => item.durationMinutes === 60 && !["package", "night"].includes(item.type.toLowerCase()))
      ?? activeRows.find((item) => !["package", "night"].includes(item.type.toLowerCase()))
      ?? activeRows[0]
      ?? zoneTariffs[0];
  }, [zoneTariffs]);
  const [customerType, setCustomerType] = useState<"Guest" | "Registered">("Guest");
  const [customerName, setCustomerName] = useState("Mehmon");
  const [picked, setPicked] = useState<SelectedCustomer | null>(null);
  const [phone, setPhone] = useState("");
  const [tariffId, setTariffId] = useState("");
  const [sessionMode, setSessionMode] = useState<"regular" | "vip">("regular");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const [paymentParts, setPaymentParts] = useState<PaymentParts>(emptyParts);
  const selectedTariff = zoneTariffs.find((item) => item.id === tariffId) ?? zoneTariffs[0];
  const isVipMode = sessionMode === "vip";
  const sessionTariff = isVipMode ? vipBaseTariff : selectedTariff;
  const vipHourlyRate = sessionTariff ? Math.round((sessionTariff.price * 60) / (sessionTariff.durationMinutes || 60)) : 0;
  const selectedTariffLabel = isVipMode ? "VIP" : selectedTariff?.name ?? "";
  const selectedCustomer = picked;
  const totalAmount = paymentStatus === "unpaid" || isVipMode ? 0 : selectedTariff?.price ?? 0;
  const isMixedPayment = paymentMethod === "Aralash" && totalAmount > 0;
  const isBalancePayment = paymentMethod === "Balans" && totalAmount > 0;
  const mixedTotal = paymentParts.cash_amount + paymentParts.card_amount;
  const canSubmit = Boolean(simulator)
    && customerName.trim().length > 0
    && (isVipMode || Number(duration) > 0)
    && Boolean(sessionTariff)
    && sessionTariff?.isAvailable !== false
    && (customerType === "Guest" || Boolean(selectedCustomer))
    && (!isBalancePayment || Boolean(selectedCustomer))
    && (!isMixedPayment || mixedTotal === totalAmount);

  const summary = useMemo(() => {
    if (isVipMode) return `VIP - ${money(vipHourlyRate)}/soat - to'xtatishda hisoblanadi`;
    return `${duration} min - ${money(selectedTariff?.price ?? 0)}${selectedTariff?.bonus ? ` - bonus: ${selectedTariff.bonus}` : ""} - to'lov oxirida`;
  }, [duration, isVipMode, selectedTariff?.bonus, selectedTariff?.price, vipHourlyRate]);

  useEffect(() => {
    if (!open) return;
    setCustomerType("Guest");
    setCustomerName(prefill?.customerName || "Mehmon");
    setPicked(null);
    setPhone(prefill?.phone ? normalizeUzPhone(prefill.phone) : "");
    setSessionMode("regular");
    // Brondan kelganda tarifni nomi bo'yicha topib qo'yamiz, aks holda birinchisi.
    const matched = prefill?.tariffName ? zoneTariffs.find((item) => item.name === prefill.tariffName) : undefined;
    const first = matched ?? zoneTariffs.find((item) => item.isAvailable !== false) ?? zoneTariffs[0];
    setTariffId(first?.id ?? "");
    setDuration(String(first?.durationMinutes || 60));
    setPaymentStatus("unpaid");
    setPaymentMethod(simulatorPaymentMethods[0]?.label ?? "Karta");
    setPaymentParts({ ...emptyParts, card_amount: first?.price ?? 0 });
  }, [open, simulatorPaymentMethods, simulator?.id, startOptions.paymentModes, zoneTariffs, prefill?.customerName, prefill?.phone, prefill?.tariffName]);

  useEffect(() => {
    if (!open || isMixedPayment) return;
    setPaymentParts({ ...emptyParts, card_amount: totalAmount > 0 ? totalAmount : 0 });
  }, [isMixedPayment, open, totalAmount]);

  // Band PC ogohlantirishi (bloklamaydi — admin xohlasa almashtiradi).
  const simulatorBusy = Boolean(simulator && ["busy", "unpaid"].includes(simulator.status));
  // Shu PC uchun eng yaqin kelayotgan/faol bron (tugashi hozirdan keyin bo'lganlari).
  const nextBooking = useMemo(() => {
    if (!simulator) return undefined;
    const nowMs = Date.now();
    return bookings
      .filter((booking) =>
        booking.id !== fulfillBookingId &&
        booking.simulatorId === simulator.id &&
        ["Pending", "Confirmed", "Arrived"].includes(booking.status) &&
        Boolean(booking.startAt) && Boolean(booking.endAt) &&
        Number.isFinite(Date.parse(booking.startAt ?? "")) &&
        Number.isFinite(Date.parse(booking.endAt ?? "")) &&
        Date.parse(booking.endAt ?? "") > nowMs,
      )
      .sort((a, b) => Date.parse(a.startAt ?? "") - Date.parse(b.startAt ?? ""))[0];
  }, [bookings, simulator, fulfillBookingId]);

  // Bron boshlanishigacha qancha daqiqa bo'sh (bron yo'q bo'lsa cheksiz).
  const availableMinutes = useMemo(() => {
    if (!nextBooking?.startAt) return Infinity;
    return Math.max(0, Math.floor((Date.parse(nextBooking.startAt) - Date.now()) / 60000));
  }, [nextBooking]);

  const requestedMinutes = isVipMode ? Infinity : Number(duration) || 0;
  const bookingBlocks = Boolean(nextBooking) && requestedMinutes > availableMinutes;

  // Sessions start postpaid: fixed packages and open VIP are paid at stop.
  useEffect(() => {
    setPaymentStatus("unpaid");
  }, [selectedTariff?.id]);

  function handleCustomerTypeChange(value: string) {
    const type = value as "Guest" | "Registered";
    setCustomerType(type);
    setPicked(null);
    setPhone("");
    setCustomerName(type === "Guest" ? "Mehmon" : "");
  }

  function handleCustomerPick(customer: SelectedCustomer | null) {
    setPicked(customer);
    setCustomerName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
  }

  function handleTariffChange(value: string) {
    setTariffId(value);
    const item = zoneTariffs.find((row) => row.id === value);
    setDuration(String(item?.durationMinutes || 60));
  }

  function handleDurationChange(value: string) {
    setDuration(value);
    const item = zoneTariffs.find((row) => String(row.durationMinutes) === value);
    if (item) setTariffId(item.id);
  }

  function setPaymentPart(key: keyof PaymentParts, value: string) {
    setPaymentParts((current) => ({ ...current, [key]: numeric(value) }));
  }

  async function submit() {
    if (!canSubmit || !simulator) return;
    const amountLine = isVipMode ? `VIP: ${money(vipHourlyRate)}/soat` : `To'lov: ${money(totalAmount)}`;
    const ok = await confirm({
      title: "Sessiya boshlansinmi?",
      description: `${simulator.name} — ${customerName.trim()} · ${selectedTariffLabel} · ${amountLine}`,
      confirmLabel: "Boshlash",
      tone: "success",
    });
    if (!ok) return;
    startSession(simulator.id, {
      customerName: customerName.trim(),
      phone,
      customerId: selectedCustomer?.id,
      tariff: selectedTariffLabel,
      tariffId: sessionTariff?.id,
      duration: isVipMode ? 60 : Number(duration),
      amount: totalAmount,
      paymentStatus,
      paymentMethod,
      payment: isMixedPayment ? paymentParts : undefined,
      bookingId: fulfillBookingId,
      sessionMode,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(94vw,860px)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Sessiyani boshlash</DialogTitle>
          <DialogDescription>{simulator?.name ?? "Simulyator tanlanmagan"} uchun yangi sessiya.</DialogDescription>
        </DialogHeader>

        {prefill?.prepayment ? (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm font-semibold text-sky-200">
            Oldindan to'lov: {money(prefill.prepayment)} — to'lovni hisobga oling.
          </div>
        ) : null}
        {simulatorBusy ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200">
            ⚠️ Bu simulyator hozir band (faol sessiya bor). Yangi sessiya boshlash uni almashtiradi.
          </div>
        ) : null}
        {bookingBlocks ? (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm font-semibold text-red-200">
            ⛔ Bu PC {nextBooking?.startTime} da bron qilingan{nextBooking?.customerName ? ` (${nextBooking.customerName})` : ""}.{" "}
            {isVipMode
              ? "VIP sessiya ochiq davom etadi — bron borligi sabab boshlab bo'lmaydi."
              : `Hozirdan atigi ${formatGap(availableMinutes)} bo'sh. Shu vaqtga sig'adigan qisqaroq tarif/davomiylik tanlang.`}
          </div>
        ) : nextBooking ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200">
            ⏳ Keyingi bron: {nextBooking.startTime}{nextBooking.customerName ? ` (${nextBooking.customerName})` : ""} — hozirdan {formatGap(availableMinutes)} bo'sh.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Mijoz turi</Label>
            <Select
              value={customerType}
              onValueChange={handleCustomerTypeChange}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {startOptions.customerTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-customer-name">Mijoz ismi</Label>
            {customerType === "Registered" ? (
              <CustomerSelect branchId={tariffBranchId} value={picked} onChange={handleCustomerPick} />
            ) : (
              <Input id="start-customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-phone">Telefon</Label>
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <div className="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-slate-300">+998</div>
              <Input
                id="start-phone"
                inputMode="tel"
                value={formatUzLocalPhone(phone)}
                onChange={(event) => {
                  const local = localPhoneDigits(event.target.value);
                  setPhone(local ? `998${local}` : "");
                }}
                placeholder="Telefon raqami"
                disabled={customerType === "Registered" && Boolean(selectedCustomer)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rejim</Label>
            <Select value={sessionMode} onValueChange={(value) => setSessionMode(value as "regular" | "vip")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Oddiy</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isVipMode ? (
          <div className="space-y-2">
            <Label>Tarif / paket</Label>
            <Select value={selectedTariff?.id ?? ""} onValueChange={handleTariffChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {zoneTariffs.map((item) => (
                  <SelectItem key={item.id} value={item.id} disabled={item.isAvailable === false}>
                    {formatTariffOptionLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTariff ? (
              <p className="text-xs font-semibold text-slate-500">
                Paket narxi: {money(selectedTariff.price)}
                {` (${tariffPricePeriodLabel(selectedTariff)})`}
              </p>
            ) : null}
            {zoneTariffs.length === 0 ? (
              <p className="text-xs font-semibold text-red-300">
                Bu PC uchun tarif topilmadi. Tariflar menyusida mos tarif qo'shilganini tekshiring.
              </p>
            ) : null}
          </div>
          ) : (
            <div className="space-y-2">
              <Label>VIP narxi</Label>
              <div className="flex h-10 items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 text-sm font-semibold text-amber-200">
                {vipBaseTariff ? `${money(vipHourlyRate)}/soat` : "VIP uchun aktiv 1 soatlik tarif topilmadi"}
              </div>
            </div>
          )}

          {!isVipMode ? (
          <div className="space-y-2">
            <Label>Davomiyligi</Label>
            <Select value={duration} onValueChange={handleDurationChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {durationOptions.map((minutes) => <SelectItem key={minutes} value={String(minutes)} disabled={minutes > availableMinutes}>{minutes} min{minutes > availableMinutes ? " (bron)" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          ) : null}

          <div className="space-y-2">
            <Label>To'lov turi</Label>
            <div className="flex h-10 items-center rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold text-slate-300">
              Oxirida to'lov
            </div>
          </div>

          {totalAmount > 0 ? (
            <div className="space-y-2">
              <Label>To'lov usuli</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {simulatorPaymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {isMixedPayment ? (
            <div className="grid gap-3 rounded-xl border border-slate-800 p-3 md:col-span-2 sm:grid-cols-2">
              <div className="space-y-2"><Label>Naqd</Label><Input inputMode="numeric" min={0} type="number" value={paymentParts.cash_amount} onChange={(e) => setPaymentPart("cash_amount", e.target.value)} /></div>
              <div className="space-y-2"><Label>Karta</Label><Input inputMode="numeric" min={0} type="number" value={paymentParts.card_amount} onChange={(e) => setPaymentPart("card_amount", e.target.value)} /></div>
              <div className="text-sm text-slate-400 sm:col-span-2">Aralash jami: {money(mixedTotal)} {mixedTotal !== totalAmount ? <span className="text-amber-300">- to&apos;lov summasiga teng emas</span> : <span className="text-emerald-300">- to&apos;g&apos;ri</span>}</div>
            </div>
          ) : null}

          {isBalancePayment && !selectedCustomer ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200 md:col-span-2">
              Balansdan to'lash uchun ro'yxatdan o'tgan mijozni tanlang.
            </div>
          ) : null}

          <div className="rounded-xl bg-slate-950/80 p-4">
            <Label>Umumiy summa</Label>
            <div className="mt-2 text-2xl font-black text-sky-200">{isVipMode ? `${money(vipHourlyRate)}/soat` : money(selectedTariff?.price ?? 0)}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">Hozir olinmaydi, sessiya oxirida to'lanadi</div>
            {!isVipMode && selectedTariff?.bonus ? <div className="mt-1 text-xs font-semibold text-emerald-300">Bonus: {selectedTariff.bonus}</div> : null}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">{summary}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!canSubmit || bookingBlocks}>Sessiyani boshlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
