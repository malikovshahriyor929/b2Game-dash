"use client";

import { useState } from "react";
import { FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/account-api";

const empty = { current: "", next: "", confirm: "" };

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  function close(next: boolean) {
    if (saving) return;
    if (!next) setForm(empty);
    onOpenChange(next);
  }

  async function submit() {
    if (!form.current) return toast.error("Joriy parolni kiriting");
    if (form.next.length < 6) return toast.error("Yangi parol kamida 6 ta belgi");
    if (form.next !== form.confirm) return toast.error("Yangi parollar mos kelmadi");
    if (form.next === form.current) return toast.error("Yangi parol joriydan farq qilsin");

    setSaving(true);
    try {
      await changePassword({ current_password: form.current, new_password: form.next });
      toast.success("Parol o'zgartirildi");
      setForm(empty);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Parolni o'zgartirib bo'lmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FiLock /> Parolni o&apos;zgartirish</DialogTitle>
          <DialogDescription>Xavfsizlik uchun joriy parolingizni tasdiqlang.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Joriy parol</Label>
            <Input type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} placeholder="Joriy parol" />
          </div>
          <div className="space-y-2">
            <Label>Yangi parol</Label>
            <Input type="password" autoComplete="new-password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} placeholder="Kamida 6 ta belgi" />
          </div>
          <div className="space-y-2">
            <Label>Yangi parolni takrorlang</Label>
            <Input type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Yangi parolni qayta kiriting" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => close(false)} disabled={saving}>Bekor</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
