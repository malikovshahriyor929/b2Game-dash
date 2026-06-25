"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerSelect, SelectedCustomer } from "@/components/shared/customer-select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Booking } from "@/types/booking";

type BookingFormState = Omit<Booking, "id" | "status" | "endTime" | "startAt" | "endAt" | "tariff" | "prepayment">;

const emptyForm: BookingFormState = {
  customerName: "",
  phone: "",
  simulatorType: "VIP",
  simulatorId: "",
  date: toIsoDate(new Date()),
  startTime: "16:00",
  note: "",
};

const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function normalizeUzPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("998")) return digits.slice(0, 12);
  if (digits.length === 9) digits = `998${digits}`;
  return digits.slice(0, 12);
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

function TimePicker24({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [hh = "00", mm = "00"] = value.split(":");
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
  const minuteList = minuteOptions.includes(mm) ? minuteOptions : [...minuteOptions, mm].sort();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={hh} onValueChange={(hour) => onChange(`${hour}:${mm}`)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-60">{hours.map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={mm} onValueChange={(minute) => onChange(`${hh}:${minute}`)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-60">{minuteList.map((minute) => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function addMinutesToTime(start: string, mins: number) {
  const total = (minutes(start) + mins) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const TERMINAL_STATUSES: Booking["status"][] = ["Cancelled", "No-show", "Completed"];

function hasConflict(bookings: Booking[], form: BookingFormState, endTime: string, editingId?: string) {
  if (!form.simulatorId || !form.date || !form.startTime || !endTime) return false;
  const start = minutes(form.startTime);
  const end = minutes(endTime);
  if (end <= start) return false; 
  return bookings.some((booking) => booking.id !== editingId && !TERMINAL_STATUSES.includes(booking.status) && booking.simulatorId === form.simulatorId && booking.date === form.date && start < minutes(booking.endTime) && end > minutes(booking.startTime));
}

export function BookingForm({ booking, onSaved }: { booking?: Booking | null; onSaved?: () => void }) {
  const { addBooking, bookings, simulators, updateBooking, selectedBranchId } = useDashboardStore();
  const [form, setForm] = useState<BookingFormState>(() => booking ? {
    customerName: booking.customerName,
    phone: booking.phone,
    customerId: booking.customerId,
    simulatorType: booking.simulatorType,
    simulatorId: booking.simulatorId,
    date: booking.date,
    startTime: booking.startTime,
    note: booking.note,
  } : emptyForm);
  const simulatorsByType = useMemo(() => simulators.filter((item) => item.zone === form.simulatorType), [form.simulatorType, simulators]);
  // Mijoz qidiruvi/qo'shilishi shu bron qaysi filialga tegishli bo'lsa o'sha bo'yicha.
  const customerBranchId = useMemo(
    () => simulators.find((item) => item.id === form.simulatorId)?.branchId ?? (selectedBranchId !== "all" ? selectedBranchId : undefined),
    [simulators, form.simulatorId, selectedBranchId],
  );
  const selectedCustomer: SelectedCustomer | null = form.customerName ? { id: form.customerId, name: form.customerName, phone: form.phone } : null;

  function handleCustomerChange(customer: SelectedCustomer | null) {
    setForm((item) => ({ ...item, customerId: customer?.id, customerName: customer?.name ?? "", phone: customer?.phone ?? "" }));
  }
  const endTime = addMinutesToTime(form.startTime, 60);
  const conflict = hasConflict(bookings, form, endTime, booking?.id);
  const phoneValid = normalizeUzPhone(form.phone).length === 12;
  const submitLabel = booking ? "Bronni saqlash" : "Bron yaratish";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict) return;
    const payload = { ...form, endTime, tariff: "", prepayment: 0, phone: normalizeUzPhone(form.phone) };
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
          <div className="space-y-2 lg:col-span-2">
            <Label>Mijoz</Label>
            <CustomerSelect branchId={customerBranchId} value={selectedCustomer} onChange={handleCustomerChange} />
            <div className="text-xs text-slate-500">
              {form.phone ? `Telefon: ${formatUzPhone(form.phone)}` : "Ro'yxatdan mijoz tanlang yoki yangi mijoz qo'shing"}
            </div>
          </div>
          <div className="space-y-2"><Label>Simulyator turi</Label><Select value={form.simulatorType} onValueChange={(simulatorType) => setForm((item) => ({ ...item, simulatorType, simulatorId: "" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VIP">Moza (Premium)</SelectItem><SelectItem value="Standard">Logitech (Main)</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Aniq simulyator</Label><Select value={form.simulatorId} onValueChange={(simulatorId) => setForm((item) => ({ ...item, simulatorId }))}><SelectTrigger><SelectValue placeholder="Simulyator tanlang" /></SelectTrigger><SelectContent>{simulatorsByType.map((simulator) => <SelectItem key={simulator.id} value={simulator.id}>{simulator.branchName} - {simulator.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Sana</Label><DatePicker value={form.date} onChange={(date) => setForm((item) => ({ ...item, date }))} /></div>
          <div className="space-y-2"><Label>Boshlanish vaqti</Label><TimePicker24 value={form.startTime} onChange={(startTime) => setForm((item) => ({ ...item, startTime }))} /></div>
          <div className="space-y-2"><Label>Tugash vaqti (avto +1 soat)</Label><div className="flex h-10 items-center rounded-xl border border-slate-700 bg-slate-950/40 px-3 text-sm font-semibold text-slate-300">{form.startTime} – {endTime}</div></div>
          <div className="space-y-2 lg:col-span-2"><Label>Izoh</Label><Input value={form.note} onChange={(event) => setForm((item) => ({ ...item, note: event.target.value }))} placeholder="Izoh" /></div>
          {conflict ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-semibold text-red-200 lg:col-span-2">
              Bu simulyator shu vaqt oralig'ida band. Boshqa vaqt yoki simulyator tanlang.
            </div>
          ) : null}
          <Button className="lg:col-span-2" type="submit" disabled={!form.customerName.trim() || !phoneValid || !form.simulatorId || conflict}><FiPlus /> {submitLabel}</Button>
        </form>
  );
}
