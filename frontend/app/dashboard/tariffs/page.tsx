"use client";

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { money } from "@/lib/format";
import { backendGet, backendPost } from "@/lib/backend-client";

type Tariff = {
  id: string;
  name: string;
  type: string;
  simulatorZone: string;
  durationMinutes: number;
  price: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  bonus?: string;
};

const tariffTypes = ["time", "vip", "package", "promo", "group", "birthday", "night", "weekend"];
const zones = [
  { label: "Logitech / Middle", value: "main" },
  { label: "Moza / VIP", value: "vip" },
];

function formatNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [branchId, setBranchId] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "time", simulatorZone: "main", duration: "60", weekdayPrice: "", weekendPrice: "", weekdayBonus: "", weekendBonus: "" });

  async function refreshTariffs() {
    const [branchRows, rows] = await Promise.all([
      backendGet<Array<Record<string, unknown>>>("/branches"),
      backendGet<Array<Record<string, unknown>>>("/tariffs?branch_id=all"),
    ]);
    setBranchId((current) => current || String(branchRows[0]?.id ?? ""));
    setTariffs(rows.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      type: String(row.type ?? row.simulator_zone ?? "Time-based"),
      simulatorZone: String(row.simulator_zone ?? "main"),
      durationMinutes: Number(row.duration_minutes ?? 0),
      price: Number(row.price ?? 0),
      weekdayPrice: row.weekday_price == null ? undefined : Number(row.weekday_price),
      weekendPrice: row.weekend_price == null ? undefined : Number(row.weekend_price),
      bonus: row.bonus == null ? undefined : String(row.bonus),
    })));
  }

  useEffect(() => {
    void refreshTariffs().catch(() => undefined);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const weekdayPrice = Number(form.weekdayPrice.replace(/\D/g, ""));
    const weekendPrice = Number((form.weekendPrice || form.weekdayPrice).replace(/\D/g, ""));
    const duration = Number(form.duration.replace(/\D/g, ""));
    if (!form.name.trim() || !Number.isFinite(weekdayPrice) || weekdayPrice <= 0 || !Number.isFinite(duration) || duration <= 0 || !branchId) return;
    void backendPost("/tariffs", {
      branch_id: branchId,
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
    }).then(refreshTariffs).catch(() => undefined);
    setTariffs((items) => [{ id: crypto.randomUUID(), name: form.name.trim(), type: form.type, simulatorZone: form.simulatorZone, durationMinutes: duration, price: weekdayPrice, weekdayPrice, weekendPrice }, ...items]);
    setForm({ name: "", type: "time", simulatorZone: "main", duration: "60", weekdayPrice: "", weekendPrice: "", weekdayBonus: "", weekendBonus: "" });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Tariflar" description="Time-based, package, promo, VIP, group, birthday, night and weekend pricing." />
        <Button onClick={() => setOpen(true)}><FiPlus /> Add tariff</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {tariffs.map((item) => (
          <Card key={item.id} className="p-4">
            <Badge variant={item.type === "vip" ? "vip" : "muted"}>{item.type}</Badge>
            <div className="mt-4 text-lg font-bold">{item.name}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{item.simulatorZone === "vip" ? "Moza / VIP" : "Logitech / Middle"} · {item.durationMinutes} min</div>
            <div className="mt-2 text-xl font-black text-sky-200">{money(item.price)}</div>
            <div className="mt-2 space-y-1 text-xs font-semibold text-slate-400">
              <div>PN-CHT: {money(item.weekdayPrice ?? item.price)}</div>
              <div>Juma-Yakshanba: {money(item.weekendPrice ?? item.price)}</div>
              {item.bonus ? <div className="text-emerald-300">Bonus: {item.bonus}</div> : null}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add tariff</DialogTitle>
            <DialogDescription>Create a new B2 Game Club pricing tariff.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tariff name</Label>
              <Input value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} placeholder="Logitech 90 min" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm((item) => ({ ...item, type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tariffTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zone</Label>
              <Select value={form.simulatorZone} onValueChange={(simulatorZone) => setForm((item) => ({ ...item, simulatorZone }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{zones.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input inputMode="numeric" value={form.duration} onChange={(event) => setForm((item) => ({ ...item, duration: event.target.value.replace(/\D/g, "") }))} placeholder="60" />
            </div>
            <div className="space-y-2">
              <Label>PN-CHT price</Label>
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
              <Label>Juma-Yakshanba price</Label>
              <div className="relative">
                <Input className="pr-16" inputMode="numeric" value={formatNumber(form.weekendPrice)} onChange={(event) => setForm((item) => ({ ...item, weekendPrice: event.target.value.replace(/\D/g, "") }))} placeholder="50 000" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">so'm</span>
              </div>
            </div>
            <div className="space-y-2"><Label>PN-CHT bonus</Label><Input value={form.weekdayBonus} onChange={(event) => setForm((item) => ({ ...item, weekdayBonus: event.target.value }))} placeholder="energetik" /></div>
            <div className="space-y-2"><Label>Juma-Yakshanba bonus</Label><Input value={form.weekendBonus} onChange={(event) => setForm((item) => ({ ...item, weekendBonus: event.target.value }))} placeholder="energetik + chips" /></div>
            <Button className="sm:col-span-2" type="submit" disabled={!form.name.trim() || !form.weekdayPrice.trim() || !branchId}><FiPlus /> Create tariff</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
