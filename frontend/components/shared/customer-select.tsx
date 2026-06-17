"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiPlus, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { backendGet, backendPost } from "@/server/api";
import { money } from "@/lib/format";

export type SelectedCustomer = {
  id?: string;
  name: string;
  phone: string;
  balance?: number;
};

type CustomerRow = {
  id: string;
  name: string;
  phone?: string | null;
  balance?: number | string | null;
};

const pageSize = 20;

function normalizeUzPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("998")) return digits.slice(0, 12);
  if (digits.length === 9) digits = `998${digits}`;
  return digits.slice(0, 12);
}

function localPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
}

export function formatUzPhone(value: string) {
  const digits = normalizeUzPhone(value);
  if (!digits || !digits.startsWith("998")) return value || "";
  const local = digits.slice(3);
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return `+998${parts.length ? ` ${parts.join(" ")}` : ""}`;
}

/**
 * Filial bo'yicha mijoz tanlash (select2 uslubida). Mijoz topilmasa, joyida
 * "Yangi mijoz qo'shish" oynasi orqali qo'shib, o'sha mijozni tanlab qo'yadi.
 * branchId — qidiruv va yangi mijoz qaysi filialga qo'shilishini belgilaydi
 * ("all"/bo'sh bo'lsa qidiruv barcha filialdan, qo'shishda filial tanlanadi).
 */
export function CustomerSelect({
  branchId,
  value,
  onChange,
  allowCreate = true,
  placeholder = "Mijozni tanlang yoki qidiring...",
}: {
  branchId?: string;
  value: SelectedCustomer | null;
  onChange: (customer: SelectedCustomer | null) => void;
  allowCreate?: boolean;
  placeholder?: string;
}) {
  const { branches } = useDashboardStore();
  const scopedBranch = branchId && branchId !== "all" ? branchId : "all";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    async (reset: boolean) => {
      if (loading) return;
      const nextOffset = reset ? 0 : offset;
      setLoading(true);
      const params = new URLSearchParams({ branch_id: scopedBranch, limit: String(pageSize), offset: String(nextOffset) });
      const search = query.trim();
      if (search) params.set("q", search);
      try {
        const rows = await backendGet<CustomerRow[]>(`/customers?${params.toString()}`);
        setCustomers((items) => {
          const base = reset ? [] : [...items];
          const seen = new Set(base.map((item) => item.id));
          for (const row of rows) if (!seen.has(row.id)) base.push(row);
          return base;
        });
        setOffset(nextOffset + rows.length);
        setHasMore(rows.length === pageSize);
      } catch {
        if (reset) setCustomers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, offset, query, scopedBranch],
  );

  // Ochilganda yoki qidiruv/filial o'zgarganda — debounce bilan qaytadan yuklaymiz.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void load(true);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, scopedBranch]);

  // Tashqariga bosilganda yopamiz.
  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24 && hasMore && !loading) void load(false);
  }

  function select(row: CustomerRow) {
    onChange({ id: row.id, name: row.name, phone: normalizeUzPhone(String(row.phone ?? "")), balance: Number(row.balance ?? 0) });
    setOpen(false);
    setQuery("");
  }

  function handleCreated(customer: SelectedCustomer) {
    onChange(customer);
    setCreateOpen(false);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-left text-sm transition hover:border-slate-600"
      >
        {value ? (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-slate-100">{value.name}</span>
            {value.phone ? <span className="truncate text-xs text-slate-400">{formatUzPhone(value.phone)}</span> : null}
          </span>
        ) : (
          <span className="truncate text-slate-500">{placeholder}</span>
        )}
        <span className="flex shrink-0 items-center gap-1">
          {value ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Tozalash"
              className="rounded p-0.5 text-slate-500 hover:text-slate-200"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
            >
              <FiX />
            </span>
          ) : null}
          <FiChevronDown className="text-slate-500" />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[130] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/50">
          <div className="border-b border-slate-800 p-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                autoFocus
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ism yoki telefon bo'yicha qidiring..."
              />
            </div>
          </div>
          <div className="max-h-[min(18rem,42dvh)] overflow-auto thin-scrollbar" onScroll={handleScroll}>
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-slate-800 ${value?.id === customer.id ? "bg-sky-500/15" : ""}`}
                onClick={() => select(customer)}
              >
                <span className="block truncate font-semibold text-slate-100">{customer.name}</span>
                <span className="block truncate text-xs text-slate-400">
                  {customer.phone ? formatUzPhone(String(customer.phone)) : "Telefon yo'q"} · Balans: {money(Number(customer.balance ?? 0))}
                </span>
              </button>
            ))}
            {loading ? <div className="px-3 py-3 text-sm font-semibold text-slate-500">Yuklanmoqda...</div> : null}
            {!loading && !customers.length ? <div className="px-3 py-3 text-sm font-semibold text-slate-500">Mijoz topilmadi</div> : null}
          </div>
          {allowCreate ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-slate-800"
              onClick={() => setCreateOpen(true)}
            >
              <FiUserPlus /> Yangi mijoz qo'shish
            </button>
          ) : null}
        </div>
      ) : null}

      {allowCreate ? (
        <CreateCustomerModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          branchId={branchId}
          branches={branches}
          initialName={query.trim()}
          onCreated={handleCreated}
        />
      ) : null}
    </div>
  );
}

function CreateCustomerModal({
  open,
  onOpenChange,
  branchId,
  branches,
  initialName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId?: string;
  branches: { id: string; name: string }[];
  initialName: string;
  onCreated: (customer: SelectedCustomer) => void;
}) {
  const presetBranch = branchId && branchId !== "all" ? branchId : "";
  const realBranches = useMemo(() => branches.filter((branch) => branch.id && branch.name), [branches]);
  const needBranchPick = !presetBranch;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState(presetBranch);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setPhone("");
    setBranch(presetBranch || realBranches[0]?.id || "");
    setSaving(false);
    setError(null);
  }, [open, initialName, presetBranch, realBranches]);

  const phoneValid = normalizeUzPhone(phone).length === 12;
  const canSave = name.trim().length > 0 && phoneValid && Boolean(branch) && !saving;

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const created = await backendPost<CustomerRow>("/customers", {
        branch_id: branch,
        name: name.trim(),
        phone: normalizeUzPhone(phone),
        status: "active",
      });
      onCreated({ id: created.id, name: created.name, phone: normalizeUzPhone(String(created.phone ?? phone)), balance: Number(created.balance ?? 0) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mijoz qo'shib bo'lmadi");
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (saving ? undefined : onOpenChange(value))}>
      <DialogContent className="w-[min(92vw,440px)]">
        <DialogHeader>
          <DialogTitle>Yangi mijoz</DialogTitle>
          <DialogDescription>Mijoz tanlangan filialga qo'shiladi.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new-customer-name">Ism</Label>
            <Input id="new-customer-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Mijoz ismi" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-customer-phone">Telefon</Label>
            <div className="grid grid-cols-[84px,1fr] gap-2">
              <div className="flex h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-slate-300">+998</div>
              <Input
                id="new-customer-phone"
                inputMode="numeric"
                maxLength={9}
                value={localPhoneDigits(phone)}
                onChange={(event) => {
                  const local = event.target.value.replace(/\D/g, "").slice(0, 9);
                  setPhone(local ? `998${local}` : "");
                }}
                placeholder="901112233"
              />
            </div>
          </div>
          {needBranchPick ? (
            <div className="space-y-2">
              <Label>Filial</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger><SelectValue placeholder="Filial tanlang" /></SelectTrigger>
                <SelectContent>
                  {realBranches.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs font-semibold text-red-200">{error}</div> : null}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} disabled={!canSave}><FiPlus /> {saving ? "Saqlanmoqda…" : "Qo'shish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
