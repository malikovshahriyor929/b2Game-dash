"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RepairErrorType, RepairPriority, Simulator } from "@/types/simulator";

const ERROR_TYPE_LABELS: Record<RepairErrorType, string> = {
  game_error: "O'yin xatosi",
  device_error: "Qurilma xatosi",
  network_error: "Tarmoq xatosi",
  payment_error: "To'lov xatosi",
  hardware_error: "Apparat xatosi",
  other: "Boshqa",
};

const PRIORITY_LABELS: Record<RepairPriority, string> = {
  low: "Past",
  medium: "O'rta",
  high: "Yuqori",
  critical: "Juda muhim",
};

export function RequestFixDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { openMaintenance } = useDashboardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorType, setErrorType] = useState<RepairErrorType>("device_error");
  const [priority, setPriority] = useState<RepairPriority>("medium");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setErrorType("device_error");
    setPriority("medium");
    setNote("");
  }, [open, simulator?.id]);

  function submit() {
    if (!simulator || !title.trim() || !description.trim()) return;
    openMaintenance(simulator.id, { title, description, errorType, priority, note });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Maintenance ochish</DialogTitle>
          <DialogDescription>{simulator?.name} ta&apos;mirga olinadi. Yopilgach super admin tekshiradi — bekorga ochilsa, ketgan vaqt jarima sifatida hisobingizdan ayiriladi.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Muammo sarlavhasi</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Qisqa muammo sarlavhasi" />
          </div>
          <div className="space-y-2">
            <Label>Muammo tavsifi</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nima sodir bo'ldi?" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Xato turi</Label>
              <Select value={errorType} onValueChange={(value) => setErrorType(value as RepairErrorType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["game_error", "device_error", "network_error", "payment_error", "hardware_error", "other"] as RepairErrorType[]).map((item) => <SelectItem key={item} value={item}>{ERROR_TYPE_LABELS[item]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Muhimligi</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as RepairPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "critical"] as RepairPriority[]).map((item) => <SelectItem key={item} value={item}>{PRIORITY_LABELS[item]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Qo&apos;shimcha izoh (ixtiyoriy)</Label>
            <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Qo'shimcha ma'lumot" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button disabled={!title.trim() || !description.trim()} onClick={submit}>Maintenance ochish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
