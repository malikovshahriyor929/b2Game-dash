"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { tariffs } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { Booking } from "@/types/booking";

type BookingFormState = Omit<Booking, "id" | "status">;

const emptyForm: BookingFormState = {
  customerName: "",
  phone: "",
  simulatorType: "Main",
  simulatorId: "",
  date: "2026-06-03",
  startTime: "16:00",
  endTime: "17:00",
  tariff: "Main 60 min",
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
  const { addBooking, bookings, simulators, updateBooking } = useDashboardStore();
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
  const conflict = hasConflict(bookings, form, booking?.id);
  const selectedTariff = tariffs.find((item) => item.name === form.tariff);
  const phoneValid = normalizeUzPhone(form.phone).length === 12;
  const submitLabel = booking ? "Save booking" : "Create booking";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict) return;
    const payload = { ...form, phone: normalizeUzPhone(form.phone) };
    if (booking) {
      updateBooking({ ...payload, id: booking.id, status: booking.status });
    } else {
      addBooking({ ...payload, id: crypto.randomUUID(), status: "Confirmed" });
      setForm(emptyForm);
    }
    onSaved?.();
  }

  return (
        <form onSubmit={submit} className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2"><Label>Customer name</Label><Input value={form.customerName} onChange={(event) => setForm((item) => ({ ...item, customerName: event.target.value }))} placeholder="Mijoz ismi" /></div>
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
          <div className="space-y-2"><Label>Simulator type</Label><Select value={form.simulatorType} onValueChange={(simulatorType) => setForm((item) => ({ ...item, simulatorType, simulatorId: "" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Main">Main</SelectItem><SelectItem value="VIP">VIP</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Exact simulator</Label><Select value={form.simulatorId} onValueChange={(simulatorId) => setForm((item) => ({ ...item, simulatorId }))}><SelectTrigger><SelectValue placeholder="Simulator tanlang" /></SelectTrigger><SelectContent>{simulatorsByType.map((simulator) => <SelectItem key={simulator.id} value={simulator.id}>{simulator.branchName} - {simulator.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Date</Label><DatePicker value={form.date} onChange={(date) => setForm((item) => ({ ...item, date }))} /></div>
          <div className="space-y-2"><Label>Start time</Label><Input type="time" value={form.startTime} onChange={(event) => setForm((item) => ({ ...item, startTime: event.target.value }))} /></div>
          <div className="space-y-2"><Label>End time</Label><Input type="time" value={form.endTime} onChange={(event) => setForm((item) => ({ ...item, endTime: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Tariff</Label><Select value={form.tariff} onValueChange={(tariff) => setForm((item) => ({ ...item, tariff }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tariffs.map((tariff) => <SelectItem key={tariff.id} value={tariff.name}>{tariff.name} - {money(tariff.price)}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Prepayment</Label><Input inputMode="numeric" value={formatNumber(form.prepayment)} onChange={(event) => setForm((item) => ({ ...item, prepayment: Number(event.target.value.replace(/\D/g, "")) }))} placeholder="20 000" /></div>
          <div className="space-y-2"><Label>Note</Label><Input value={form.note} onChange={(event) => setForm((item) => ({ ...item, note: event.target.value }))} placeholder="Izoh" /></div>
          <div className={`rounded-xl border p-3 text-sm lg:col-span-2 ${conflict ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>
            {conflict ? "Conflict: tanlangan simulator shu vaqtda band yoki vaqt oralig'i noto'g'ri." : `Conflict yo'q. ${selectedTariff ? `Tariff: ${money(selectedTariff.price)}.` : ""}`}
          </div>
          <Button className="lg:col-span-2" type="submit" disabled={!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict}><FiPlus /> {submitLabel}</Button>
        </form>
  );
}
