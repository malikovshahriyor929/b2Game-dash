"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
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
import { BackendTariff, dedupeTariffs, mapTariffRow } from "@/lib/use-backend-tariffs";
import { backendGet, backendPost } from "@/server/api";

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

function formatNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} soat` : `${minutes} daqiqa`;
}

function TariffCard({ item }: { item: BackendTariff }) {
  const weekdayPrice = item.weekdayPrice ?? item.price;
  const weekendPrice = item.weekendPrice ?? item.price;

  return (
    <Card className="p-4 w-full min-w-[220px]">
      <div className="flex flex-wrap gap-2">
        <Badge variant={item.simulatorZone === "vip" ? "vip" : "muted"}>
          {zoneLabels[item.simulatorZone] ?? item.simulatorZone}
        </Badge>
        <Badge variant="muted">{typeLabels[item.type] ?? item.type}</Badge>
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

export default function TariffsPage() {
  const { selectedBranchId, branches } = useDashboardStore();
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "time", simulatorZone: "main", duration: "60", weekdayPrice: "", weekendPrice: "", weekdayBonus: "", weekendBonus: "" });

  const createBranchId = selectedBranchId === "all" ? branches[0]?.id ?? "" : selectedBranchId;
  const branchLabel = selectedBranchId === "all" ? "Barcha filiallar" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Filial";

  const groupedTariffs = useMemo(() => {
    const main = tariffs.filter((item) => item.simulatorZone === "main");
    const vip = tariffs.filter((item) => item.simulatorZone === "vip");
    return { main, vip };
  }, [tariffs]);

  async function refreshTariffs() {
    setLoading(true);
    try {
      const query = `branch_id=${encodeURIComponent(selectedBranchId)}`;
      const rows = await backendGet<Array<Record<string, unknown>>>(`/tariffs?${query}`);
      const mapped = rows.map(mapTariffRow);
      setTariffs(selectedBranchId === "all" ? dedupeTariffs(mapped) : mapped);
    } catch {
      setTariffs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshTariffs();
  }, [selectedBranchId]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const weekdayPrice = Number(form.weekdayPrice.replace(/\D/g, ""));
    const weekendPrice = Number((form.weekendPrice || form.weekdayPrice).replace(/\D/g, ""));
    const duration = Number(form.duration.replace(/\D/g, ""));
    if (!form.name.trim() || !Number.isFinite(weekdayPrice) || weekdayPrice <= 0 || !Number.isFinite(duration) || duration <= 0 || !createBranchId) return;
    void backendPost("/tariffs", {
      branch_id: createBranchId,
      name: form.name.trim(),
      simulator_zone: form.simulatorZone,
      duration_minutes: duration,
      price: weekdayPrice,
      weekday_price: weekdayPrice,
      weekend_price: weekendPrice,
      weekday_bonus: form.weekdayBonus.trim() || undefined,
      weekend_bonus: form.weekendBonus.trim() || undefined,
      type: form.type,
      is_active: true,
    }).then(() => {
      setForm({ name: "", type: "time", simulatorZone: "main", duration: "60", weekdayPrice: "", weekendPrice: "", weekdayBonus: "", weekendBonus: "" });
      setOpen(false);
      return refreshTariffs();
    }).catch(() => undefined);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Tariflar"
          description={`${branchLabel} uchun narxlar. PN–CHT va dam olish kunlari alohida.`}
        />
        <Button onClick={() => setOpen(true)} disabled={!createBranchId}><FiPlus /> Tarif qo'shish</Button>
      </div>

      {loading ? (
        <Card className="p-6 text-sm text-slate-400">Tariflar yuklanmoqda...</Card>
      ) : tariffs.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">Tariflar topilmadi. Seed ishga tushiring yoki yangi tarif qo'shing.</Card>
      ) : (
        <div className="space-y-8">
          {groupedTariffs.main.length ? (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Logitech / Middle</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTariffs.main.map((item) => <TariffCard key={item.id} item={item} />)}
              </div>
            </section>
          ) : null}
          {groupedTariffs.vip.length ? (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Moza / VIP</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTariffs.vip.map((item) => <TariffCard key={item.id} item={item} />)}
              </div>
            </section>
          ) : null}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tarif qo'shish</DialogTitle>
            <DialogDescription>Yangi B2 Game Club tarifini yarating.</DialogDescription>
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
            <div className="space-y-2"><Label>PN–CHT bonus</Label><Input value={form.weekdayBonus} onChange={(event) => setForm((item) => ({ ...item, weekdayBonus: event.target.value }))} placeholder="energetik" /></div>
            <div className="space-y-2"><Label>Juma–Yakshanba bonus</Label><Input value={form.weekendBonus} onChange={(event) => setForm((item) => ({ ...item, weekendBonus: event.target.value }))} placeholder="energetik + chips" /></div>
            <Button className="sm:col-span-2" type="submit" disabled={!form.name.trim() || !form.weekdayPrice.trim() || !createBranchId}><FiPlus /> Yaratish</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
