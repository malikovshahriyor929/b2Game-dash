"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/components/providers/dashboard-store";

// O'zbekiston mobil raqami: +998 va 9 ta raqam. Faqat raqamlarni olib, mask ko'rinishida formatlaymiz.
function uzPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return (digits.startsWith("998") ? digits.slice(3) : digits).slice(0, 9);
}

function formatUzPhone(value: string) {
  const digits = uzPhoneDigits(value);
  if (!digits) return "";
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(" ")}`;
}

export function CreateBranchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { createBranch } = useDashboardStore();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const phoneDigits = uzPhoneDigits(phone);
  const phoneIncomplete = phoneDigits.length > 0 && phoneDigits.length < 9;

  function reset() {
    setName("");
    setCode("");
    setAddress("");
    setPhone("");
  }

  async function submit() {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName) return toast.error("Filial nomini kiriting");
    if (!trimmedCode) return toast.error("Filial kodini kiriting");
    if (!phoneDigits) return toast.error("Telefon raqamini kiriting");
    if (phoneDigits.length !== 9) return toast.error("Telefon raqami to'liq emas. Masalan: +998 90 123 45 67");
    setSaving(true);
    try {
      await createBranch({ name: trimmedName, code: trimmedCode, address: address.trim(), phone: `+998${phoneDigits}` });
      toast.success("Filial qo'shildi");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Filial qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) reset(); onOpenChange(value); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi filial</DialogTitle>
          <DialogDescription>Yangi filial yarating. Simulatorlarni keyin shu filialga qo&apos;shasiz.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nomi</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Chilonzor" />
          </div>
          <div className="space-y-2">
            <Label>Kod</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Masalan: CHZ" />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(formatUzPhone(e.target.value))}
              placeholder="+998 90 123 45 67"
              className={phoneIncomplete ? "border-rose-500/60 focus:border-rose-500" : undefined}
            />
            <p className={phoneIncomplete ? "text-xs text-rose-400" : "text-xs text-slate-500"}>
              {phoneIncomplete ? "Raqam to'liq emas (9 ta raqam)" : "Masalan: +998 90 123 45 67"}
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Manzil (ixtiyoriy)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Manzil" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Bekor</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saqlanmoqda..." : "Qo'shish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
