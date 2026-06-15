"use client";

import { useMemo, useRef, useState } from "react";
import { FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiPlus, FiUserPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";
import { useBackendTariffs } from "@/lib/use-backend-tariffs";
import { searchCustomers, createCustomer, type CustomerLite } from "@/lib/customers-api";
import { Booking } from "@/types/booking";

type BookingFormState = Omit<Booking, "id" | "status">;

const emptyForm: BookingFormState = {
  customerName: "",
  phone: "",
  simulatorType: "Standard",
  simulatorId: "",
  date: toIsoDate(new Date()),
  startTime: "16:00",
  endTime: "17:00",
  tariff: "",
  prepayment: 0,
  note: "",
};

const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function formatNumber(value: string | number) {
  return String(value).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function normalizeUzPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("998")) return digits.slice(0, 12);
  if (digits.length === 9) digits = `998${digits}`;
  return digits.slice(0, 12);
}

function localPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
}

function formatUzPhone(value: string) {
  const digits = normalizeUzPhone(value);
  if (!digits || !digits.startsWith("998")) return "";
  const local = digits.slice(3);
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return `+998${parts.length ? ` ${parts.join(" ")}` : ""}`;
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : "Sana tanlang";
}

function DatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [viewDate, setViewDate] = useState(() => dateFromIso(value));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstOffset + days }, (_, index) => (index < firstOffset ? null : index - firstOffset + 1));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10 w-full justify-between px-3">
          {displayDate(value)} <FiCalendar className="text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <Button type="button" size="icon" variant="secondary" onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><FiChevronLeft /></Button>
          <div className="font-black">{monthNames[month]} {year}</div>
          <Button type="button" size="icon" variant="secondary" onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><FiChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">{weekDays.map((day) => <div key={day}>{day}</div>)}</div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            const iso = day ? toIsoDate(new Date(year, month, day)) : "";
            return <button key={`${day ?? "empty"}-${index}`} type="button" disabled={!day} onClick={() => day && onChange(iso)} className={`h-9 rounded-lg text-sm font-bold disabled:opacity-0 ${iso === value ? "bg-sky-500 text-slate-950" : "hover:bg-slate-800"}`}>{day}</button>;
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function hasConflict(bookings: Booking[], form: BookingFormState, editingId?: string) {
  if (!form.simulatorId || !form.date || !form.startTime || !form.endTime) return false;
  const start = minutes(form.startTime);
  const end = minutes(form.endTime);
  if (end <= start) return true;
  return bookings.some((booking) => booking.id !== editingId && booking.status !== "Cancelled" && booking.simulatorId === form.simulatorId && booking.date === form.date && start < minutes(booking.endTime) && end > minutes(booking.startTime));
}

export function BookingForm({ booking, onSaved }: { booking?: Booking | null; onSaved?: () => void }) {
  const { addBooking, bookings, simulators, updateBooking, selectedBranchId } = useDashboardStore();
  const tariffs = useBackendTariffs(selectedBranchId === "all" ? undefined : selectedBranchId);
  const [form, setForm] = useState<BookingFormState>(() => booking ? {
    customerName: booking.customerName,
    phone: booking.phone,
    simulatorType: booking.simulatorType,
    simulatorId: booking.simulatorId,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    tariff: booking.tariff,
    prepayment: booking.prepayment,
    note: booking.note,
  } : emptyForm);
  const simulatorsByType = useMemo(() => simulators.filter((item) => item.zone === form.simulatorType), [form.simulatorType, simulators]);
  // Show every tariff in booking, regardless of the simulator zone.
  const tariffsByType = tariffs;
  const conflict = hasConflict(bookings, form, booking?.id);
  const selectedTariff = tariffsByType.find((item) => item.name === form.tariff);
  const phoneValid = normalizeUzPhone(form.phone).length === 12;
  const submitLabel = booking ? "Save booking" : "Create booking";

  // Mijoz qidirish (search-first): mavjud mijozni tanlash yoki yangisini yaratish.
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(booking?.customerId ?? null);
  const [customerResults, setCustomerResults] = useState<CustomerLite[]>([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef<number | null>(null);
  const blurTimer = useRef<number | null>(null);

  async function runCustomerSearch(query: string) {
    setSearchingCustomers(true);
    try {
      setCustomerResults(await searchCustomers(query, selectedBranchId));
    } catch {
      setCustomerResults([]);
    } finally {
      setSearchingCustomers(false);
    }
  }

  function handleCustomerNameChange(value: string) {
    setForm((item) => ({ ...item, customerName: value }));
    setLinkedCustomerId(null);
    setCustomerOpen(true);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => void runCustomerSearch(value), 250);
  }

  function selectCustomer(customer: CustomerLite) {
    setForm((item) => ({ ...item, customerName: customer.name, phone: normalizeUzPhone(customer.phone) }));
    setLinkedCustomerId(customer.id);
    setCustomerOpen(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict || submitting) return;
    setSubmitting(true);
    try {
      let customerId = linkedCustomerId ?? undefined;
      // Mavjud mijoz tanlanmagan bo'lsa — yangi mijoz yaratamiz va bronni unga bog'laymiz.
      if (!booking && !customerId) {
        const simulator = simulators.find((item) => item.id === form.simulatorId);
        const branchForCustomer = simulator?.branchId ?? (selectedBranchId !== "all" ? selectedBranchId : undefined);
        if (branchForCustomer) {
          try {
            const created = await createCustomer({ name: form.customerName.trim(), phone: normalizeUzPhone(form.phone), branchId: branchForCustomer });
            customerId = created.id;
          } catch {
            // Mijoz yaratilmasa ham bron ad-hoc nom/telefon bilan davom etadi.
          }
        }
      }
      const payload = { ...form, phone: normalizeUzPhone(form.phone), customerId };
      if (booking) {
        updateBooking({ ...payload, id: booking.id, status: booking.status });
      } else {
        addBooking({ ...payload, id: crypto.randomUUID(), status: "Confirmed" });
        setForm(emptyForm);
        setLinkedCustomerId(null);
        setCustomerResults([]);
      }
      onSaved?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
        <form onSubmit={submit} className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer name</Label>
            <div className="relative">
              <Input
                value={form.customerName}
                autoComplete="off"
                onChange={(event) => handleCustomerNameChange(event.target.value)}
                onFocus={() => { setCustomerOpen(true); if (!customerResults.length) void runCustomerSearch(form.customerName); }}
                onBlur={() => { blurTimer.current = window.setTimeout(() => setCustomerOpen(false), 150); }}
                placeholder="Mijoz ismi — qidiring yoki yangi qo'shing"
              />
              {customerOpen ? (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl shadow-black/40 thin-scrollbar"
                  onMouseDown={(event) => { event.preventDefault(); if (blurTimer.current) window.clearTimeout(blurTimer.current); }}
                >
                  {searchingCustomers ? <div className="px-3 py-2 text-sm text-slate-400">Qidirilmoqda...</div> : null}
                  {!searchingCustomers && customerResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-800"
                    >
                      <span className="min-w-0 truncate font-semibold text-white">{customer.name || "Ismsiz mijoz"}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatUzPhone(customer.phone)}</span>
                    </button>
                  ))}
                  {!searchingCustomers && !customerResults.length && form.customerName.trim() ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-sky-300"><FiUserPlus className="shrink-0" /> Topilmadi — yangi mijoz sifatida yaratiladi.</div>
                  ) : null}
                  {!searchingCustomers && !form.customerName.trim() ? (
                    <div className="px-3 py-2 text-sm text-slate-500">Ism yoki telefon bo'yicha qidiring.</div>
                  ) : null}
                </div>
              ) : null}
            </div>
            {linkedCustomerId ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-300"><FiCheck className="shrink-0" /> Mavjud mijoz tanlandi</div>
            ) : form.customerName.trim() ? (
              <div className="flex items-center gap-1.5 text-xs text-sky-300"><FiUserPlus className="shrink-0" /> Yangi mijoz sifatida saqlanadi</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="grid grid-cols-[84px,1fr] gap-2">
              <div className="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-slate-300">+998</div>
              <Input inputMode="numeric" maxLength={9} value={localPhone(form.phone)} onChange={(event) => {
                const local = event.target.value.replace(/\D/g, "").slice(0, 9);
                setForm((item) => ({ ...item, phone: local ? `998${local}` : "" }));
              }} placeholder="901112233" />
            </div>
            <div className="text-xs text-slate-500">Ko'rinishi: {form.phone ? formatUzPhone(form.phone) : "+998 XX XXX XX XX"}</div>
          </div>
          <div className="space-y-2"><Label>Simulator type</Label><Select value={form.simulatorType} onValueChange={(simulatorType) => setForm((item) => ({ ...item, simulatorType, simulatorId: "", tariff: "" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Standard">Logitech (Main)</SelectItem><SelectItem value="VIP">Moza (Premium)</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Exact simulator</Label><Select value={form.simulatorId} onValueChange={(simulatorId) => setForm((item) => ({ ...item, simulatorId }))}><SelectTrigger><SelectValue placeholder="Simulator tanlang" /></SelectTrigger><SelectContent>{simulatorsByType.map((simulator) => <SelectItem key={simulator.id} value={simulator.id}>{simulator.branchName} - {simulator.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Date</Label><DatePicker value={form.date} onChange={(date) => setForm((item) => ({ ...item, date }))} /></div>
          <div className="space-y-2"><Label>Start time</Label><Input type="time" value={form.startTime} onChange={(event) => setForm((item) => ({ ...item, startTime: event.target.value }))} /></div>
          <div className="space-y-2"><Label>End time</Label><Input type="time" value={form.endTime} onChange={(event) => setForm((item) => ({ ...item, endTime: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Tariff</Label><Select value={form.tariff} onValueChange={(tariff) => setForm((item) => ({ ...item, tariff }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tariffsByType.map((tariff) => <SelectItem key={tariff.id} value={tariff.name}>{tariff.name} - {money(tariff.price)}{tariff.bonus ? ` + ${tariff.bonus}` : ""}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Prepayment</Label><Input inputMode="numeric" value={formatNumber(form.prepayment)} onChange={(event) => setForm((item) => ({ ...item, prepayment: Number(event.target.value.replace(/\D/g, "")) }))} placeholder="20 000" /></div>
          <div className="space-y-2"><Label>Note</Label><Input value={form.note} onChange={(event) => setForm((item) => ({ ...item, note: event.target.value }))} placeholder="Izoh" /></div>
          <div className={`rounded-xl border p-3 text-sm lg:col-span-2 ${conflict ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>
            {conflict ? "Conflict: tanlangan simulator shu vaqtda band yoki vaqt oralig'i noto'g'ri." : `Conflict yo'q. ${selectedTariff ? `Tariff: ${money(selectedTariff.price)}.` : ""}`}
          </div>
          <Button className="lg:col-span-2" type="submit" disabled={!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict || submitting}><FiPlus /> {submitting ? "Saqlanmoqda..." : submitLabel}</Button>
        </form>
  );
}
