"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { tariffs as tariffSeed } from "@/lib/mock-data";
import { money } from "@/lib/format";

type Tariff = {
  id: string;
  name: string;
  type: string;
  price: number;
};

const tariffTypes = ["Time-based", "VIP", "Package", "Promo", "Group", "Birthday", "Night", "Weekend"];

function formatNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>(tariffSeed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Time-based", price: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const price = Number(form.price.replace(/\D/g, ""));
    if (!form.name.trim() || !Number.isFinite(price) || price <= 0) return;
    setTariffs((items) => [{ id: crypto.randomUUID(), name: form.name.trim(), type: form.type, price }, ...items]);
    setForm({ name: "", type: "Time-based", price: "" });
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
            <Badge variant={item.type === "VIP" ? "vip" : "muted"}>{item.type}</Badge>
            <div className="mt-4 text-lg font-bold">{item.name}</div>
            <div className="mt-2 text-xl font-black text-sky-200">{money(item.price)}</div>
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
              <Input value={form.name} onChange={(event) => setForm((item) => ({ ...item, name: event.target.value }))} placeholder="Main 90 min" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm((item) => ({ ...item, type: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tariffTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Price</Label>
              <div className="relative">
                <Input
                  className="pr-16"
                  inputMode="numeric"
                  value={formatNumber(form.price)}
                  onChange={(event) => setForm((item) => ({ ...item, price: event.target.value.replace(/\D/g, "") }))}
                  placeholder="75 000"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">so'm</span>
              </div>
            </div>
            <Button className="sm:col-span-2" type="submit" disabled={!form.name.trim() || !form.price.trim()}><FiPlus /> Create tariff</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
