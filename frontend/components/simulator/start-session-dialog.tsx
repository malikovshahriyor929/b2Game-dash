"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/ui/skeletons";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { formatTariffOptionLabel, tariffPricePeriodLabel, useBackendTariffs } from "@/lib/use-backend-tariffs";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useStartSessionOptions } from "@/lib/use-start-session-options";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { backendGet } from "@/server/api";
import { Simulator } from "@/types/simulator";

type CustomerRow = {
  id: string;
  name: string;
  phone?: string | null;
  balance?: number | string | null;
  sessions_count?: number | string | null;
};
const customerPageSize = 20;

function normalizeUzPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("998")) return digits.slice(0, 12);
  if (digits.length === 9) digits = `998${digits}`;
  if (digits.startsWith("8") && digits.length === 11) digits = `99${digits}`;
  return digits.slice(0, 12);
}

function formatUzPhone(value: string) {
  const digits = normalizeUzPhone(value);
  if (!digits) return "";
  if (!digits.startsWith("998")) return digits;
  const local = digits.slice(3);
  const area = local.slice(0, 2);
  const prefix = local.slice(2, 5);
  const line = local.slice(5, 9);
  if (!area) return "+998";
  if (!prefix) return `+998 (${area}`;
  return `+998 (${area}) ${prefix}${line ? ` ${line}` : ""}`;
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

export function StartSessionDialog({ open, onOpenChange, simulator, prefill, fulfillBookingId }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; prefill?: { customerName?: string; phone?: string; tariffName?: string; prepayment?: number }; fulfillBookingId?: string }) {
  const { startSession, selectedBranchId, bookings } = useDashboardStore();
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
  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerOffset, setCustomerOffset] = useState(0);
  const [customersHasMore, setCustomersHasMore] = useState(true);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [tariffId, setTariffId] = useState("");
  const [duration, setDuration] = useState("60");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const selectedTariff = zoneTariffs.find((item) => item.id === tariffId) ?? zoneTariffs[0];
  // VIP tariffs (type='vip') open as hourly sessions: no fixed duration, billed at stop.
  const isOpenTariff = (selectedTariff?.type ?? "").toLowerCase() === "vip";
  const hourlyRate = selectedTariff && isOpenTariff ? Math.round((selectedTariff.price * 60) / (selectedTariff.durationMinutes || 60)) : 0;
  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId);
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
    setCustomerQuery("");
    setSelectedCustomerId(null);
    setCustomers([]);
    setCustomerOffset(0);
    setCustomersHasMore(true);
    setCustomerPopoverOpen(false);
    setPhone(prefill?.phone ? normalizeUzPhone(prefill.phone) : "");
    // Brondan kelganda tarifni nomi bo'yicha topib qo'yamiz, aks holda birinchisi.
    const matched = prefill?.tariffName ? zoneTariffs.find((item) => item.name === prefill.tariffName) : undefined;
    const first = matched ?? zoneTariffs[0];
    setTariffId(first?.id ?? "");
    setDuration(String(first?.durationMinutes || 60));
    setPaymentStatus(startOptions.paymentModes[0]?.value ?? "paid");
    setPaymentMethod(paymentMethods[0]?.label ?? "Karta");
  }, [open, paymentMethods, simulator?.id, startOptions.paymentModes, zoneTariffs, prefill?.customerName, prefill?.phone, prefill?.tariffName]);

  // Walk-in / band PC ogohlantirishlari (bloklamaydi — admin xohlasa davom etadi).
  const simulatorBusy = Boolean(simulator && ["busy", "unpaid"].includes(simulator.status));
  const conflictBooking = useMemo(() => {
    if (!simulator) return undefined;
    const startMs = Date.now();
    const durMin = isOpenTariff ? 60 : Number(duration) || 0;
    const endMs = startMs + durMin * 60000;
    return bookings.find((booking) => {
      if (booking.id === fulfillBookingId) return false;
      if (booking.simulatorId !== simulator.id) return false;
      if (!["Pending", "Confirmed", "Arrived"].includes(booking.status)) return false;
      if (!booking.startAt || !booking.endAt) return false;
      const bs = Date.parse(booking.startAt);
      const be = Date.parse(booking.endAt);
      if (!Number.isFinite(bs) || !Number.isFinite(be)) return false;
      return startMs < be && endMs > bs;
    });
  }, [bookings, simulator, duration, isOpenTariff, fulfillBookingId]);

  // Open (VIP) sessions are postpaid — the amount is only known at stop.
  useEffect(() => {
    if (isOpenTariff) setPaymentStatus("unpaid");
  }, [isOpenTariff]);

  const loadCustomers = useCallback(async (reset = false) => {
    if (!open || customerType !== "Registered") return;
    if (loadingCustomers || (!reset && !customersHasMore)) return;
    const offset = reset ? 0 : customerOffset;
    setLoadingCustomers(true);
    const params = new URLSearchParams({
      branch_id: tariffBranchId && tariffBranchId !== "all" ? tariffBranchId : "all",
      limit: String(customerPageSize),
      offset: String(offset),
    });
    const search = customerQuery.trim();
    if (search) params.set("q", search);
    try {
      const rows = await backendGet<CustomerRow[]>(`/customers?${params.toString()}`);
      setCustomers((items) => {
        const next = reset ? [] : [...items];
        const seen = new Set(next.map((item) => item.id));
        for (const row of rows) {
          if (!seen.has(row.id)) next.push(row);
        }
        return next;
      });
      setCustomerOffset(offset + rows.length);
      setCustomersHasMore(rows.length === customerPageSize);
    } catch {
      if (reset) setCustomers([]);
      setCustomersHasMore(false);
    } finally {
      setLoadingCustomers(false);
    }
  }, [customerOffset, customerQuery, customerType, customersHasMore, loadingCustomers, open, tariffBranchId]);

  useEffect(() => {
    if (!open || customerType !== "Registered" || !customerPopoverOpen) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void loadCustomers(true);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [customerPopoverOpen, customerQuery, customerType, open, tariffBranchId]);

  function handleCustomerTypeChange(value: string) {
    const type = value as "Guest" | "Registered";
    setCustomerType(type);
    setSelectedCustomerId(null);
    setCustomerQuery("");
    setCustomers([]);
    setCustomerOffset(0);
    setCustomersHasMore(true);
    setCustomerPopoverOpen(type === "Registered");
    if (type === "Guest") {
      setCustomerName("Guest");
      setPhone("");
    } else {
      setCustomerName("");
      setPhone("");
    }
  }

  function selectCustomer(customer: CustomerRow) {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setPhone(normalizeUzPhone(String(customer.phone ?? "")));
    setCustomerQuery(`${customer.name}${customer.phone ? ` - ${formatUzPhone(String(customer.phone))}` : ""}`);
    setCustomerPopoverOpen(false);
  }

  function handleCustomerScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 24;
    if (nearBottom) void loadCustomers(false);
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

  function submit() {
    if (!canSubmit || !simulator) return;
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
        {conflictBooking ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-200">
            ⚠️ Bu simulyatorda shu vaqt oralig'ida bron bor: {conflictBooking.customerName} ({conflictBooking.startTime}–{conflictBooking.endTime}). Davom etsangiz bron egasiga PC qolmasligi mumkin.
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
              <div className="relative">
                <Input
                  id="start-customer-name"
                  value={customerQuery}
                  onFocus={() => setCustomerPopoverOpen(true)}
                  onChange={(event) => {
                    setCustomerQuery(event.target.value);
                    setSelectedCustomerId(null);
                    setCustomerName("");
                    setPhone("");
                    setCustomers([]);
                    setCustomerOffset(0);
                    setCustomersHasMore(true);
                    setCustomerPopoverOpen(true);
                  }}
                  placeholder="Mijoz ismi yoki telefon..."
                />
                {customerPopoverOpen ? (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] max-h-[min(16rem,42dvh)] min-w-0 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-1 shadow-2xl shadow-black/50 thin-scrollbar"
                    onScroll={handleCustomerScroll}
                  >
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${selectedCustomerId === customer.id ? "bg-sky-500 text-slate-950" : "hover:bg-slate-800"}`}
                        onClick={() => selectCustomer(customer)}
                      >
                        <span className="block truncate font-bold">{customer.name}</span>
                        <span className="block truncate text-xs opacity-75">{customer.phone ? formatUzPhone(String(customer.phone)) : "Telefon yo'q"} · Balans: {money(Number(customer.balance ?? 0))}</span>
                      </button>
                    ))}
                    {loadingCustomers ? <ListSkeleton rows={4} /> : null}
                    {!loadingCustomers && !customers.length ? <div className="px-3 py-2 text-sm font-semibold text-slate-500">Mijoz topilmadi</div> : null}
                    {!loadingCustomers && customers.length > 0 && !customersHasMore ? <div className="px-3 py-2 text-xs font-semibold text-slate-600">Boshqa mijoz yo'q</div> : null}
                  </div>
                ) : null}
              </div>
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
                  {durationOptions.map((minutes) => <SelectItem key={minutes} value={String(minutes)}>{minutes} min</SelectItem>)}
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
          <Button onClick={submit} disabled={!canSubmit}>Start session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
