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

export function StartSessionDialog({ open, onOpenChange, simulator, prefill, fulfillBookingId }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; prefill?: { customerName?: string; phone?: string; tariffName?: string; prepayment?: number }; fulfillBookingId?: string }) {
  const { startSession, selectedBranchId, bookings } = useDashboardStore();
  const confirm = useConfirm();
  const tariffBranchId = simulator?.branchId ?? (selectedBranchId === "all" ? undefined : selectedBranchId);
  const tariffs = useBackendTariffs(tariffBranchId, open);
  const paymentMethods = usePaymentMethods(tariffBranchId, open);
  const startOptions = useStartSessionOptions(tariffBranchId, open);
  // Show every active tariff in create session, regardless of the simulator's zone
  // (VIP/Logitech all selectable). VIP tariffs bill as open hourly sessions.
  const zoneTariffs = tariffs;
  const durationOptions = useMemo(() => {
    return Array.from(new Set(zoneTariffs.map((item) => item.durationMinutes)))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
  }, [zoneTariffs]);
  const [customerType, setCustomerType] = useState<"Guest" | "Registered">("Guest");
  const [customerName, setCustomerName] = useState("Guest");
  const [picked, setPicked] = useState<SelectedCustomer | null>(null);
  const [phone, setPhone] = useState("");
  const [tariffId, setTariffId] = useState("");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const selectedTariff = zoneTariffs.find((item) => item.id === tariffId) ?? zoneTariffs[0];
  // VIP tariffs (type='vip') open as hourly sessions: no fixed duration, billed at stop.
  const isOpenTariff = (selectedTariff?.type ?? "").toLowerCase() === "vip";
  const hourlyRate = selectedTariff && isOpenTariff ? Math.round((selectedTariff.price * 60) / (selectedTariff.durationMinutes || 60)) : 0;
  const selectedCustomer = picked;
  const canSubmit = Boolean(simulator) && customerName.trim().length > 0 && (isOpenTariff || Number(duration) > 0) && Boolean(selectedTariff) && (customerType === "Guest" || Boolean(selectedCustomer));
  const totalAmount = isOpenTariff || paymentStatus === "unpaid" ? 0 : selectedTariff?.price ?? 0;

  const summary = useMemo(() => {
    if (isOpenTariff) return `Soatlik: ${money(hourlyRate)}/soat - to'xtatishda hisoblanadi`;
    const mode = startOptions.paymentModes.find((item) => item.value === paymentStatus)?.label ?? "Prepaid";
    return `${duration} min - ${money(selectedTariff?.price ?? 0)}${selectedTariff?.bonus ? ` - bonus: ${selectedTariff.bonus}` : ""} - ${mode}`;
  }, [duration, hourlyRate, isOpenTariff, paymentStatus, selectedTariff?.bonus, selectedTariff?.price, startOptions.paymentModes]);

  useEffect(() => {
    if (!open) return;
    setCustomerType("Guest");
    setCustomerName(prefill?.customerName || "Guest");
    setPicked(null);
    setPhone(prefill?.phone ? normalizeUzPhone(prefill.phone) : "");
    // Brondan kelganda tarifni nomi bo'yicha topib qo'yamiz, aks holda birinchisi.
    const matched = prefill?.tariffName ? zoneTariffs.find((item) => item.name === prefill.tariffName) : undefined;
    const first = matched ?? zoneTariffs[0];
    setTariffId(first?.id ?? "");
    setDuration(String(first?.durationMinutes || 60));
    setPaymentStatus(startOptions.paymentModes[0]?.value ?? "paid");
    setPaymentMethod(paymentMethods[0]?.label ?? "Karta");
  }, [open, paymentMethods, simulator?.id, startOptions.paymentModes, zoneTariffs, prefill?.customerName, prefill?.phone, prefill?.tariffName]);

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

  // So'ralayotgan vaqt bron oralig'iga kirib ketadimi? Ochiq (VIP) cheksiz — bron bo'lsa sig'maydi.
  const requestedMinutes = isOpenTariff ? Infinity : Number(duration) || 0;
  const bookingBlocks = Boolean(nextBooking) && requestedMinutes > availableMinutes;

  // Open (VIP) sessions are postpaid — the amount is only known at stop.
  useEffect(() => {
    if (isOpenTariff) setPaymentStatus("unpaid");
  }, [isOpenTariff]);

  function handleCustomerTypeChange(value: string) {
    const type = value as "Guest" | "Registered";
    setCustomerType(type);
    setPicked(null);
    setPhone("");
    setCustomerName(type === "Guest" ? "Guest" : "");
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

  async function submit() {
    if (!canSubmit || !simulator) return;
    const amountLine = isOpenTariff
      ? `Soatlik: ${money(hourlyRate)}/soat`
      : `To'lov: ${money(totalAmount)}`;
    const ok = await confirm({
      title: "Sessiya boshlansinmi?",
      description: `${simulator.name} — ${customerName.trim()} · ${selectedTariff.name} · ${amountLine}`,
      confirmLabel: "Boshlash",
      tone: "success",
    });
    if (!ok) return;
    startSession(simulator.id, {
      customerName: customerName.trim(),
      phone,
      customerId: selectedCustomer?.id,
      tariff: selectedTariff.name,
      tariffId: selectedTariff.id,
      duration: Number(duration),
      amount: totalAmount,
      paymentStatus,
      paymentMethod,
      bookingId: fulfillBookingId,
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
            {isOpenTariff
              ? "Ochiq (VIP) sessiya cheksiz davom etadi — bron borligi sabab boshlab bo'lmaydi."
              : `Hozirdan atigi ${formatGap(availableMinutes)} bo'sh. Shu vaqtga sig'adigan qisqaroq tarif/davomiylik tanlang.`}
          </div>
        ) : nextBooking ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200">
            ⏳ Keyingi bron: {nextBooking.startTime}{nextBooking.customerName ? ` (${nextBooking.customerName})` : ""} — hozirdan {formatGap(availableMinutes)} bo'sh.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer type</Label>
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
            <Label htmlFor="start-customer-name">Customer name</Label>
            {customerType === "Registered" ? (
              <CustomerSelect branchId={tariffBranchId} value={picked} onChange={handleCustomerPick} />
            ) : (
              <Input id="start-customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-phone">Phone</Label>
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
                placeholder="Phone number"
                disabled={customerType === "Registered" && Boolean(selectedCustomer)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tariff / package</Label>
            <Select value={selectedTariff?.id ?? ""} onValueChange={handleTariffChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {zoneTariffs.map((item) => <SelectItem key={item.id} value={item.id}>{formatTariffOptionLabel(item)}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedTariff ? (
              isOpenTariff ? (
                <p className="text-xs font-semibold text-amber-300">
                  Soatlik (VIP): {money(hourlyRate)}/soat — vaqt bo'yicha, to'xtatishda hisoblanadi
                </p>
              ) : selectedTariff.isHappyHour ? (
                <p className="text-xs font-semibold text-emerald-300">
                  Bugun to'lov: <span className="line-through text-slate-500">{money(selectedTariff.weekdayPrice ?? selectedTariff.price)}</span>{" "}
                  {money(selectedTariff.price)} <span className="text-emerald-400">({tariffPricePeriodLabel(selectedTariff)})</span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-slate-500">
                  Bugun to'lov: {money(selectedTariff.price)}
                  {` (${tariffPricePeriodLabel(selectedTariff)})`}
                </p>
              )
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            {isOpenTariff ? (
              <div className="flex h-10 items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 text-sm font-semibold text-amber-200">
                Ochiq — vaqt yuqoriga sanaladi
              </div>
            ) : (
              <Select value={duration} onValueChange={handleDurationChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {durationOptions.map((minutes) => <SelectItem key={minutes} value={String(minutes)} disabled={minutes > availableMinutes}>{minutes} min{minutes > availableMinutes ? " (bron)" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment mode</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as "paid" | "unpaid")} disabled={isOpenTariff}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {startOptions.paymentModes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
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
            {isOpenTariff ? (
              <>
                <div className="mt-2 text-2xl font-black text-amber-200">{money(hourlyRate)}/soat</div>
                <div className="mt-1 text-xs font-semibold text-slate-400">To'lov to'xtatishda hisoblanadi</div>
              </>
            ) : (
              <>
                <div className="mt-2 text-2xl font-black text-sky-200">{money(totalAmount)}</div>
                {selectedTariff?.bonus ? <div className="mt-1 text-xs font-semibold text-emerald-300">Bonus: {selectedTariff.bonus}</div> : null}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <div className="mr-auto rounded-xl bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">{summary}</div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || bookingBlocks}>Start session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
