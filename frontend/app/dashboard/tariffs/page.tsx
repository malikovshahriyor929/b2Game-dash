"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { money } from "@/lib/format";
import { BackendTariff, mapTariffRow } from "@/lib/use-backend-tariffs";
import { backendDelete, backendGet, backendPatch, backendPost } from "@/server/api";
import type { Product } from "@/types/product";

const tariffTypes = ["time", "package", "night", "promo", "group", "birthday", "weekend"];
const zones = [
  { label: "Logitech / Middle", value: "main" },
  { label: "Moza / VIP", value: "vip" },
];

const zoneLabels: Record<string, string> = {
  main: "Logitech / Middle",
  vip: "Moza / VIP",
};

const typeLabels: Record<string, string> = {
  time: "Soatlik",
  package: "Paket",
  night: "Tungi",
  promo: "Promo",
  group: "Guruh",
  birthday: "Tug'ilgan kun",
  weekend: "Dam olish",
};

// Bonus matnini ("energetik" / "Energy Drink") skladdagi mahsulotga moslashtirish uchun
// backend (sessions.service.ts) bilan bir xil aliaslar.
const BONUS_ALIASES: Array<{ test: RegExp; like: string }> = [
  { test: /energet|energy/i, like: "energy" },
  { test: /chips|chipsy/i, like: "chips" },
  { test: /snickers/i, like: "snickers" },
  { test: /coca|cola/i, like: "cola" },
  { test: /suv|water/i, like: "water" },
  { test: /burger/i, like: "burger" },
];

type BonusItem = { productId: string; name: string; qty: number };

function serializeBonus(items: BonusItem[]): string {
  return items
    .map((item) => ({ ...item, name: item.name.trim() }))
    .filter((item) => item.name)
    .map((item) => (item.qty > 1 ? `${item.qty} ${item.name}` : item.name))
    .join(" + ");
}

function parseBonus(value: string | undefined, products: Product[]): BonusItem[] {
  if (!value || !value.trim()) return [];
  return value
    .split(/[+,/]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const qtyMatch = part.match(/^(\d+)\s*/);
      const qty = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1;
      const text = part.replace(/^\d+\s*(x|ta|dona)?\s*/i, "").trim();
      const lower = text.toLowerCase();
      let product =
        products.find((p) => p.name.toLowerCase() === lower) ??
        products.find((p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
      if (!product) {
        const alias = BONUS_ALIASES.find((a) => a.test.test(text));
        if (alias) product = products.find((p) => p.name.toLowerCase().includes(alias.like) || p.category.toLowerCase().includes(alias.like));
      }
      return product ? { productId: product.id, name: product.name, qty } : { productId: "", name: text, qty };
    });
}

function formatNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} soat` : `${minutes} daqiqa`;
}

function BonusPicker({ label, products, items, onChange }: { label: string; products: Product[]; items: BonusItem[]; onChange: (items: BonusItem[]) => void }) {
  const available = products.filter((product) => !items.some((item) => item.productId && item.productId === product.id));
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.productId || item.name}-${index}`} className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm font-semibold text-slate-200">
              {item.name}
              {item.productId ? null : <span className="ml-2 text-xs font-normal text-amber-300">(skladda topilmadi)</span>}
            </div>
            <Input
              className="w-16 text-center"
              inputMode="numeric"
              value={String(item.qty)}
              onChange={(event) => {
                const qty = Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1);
                onChange(items.map((it, i) => (i === index ? { ...it, qty } : it)));
              }}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              <FiX />
            </Button>
          </div>
        ))}
        <Select
          value=""
          onValueChange={(productId) => {
            const product = products.find((item) => item.id === productId);
            if (product) onChange([...items, { productId: product.id, name: product.name, qty: 1 }]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Skladdan mahsulot tanlang..." />
          </SelectTrigger>
          <SelectContent>
            {available.length ? (
              available.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                  {typeof product.stock === "number" ? ` — ${product.stock} dona` : ""}
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-500">Sklad bo'sh yoki barchasi tanlangan</div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function TariffCard({ item, onEdit, onDelete }: { item: BackendTariff; onEdit: () => void; onDelete: () => void }) {
  const weekdayPrice = item.weekdayPrice ?? item.price;
  const weekendPrice = item.weekendPrice ?? item.price;

  return (
    <Card className="p-4 w-full min-w-[220px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant={item.simulatorZone === "vip" ? "vip" : "muted"}>
            {zoneLabels[item.simulatorZone] ?? item.simulatorZone}
          </Badge>
          <Badge variant="muted">{typeLabels[item.type] ?? item.type}</Badge>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label="Tahrirlash"><FiEdit2 /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="O'chirish"><FiTrash2 /></Button>
        </div>
      </div>
      <div className="mt-4 text-lg font-bold">{item.name}</div>
      <div className="mt-1 text-xs font-semibold text-slate-500">{formatDuration(item.durationMinutes)}</div>
      <div className="mt-3 space-y-1 text-sm font-semibold text-slate-300">
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">PN–CHT</span>
          <span>{money(weekdayPrice)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Juma–Yakshanba</span>
          <span className="text-sky-200">{money(weekendPrice)}</span>
        </div>
      </div>
      {(item.weekdayBonus || item.weekendBonus) ? (
        <div className="mt-3 space-y-1 text-xs font-semibold text-emerald-300">
          {item.weekdayBonus ? <div>PN–CHT bonus: {item.weekdayBonus}</div> : null}
          {item.weekendBonus ? <div>Juma–Yakshanba bonus: {item.weekendBonus}</div> : null}
        </div>
      ) : null}
    </Card>
  );
}

const emptyForm = { name: "", type: "time", simulatorZone: "main", duration: "60", weekdayPrice: "", weekendPrice: "" };

export default function TariffsPage() {
  const { selectedBranchId, branches, products } = useDashboardStore();
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [weekdayBonus, setWeekdayBonus] = useState<BonusItem[]>([]);
  const [weekendBonus, setWeekendBonus] = useState<BonusItem[]>([]);

  const allBranches = selectedBranchId === "all";
  const createBranchId = allBranches ? branches[0]?.id ?? "" : selectedBranchId;
  const branchLabel = allBranches ? "Barcha filiallar" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Filial";

  // "all" tanlansa har filial alohida bo'lim; aks holda faqat tanlangan filial.
  const branchSections = useMemo(() => {
    const zonesOf = (items: BackendTariff[]) => ({
      main: items.filter((item) => item.simulatorZone === "main"),
      vip: items.filter((item) => item.simulatorZone === "vip"),
    });
    if (!allBranches) {
      return [{ branchId: selectedBranchId, branchName: branchLabel, zones: zonesOf(tariffs) }];
    }
    const byBranch = new Map<string, BackendTariff[]>();
    for (const item of tariffs) {
      const key = item.branchId ?? "unknown";
      const list = byBranch.get(key) ?? [];
      list.push(item);
      byBranch.set(key, list);
    }
    const ordered = branches.filter((branch) => byBranch.has(branch.id));
    const extras = [...byBranch.keys()].filter((id) => !branches.some((branch) => branch.id === id));
    return [
      ...ordered.map((branch) => ({ branchId: branch.id, branchName: branch.name, zones: zonesOf(byBranch.get(branch.id) ?? []) })),
      ...extras.map((id) => ({ branchId: id, branchName: "Filial", zones: zonesOf(byBranch.get(id) ?? []) })),
    ];
  }, [allBranches, branchLabel, branches, selectedBranchId, tariffs]);

  async function refreshTariffs() {
    setLoading(true);
    try {
      const query = `branch_id=${encodeURIComponent(selectedBranchId)}`;
      const rows = await backendGet<Array<Record<string, unknown>>>(`/tariffs?${query}`);
      setTariffs(rows.map(mapTariffRow));
    } catch {
      setTariffs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshTariffs();
  }, [selectedBranchId]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setWeekdayBonus([]);
    setWeekendBonus([]);
    setOpen(true);
  }

  function openEdit(item: BackendTariff) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      type: item.type || "time",
      simulatorZone: item.simulatorZone === "vip" ? "vip" : "main",
      duration: String(item.durationMinutes),
      weekdayPrice: String(item.weekdayPrice ?? item.price ?? ""),
      weekendPrice: String(item.weekendPrice ?? item.price ?? ""),
    });
    setWeekdayBonus(parseBonus(item.weekdayBonus, products));
    setWeekendBonus(parseBonus(item.weekendBonus, products));
    setOpen(true);
  }

  function remove(item: BackendTariff) {
    if (!window.confirm(`"${item.name}" tarifini o'chirishni tasdiqlaysizmi?`)) return;
    void backendDelete(`/tariffs/${item.id}`).then(refreshTariffs).catch(() => undefined);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const weekdayPrice = Number(form.weekdayPrice.replace(/\D/g, ""));
    const weekendPrice = Number((form.weekendPrice || form.weekdayPrice).replace(/\D/g, ""));
    const duration = Number(form.duration.replace(/\D/g, ""));
    if (!form.name.trim() || !Number.isFinite(weekdayPrice) || weekdayPrice <= 0 || !Number.isFinite(duration) || duration <= 0 || !createBranchId) return;

    const payload = {
      name: form.name.trim(),
      simulator_zone: form.simulatorZone,
      duration_minutes: duration,
      price: weekdayPrice,
      weekday_price: weekdayPrice,
      weekend_price: weekendPrice,
      weekday_bonus: serializeBonus(weekdayBonus) || null,
      weekend_bonus: serializeBonus(weekendBonus) || null,
      type: form.type,
      is_active: true,
    };

    const request = editingId
      ? backendPatch(`/tariffs/${editingId}`, payload)
      : backendPost("/tariffs", { branch_id: createBranchId, ...payload });

    void request
      .then(() => {
        setForm(emptyForm);
        setWeekdayBonus([]);
        setWeekendBonus([]);
        setEditingId(null);
        setOpen(false);
        return refreshTariffs();
      })
      .catch(() => undefined);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Tariflar"
          description={`${branchLabel} uchun narxlar. PN–CHT va dam olish kunlari alohida.`}
        />
        <Button onClick={openCreate} disabled={!createBranchId}><FiPlus /> Tarif qo'shish</Button>
      </div>

      {loading ? (
        <Card className="p-6 text-sm text-slate-400">Tariflar yuklanmoqda...</Card>
      ) : tariffs.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">Tariflar topilmadi. Seed ishga tushiring yoki yangi tarif qo'shing.</Card>
      ) : (
        <div className="space-y-10">
          {branchSections.map((section) => {
            if (!section.zones.main.length && !section.zones.vip.length) return null;
            return (
              <div key={section.branchId} className="space-y-6">
                {allBranches ? (
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-black text-slate-100">{section.branchName}</h2>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                ) : null}
                {section.zones.main.length ? (
                  <section>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Logitech / Middle</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.zones.main.map((item) => <TariffCard key={item.id} item={item} onEdit={() => openEdit(item)} onDelete={() => remove(item)} />)}
                    </div>
                  </section>
                ) : null}
                {section.zones.vip.length ? (
                  <section>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Moza / VIP</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.zones.vip.map((item) => <TariffCard key={item.id} item={item} onEdit={() => openEdit(item)} onDelete={() => remove(item)} />)}
                    </div>
                  </section>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Tarifni tahrirlash" : "Tarif qo'shish"}</DialogTitle>
            <DialogDescription>{editingId ? "Tarif ma'lumotlarini yangilang." : "Yangi B2 Game Club tarifini yarating."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tarif nomi</Label>
              <Input value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} placeholder="Logitech 1 soat" />
            </div>
            <div className="space-y-2">
              <Label>Turi</Label>
              <Select value={form.type} onValueChange={(value) => setForm((item) => ({ ...item, type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tariffTypes.map((item) => <SelectItem key={item} value={item}>{typeLabels[item] ?? item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zona</Label>
              <Select value={form.simulatorZone} onValueChange={(simulatorZone) => setForm((item) => ({ ...item, simulatorZone }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{zones.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Davomiylik (daqiqa)</Label>
              <Input inputMode="numeric" value={form.duration} onChange={(event) => setForm((item) => ({ ...item, duration: event.target.value.replace(/\D/g, "") }))} placeholder="60" />
            </div>
            <div className="space-y-2">
              <Label>PN–CHT narxi</Label>
              <div className="relative">
                <Input
                  className="pr-16"
                  inputMode="numeric"
                  value={formatNumber(form.weekdayPrice)}
                  onChange={(event) => setForm((item) => ({ ...item, weekdayPrice: event.target.value.replace(/\D/g, "") }))}
                  placeholder="40 000"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">so'm</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Juma–Yakshanba narxi</Label>
              <div className="relative">
                <Input className="pr-16" inputMode="numeric" value={formatNumber(form.weekendPrice)} onChange={(event) => setForm((item) => ({ ...item, weekendPrice: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">so'm</span>
              </div>
            </div>
            <BonusPicker label="PN–CHT bonus (skladdan)" products={products} items={weekdayBonus} onChange={setWeekdayBonus} />
            <BonusPicker label="Juma–Yakshanba bonus (skladdan)" products={products} items={weekendBonus} onChange={setWeekendBonus} />
            <Button className="sm:col-span-2" type="submit" disabled={!form.name.trim() || !form.weekdayPrice.trim() || !createBranchId}>
              {editingId ? <><FiEdit2 /> Saqlash</> : <><FiPlus /> Yaratish</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
