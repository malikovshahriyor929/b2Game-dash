"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RepairErrorType, RepairPriority, RepairRequest, Simulator } from "@/types/simulator";

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

export function RequestFixDialog({ open, onOpenChange, simulator, duringSession = false, closing = false, repairRequest }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; duringSession?: boolean; closing?: boolean; repairRequest?: RepairRequest }) {
  const { openMaintenance, openMaintenanceDuringSession, closeMaintenance } = useDashboardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorType, setErrorType] = useState<RepairErrorType>("device_error");
  const [priority, setPriority] = useState<RepairPriority>("medium");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(closing ? repairRequest?.title ?? "" : "");
    setDescription(closing ? repairRequest?.description ?? "" : "");
    setErrorType(closing ? repairRequest?.errorType ?? "device_error" : "device_error");
    setPriority(closing ? repairRequest?.priority ?? "medium" : "medium");
    setNote(closing ? repairRequest?.note ?? "" : "");
  }, [open, simulator?.id, closing, repairRequest]);

  function submit() {
    if (!simulator) return;
    if (!duringSession || closing) {
      if (!title.trim() || !description.trim()) return;
    }
    const payload = { title, description, errorType, priority, note };
    if (closing) closeMaintenance(simulator.id, payload);
    else if (duringSession) openMaintenanceDuringSession(simulator.id, {
      title: "Sessiya vaqtida texnik nosozlik",
      description: "Muammo tafsilotlari maintenance yopilayotganda kiritiladi.",
      errorType: "other",
      priority: "medium",
    });
    else openMaintenance(simulator.id, payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{closing ? "Maintenance yakunlash" : duringSession ? "Sessiya vaqtida buzildi" : "Maintenance ochish"}</DialogTitle>
          <DialogDescription>
            {closing
              ? "Muammo tafsilotlarini kiriting. Sessiya qolgan vaqti bilan davom etadi, maintenance vaqti esa super admin tekshiruviga yuboriladi."
              : duringSession
              ? `${simulator?.name} aktiv sessiyasi pauzaga qo'yiladi: qolgan vaqt saqlanadi, simulator lock qilinmaydi. Ta'mir tugagach sessiya shu qolgan vaqt bilan davom etadi; cho'zilsa bo'sh simulyatorga ko'chiriladi.`
              : `${simulator?.name} ta'mirga olinadi. Yopilgach super admin tekshiradi — bekorga ochilsa, ketgan vaqt jarima sifatida hisobingizdan ayiriladi.`}
          </DialogDescription>
        </DialogHeader>
        {(!duringSession || closing) ? <div className="grid gap-3">
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
        </div> : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button disabled={(!duringSession || closing) && (!title.trim() || !description.trim())} onClick={submit}>{closing ? "Maintenance yakunlash" : duringSession ? "Tasdiqlash va sessiyani pauza qilish" : "Maintenance ochish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
