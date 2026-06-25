"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCreditCard, FiEdit2, FiEye, FiInfo, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { PageHeader } from "@/components/shared/page-header";
import { money } from "@/lib/format";
import { backendDelete, backendGet, backendPatch, backendPost } from "@/server/api";

type CustomerStatus = "Active" | "Debt" | "Blocked";

const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  Active: "Faol",
  Debt: "Qarzdor",
  Blocked: "Bloklangan",
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  lastVisit: string;
  totalSpent: number;
  sessions: number;
  status: CustomerStatus;
  email?: string;
  note?: string;
};

type CustomerSessionRow = {
  id: string;
  simulator_id?: string | null;
  status?: string | null;
  duration_minutes?: number | string | null;
  total_amount?: number | string | null;
  started_at?: string | null;
  created_at?: string | null;
};

type CustomerSaleRow = {
  id: string;
  total?: number | string | null;
  payment_status?: string | null;
  created_at?: string | null;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  lastVisit: toIsoDate(new Date()),
  totalSpent: "",
  sessions: "",
  status: "Active" as CustomerStatus,
  note: "",
};

function toStatus(value: unknown): CustomerStatus {
  const status = String(value ?? "active").toLowerCase();
  if (status === "debt") return "Debt";
  if (status === "blocked") return "Blocked";
  return "Active";
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    balance: Number(row.balance ?? 0),
    lastVisit: row.last_visit_at ? String(row.last_visit_at).slice(0, 10) : "",
    totalSpent: Number(row.total_spent ?? 0),
    sessions: Number(row.sessions_count ?? 0),
    status: toStatus(row.status),
    email: "",
    note: "",
  };
}

function customerBody(customer: Customer, branchId: string) {
  return {
    branch_id: branchId,
    name: customer.name,
    phone: customer.phone,
    total_spent: customer.totalSpent,
    sessions_count: customer.sessions,
    last_visit_at: customer.lastVisit ? new Date(`${customer.lastVisit}T00:00:00`).toISOString() : null,
    status: customer.status.toLowerCase(),
  };
}

function formatNumber(value: string) {
  return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

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
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return `+998${parts.length ? ` ${parts.join(" ")}` : ""}`;
}

function uzLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
}

function statusVariant(status: CustomerStatus) {
  if (status === "Debt") return "destructive";
  if (status === "Blocked") return "warning";
  return "success";
}

const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  if (!value) return "Sana tanlang";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function dateFromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function FieldLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" tabIndex={-1} aria-label={`${label} haqida ma'lumot`} className="text-slate-500 transition hover:text-slate-300">
            <FiInfo className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[230px] leading-snug">{hint}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function DatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [viewDate, setViewDate] = useState(() => dateFromIso(value));
  const selected = value ? dateFromIso(value) : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstOffset + daysInMonth }, (_, index) => (index < firstOffset ? null : index - firstOffset + 1));

  function moveMonth(offset: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10 w-full justify-between px-3 font-semibold">
          <span>{formatDisplayDate(value)}</span>
          <FiCalendar className="text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <Button type="button" size="icon" variant="secondary" onClick={() => moveMonth(-1)}><FiChevronLeft /></Button>
          <div className="text-sm font-black text-white">{monthNames[month]} {year}</div>
          <Button type="button" size="icon" variant="secondary" onClick={() => moveMonth(1)}><FiChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
          {weekDays.map((day) => <div key={day} className="py-1">{day}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            const currentIso = day ? toIsoDate(new Date(year, month, day)) : "";
            const isSelected = Boolean(selected && currentIso === value);
            const isToday = currentIso === toIsoDate(new Date());
            return (
              <button
                key={`${day ?? "empty"}-${index}`}
                type="button"
                disabled={!day}
                onClick={() => day && onChange(currentIso)}
                className={`h-9 rounded-lg text-sm font-semibold transition disabled:opacity-0 ${isSelected ? "bg-sky-500 text-slate-950" : isToday ? "border border-sky-500/50 text-sky-200" : "text-slate-200 hover:bg-slate-800"}`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <Button type="button" variant="secondary" className="mt-3 w-full" onClick={() => {
          const today = new Date();
          setViewDate(today);
          onChange(toIsoDate(today));
        }}>
          Bugun
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [branchId, setBranchId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<CustomerSessionRow[]>([]);
  const [selectedSales, setSelectedSales] = useState<CustomerSaleRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [topUpFor, setTopUpFor] = useState<Customer | null>(null);
  const [topUpForm, setTopUpForm] = useState({ amount: "", method: "cash" });
  const [topUpBusy, setTopUpBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("5");
  const isSuperAdmin = session?.user?.role === "super_admin";

  async function refreshCustomers() {
    try {
      const [branchRows, rows] = await Promise.all([
        backendGet<Array<Record<string, unknown>>>("/branches"),
        backendGet<Array<Record<string, unknown>>>("/customers?branch_id=all"),
      ]);
      setBranchId((current) => current || String(branchRows[0]?.id ?? ""));
      const next = rows.map(mapCustomer);
      setCustomers(next);
      setSelectedCustomer((current) => (current ? next.find((item) => item.id === current.id) ?? next[0] ?? null : next[0] ?? null));
    } finally {
      setLoadingCustomers(false);
    }
  }

  useEffect(() => {
    void refreshCustomers().catch(() => undefined);
  }, []);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter((item) => item.status === "Active").length,
    debt: customers.filter((item) => item.status === "Debt").length,
    balance: customers.reduce((sum, item) => sum + item.balance, 0),
  }), [customers]);

  const visible = useMemo(() => customers.filter((customer) => {
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const text = `${customer.name} ${customer.phone} ${customer.email ?? ""} ${customer.status}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }), [customers, query, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(visible.length / Number(pageSize)));
  const currentPage = Math.min(page, totalPages);
  const paginated = visible.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateStatus(value: "all" | CustomerStatus) {
    setStatusFilter(value);
    setPage(1);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setCustomerModalOpen(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setCustomerModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      lastVisit: customer.lastVisit,
      totalSpent: String(customer.totalSpent),
      sessions: String(customer.sessions),
      status: customer.status,
      note: customer.note ?? "",
    });
    setCustomerModalOpen(true);
  }

  async function loadCustomerActivity(customerId: string) {
    const [sessions, sales] = await Promise.all([
      backendGet<CustomerSessionRow[]>(`/customers/${customerId}/sessions`),
      backendGet<CustomerSaleRow[]>(`/customers/${customerId}/sales`),
    ]);
    setSelectedSessions(sessions);
    setSelectedSales(sales);
  }

  function openProfile(customer: Customer) {
    setSelectedCustomer(customer);
    setSelectedSessions([]);
    setSelectedSales([]);
    setProfileModalOpen(true);
    void loadCustomerActivity(customer.id).catch(() => undefined);
  }

  function submitCustomer(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizeUzPhone(form.phone);
    if (!branchId || !form.name.trim() || phone.length !== 12 || !phone.startsWith("998")) return;
    const existing = editingId ? customers.find((item) => item.id === editingId) : null;
    const payload: Customer = {
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      phone,
      email: form.email.trim(),
      balance: existing?.balance ?? 0,
      lastVisit: form.lastVisit || toIsoDate(new Date()),
      totalSpent: isSuperAdmin ? Number(form.totalSpent || 0) : existing?.totalSpent ?? 0,
      sessions: Number(form.sessions || 0),
      status: form.status,
      note: form.note.trim(),
    };

    if (editingId) {
      void backendPatch(`/customers/${editingId}`, customerBody(payload, branchId)).then(refreshCustomers).catch(() => undefined);
    } else {
      void backendPost("/customers", customerBody(payload, branchId)).then(refreshCustomers).catch(() => undefined);
    }
    setCustomers((items) => (editingId ? items.map((item) => (item.id === editingId ? payload : item)) : [payload, ...items]));
    setSelectedCustomer(payload);
    resetForm();
  }

  async function removeCustomer(customer: Customer, closeProfile = false) {
    const ok = await confirm({
      title: "Mijoz o'chirilsinmi?",
      description: `${customer.name} o'chiriladi. Bu amalni qaytarib bo'lmaydi.`,
      confirmLabel: "O'chirish",
      tone: "destructive",
    });
    if (!ok) return;
    void backendDelete(`/customers/${customer.id}`).then(refreshCustomers).catch(() => undefined);
    setCustomers((items) => items.filter((item) => item.id !== customer.id));
    if (selectedCustomer?.id === customer.id) setSelectedCustomer(null);
    if (closeProfile) setProfileModalOpen(false);
  }

  function openTopUp(customer: Customer) {
    setTopUpFor(customer);
    setTopUpForm({ amount: "", method: "cash" });
  }

  async function submitTopUp(event: React.FormEvent) {
    event.preventDefault();
    if (!topUpFor) return;
    const amount = Number(topUpForm.amount || 0);
    if (amount <= 0) {
      toast.error("Summani kiriting");
      return;
    }
    setTopUpBusy(true);
    try {
      await backendPost(`/customers/${topUpFor.id}/topup`, { amount, method: topUpForm.method });
      toast.success(`Balans to'ldirildi: ${money(amount)}`);
      setTopUpFor(null);
      await refreshCustomers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Balansni to'ldirib bo'lmadi");
    } finally {
      setTopUpBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Mijozlar" description="Mijoz profili, balans, sarflangan summa va tashriflar tarixi." />
        <Button onClick={openCreate}><FiPlus /> Mijoz qo'shish</Button>
      </div>

      {loadingCustomers ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Jami mijozlar</div><div className="mt-2 text-3xl font-black text-white">{stats.total}</div></Card>
          <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Faol</div><div className="mt-2 text-3xl font-black text-emerald-200">{stats.active}</div></Card>
          <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Qarzdor</div><div className="mt-2 text-3xl font-black text-red-200">{stats.debt}</div></Card>
          <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Balans jami</div><div className="mt-2 text-2xl font-black text-sky-200">{money(stats.balance)}</div></Card>
        </div>
      )}

      <Card className="p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Ism, telefon, email bo'yicha qidirish..." />
          </div>
          <Select value={statusFilter} onValueChange={(value) => updateStatus(value as typeof statusFilter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="Active">{CUSTOMER_STATUS_LABELS["Active"]}</SelectItem>
              <SelectItem value="Debt">{CUSTOMER_STATUS_LABELS["Debt"]}</SelectItem>
              <SelectItem value="Blocked">{CUSTOMER_STATUS_LABELS["Blocked"]}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loadingCustomers ? (
        <TableSkeleton rows={8} cols={8} />
      ) : (
      <Table className="min-w-[940px]">
        <TableHeader>
          <TableRow>
            <TableHead>Ism</TableHead>
            <TableHead>Balans</TableHead>
            <TableHead>Oxirgi tashrif</TableHead>
            <TableHead>Jami sarflangan</TableHead>
            <TableHead>Sessiyalar</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <button className="text-left" onClick={() => openProfile(customer)}>
                  <div className="font-semibold text-white">{customer.name}</div>
                  <div className="text-xs text-slate-500">{formatUzPhone(customer.phone)}</div>
                </button>
              </TableCell>
              <TableCell>{money(customer.balance)}</TableCell>
              <TableCell>{customer.lastVisit}</TableCell>
              <TableCell>{money(customer.totalSpent)}</TableCell>
              <TableCell>{customer.sessions}</TableCell>
              <TableCell><Badge variant={statusVariant(customer.status)}>{CUSTOMER_STATUS_LABELS[customer.status]}</Badge></TableCell>
              <TableCell>
                <div className="flex justify-end gap-2 whitespace-nowrap">
                  <IconButton tooltip="Balans to'ldirish" variant="secondary" onClick={() => openTopUp(customer)}><FiCreditCard /></IconButton>
                  <IconButton tooltip="Profil" variant="secondary" onClick={() => openProfile(customer)}><FiEye /></IconButton>
                  <IconButton tooltip="Tahrirlash" variant="secondary" onClick={() => openEdit(customer)}><FiEdit2 /></IconButton>
                  <IconButton tooltip="O'chirish" variant="destructive" onClick={() => removeCustomer(customer)}><FiTrash2 /></IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">
          Ko'rsatilmoqda <b className="text-slate-100">{visible.length ? (currentPage - 1) * Number(pageSize) + 1 : 0}</b>
          {" - "}
          <b className="text-slate-100">{Math.min(currentPage * Number(pageSize), visible.length)}</b>
          {" / "}
          <b className="text-slate-100">{visible.length}</b> mijoz
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={pageSize} onValueChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / sahifa</SelectItem>
              <SelectItem value="10">10 / sahifa</SelectItem>
              <SelectItem value="20">20 / sahifa</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="secondary" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><FiChevronLeft /> Oldingi</Button>
          <div className="min-w-20 text-center text-sm font-bold text-slate-300">{currentPage} / {totalPages}</div>
          <Button size="sm" variant="secondary" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Keyingi <FiChevronRight /></Button>
        </div>
      </Card>

      <Dialog open={customerModalOpen} onOpenChange={(open) => (open ? setCustomerModalOpen(true) : resetForm())}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"}</DialogTitle>
            <DialogDescription>Profil, balans va status ma'lumotlarini boshqaring.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCustomer} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label="Ism" hint="Mijozning to'liq ismi. Majburiy maydon." />
              <Input value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} placeholder="Mijoz ismi" />
            </div>
            <div className="space-y-2">
              <FieldLabel label="Telefon" hint="O'zbekiston raqami (+998). Mijozni aniqlash uchun asosiy identifikator. Majburiy." />
              <div className="grid grid-cols-[84px,1fr] gap-2">
                <div className="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-slate-300">+998</div>
                <Input
                  inputMode="numeric"
                  maxLength={9}
                  value={uzLocalDigits(form.phone)}
                  onChange={(event) => {
                    const local = event.target.value.replace(/\D/g, "").slice(0, 9);
                    setForm((item) => ({ ...item, phone: local ? `998${local}` : "" }));
                  }}
                  placeholder="901112233"
                />
              </div>
              <div className="text-xs text-slate-500">Ko'rinishi: {form.phone ? formatUzPhone(form.phone) : "+998 XX XXX XX XX"}</div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel label="Email" hint="Ixtiyoriy. Chek yoki bildirishnoma yuborish uchun ishlatiladi." />
              <Input value={form.email} onChange={(event) => setForm((item) => ({ ...item, email: event.target.value }))} placeholder="customer@example.com" />
            </div>
            <div className="space-y-2">
              <FieldLabel label="Holat" hint="Faol — oddiy mijoz, Qarzdor — qarzi bor, Bloklangan — bloklangan (xizmatdan foydalana olmaydi)." />
              <Select value={form.status} onValueChange={(status) => setForm((item) => ({ ...item, status: status as CustomerStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(["Active", "Debt", "Blocked"] as CustomerStatus[]).map((status) => <SelectItem key={status} value={status}>{CUSTOMER_STATUS_LABELS[status]}</SelectItem>)}</SelectContent></Select>
            </div>
            {editingId ? (
              <>
                <div className="space-y-2">
                  <FieldLabel label="Jami sarflangan" hint="Jami sarflagan summasi. Sessiya va sotuvlardan avtomatik yig'iladi, qo'lda o'zgartirish tavsiya etilmaydi." />
                  <Input
                    inputMode="numeric"
                    value={formatNumber(form.totalSpent)}
                    onChange={(event) => setForm((item) => ({ ...item, totalSpent: event.target.value.replace(/\D/g, "") }))}
                    placeholder="2 350 000"
                    disabled={!isSuperAdmin}
                  />
                  {!isSuperAdmin ? <div className="text-xs text-slate-500">Admin total spentni qo'lda o'zgartira olmaydi.</div> : null}
                </div>
                <div className="space-y-2">
                  <FieldLabel label="Sessiyalar" hint="O'ynagan sessiyalar soni. Har yangi sessiyada avtomatik o'sadi." />
                  <Input inputMode="numeric" value={form.sessions} onChange={(event) => setForm((item) => ({ ...item, sessions: event.target.value.replace(/\D/g, "") }))} placeholder="38" />
                </div>
                <div className="space-y-2">
                  <FieldLabel label="Oxirgi tashrif" hint="Oxirgi tashrif sanasi. Mijoz yangi sessiya boshlaganda avtomatik yangilanadi." />
                  <DatePicker value={form.lastVisit} onChange={(lastVisit) => setForm((item) => ({ ...item, lastVisit }))} />
                </div>
              </>
            ) : null}
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel label="Izoh" hint="Ixtiyoriy izoh (masalan: VIP mijoz, doimiy mijoz, maxsus shartlar)." />
              <Input value={form.note} onChange={(event) => setForm((item) => ({ ...item, note: event.target.value }))} placeholder="Izoh" />
            </div>
            <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={resetForm}>Bekor qilish</Button>
              <Button type="submit" disabled={!branchId || !form.name.trim() || normalizeUzPhone(form.phone).length !== 12 || !normalizeUzPhone(form.phone).startsWith("998")}><FiPlus /> {editingId ? "Saqlash" : "Mijoz yaratish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name ?? "Mijoz"} profili</DialogTitle>
            <DialogDescription>{selectedCustomer ? formatUzPhone(selectedCustomer.phone) : ""} {selectedCustomer?.email ? `- ${selectedCustomer.email}` : ""}</DialogDescription>
          </DialogHeader>
          {selectedCustomer ? (
            <div className="space-y-4">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Balans</div><div className="mt-1 text-xl font-black text-sky-200">{money(selectedCustomer.balance)}</div></Card>
                <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Jami sarflangan</div><div className="mt-1 text-xl font-black text-white">{money(selectedCustomer.totalSpent)}</div></Card>
                <Card className="p-4"><div className="text-xs font-semibold uppercase text-slate-500">Sessiyalar</div><div className="mt-1 text-xl font-black text-white">{selectedCustomer.sessions}</div></Card>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4"><div className="font-bold text-white">Profil</div><div className="mt-2 text-sm text-slate-400">Oxirgi tashrif: {selectedCustomer.lastVisit}<br />Holat: {CUSTOMER_STATUS_LABELS[selectedCustomer.status]}<br />Izoh: {selectedCustomer.note || "-"}</div></Card>
                <Card className="p-4">
                  <div className="font-bold text-white">Sessiyalar tarixi</div>
                  <div className="mt-2 space-y-1 text-sm text-slate-400">
                    {selectedSessions.length ? selectedSessions.slice(0, 4).map((session) => (
                      <div key={session.id}>
                        {session.simulator_id ?? "Simulyator"} - {Number(session.duration_minutes ?? 0)} daqiqa - {money(Number(session.total_amount ?? 0))}
                      </div>
                    )) : "Sessiya ma'lumotlari yo'q"}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="font-bold text-white">Do'kon xaridlari</div>
                  <div className="mt-2 space-y-1 text-sm text-slate-400">
                    {selectedSales.length ? selectedSales.slice(0, 4).map((sale) => (
                      <div key={sale.id}>{money(Number(sale.total ?? 0))} - {sale.payment_status ?? "pending"}</div>
                    )) : "Do'kon savdosi ma'lumotlari yo'q"}
                  </div>
                </Card>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => openTopUp(selectedCustomer)}><FiCreditCard /> Balans to'ldirish</Button>
                <Button variant="secondary" onClick={() => openEdit(selectedCustomer)}><FiEdit2 /> Profilni tahrirlash</Button>
                <Button variant="destructive" onClick={() => removeCustomer(selectedCustomer, true)}><FiTrash2 /> O'chirish</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(topUpFor)} onOpenChange={(open) => (open ? undefined : setTopUpFor(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Balans to'ldirish</DialogTitle>
            <DialogDescription>{topUpFor ? `${topUpFor.name} - joriy balans: ${money(topUpFor.balance)}` : ""}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTopUp} className="space-y-3">
            <div className="space-y-2">
              <FieldLabel label="Summa" hint="To'ldiriladigan summa. Mijoz balansiga qo'shiladi." />
              <Input inputMode="numeric" autoFocus value={formatNumber(topUpForm.amount)} onChange={(event) => setTopUpForm((item) => ({ ...item, amount: event.target.value.replace(/\D/g, "") }))} placeholder="100 000" />
            </div>
            <div className="space-y-2">
              <FieldLabel label="To'lov usuli" hint="Pul qaysi usulda olindi. Naqd kassa hisobiga, karta/QR bankga tushadi." />
              <Select value={topUpForm.method} onValueChange={(method) => setTopUpForm((item) => ({ ...item, method }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Naqd</SelectItem>
                  <SelectItem value="card">Karta</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-slate-500">Eslatma: balans to'ldirish uchun ochiq smena bo'lishi shart.</div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={() => setTopUpFor(null)}>Bekor qilish</Button>
              <Button type="submit" disabled={topUpBusy || Number(topUpForm.amount || 0) <= 0}><FiCreditCard /> {topUpBusy ? "..." : "To'ldirish"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
