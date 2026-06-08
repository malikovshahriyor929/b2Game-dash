"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RepairErrorType, RepairPriority, Simulator } from "@/types/simulator";

export function RequestFixDialog({ open, onOpenChange, simulator }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator }) {
  const { requestFix } = useDashboardStore();
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
    requestFix(simulator.id, { title, description, errorType, priority, note });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Fix</DialogTitle>
          <DialogDescription>{simulator?.name} repair request will be sent to Super Admin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Issue title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short issue title" />
          </div>
          <div className="space-y-2">
            <Label>Issue description</Label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What happened?" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Error type</Label>
              <Select value={errorType} onValueChange={(value) => setErrorType(value as RepairErrorType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["game_error", "device_error", "network_error", "payment_error", "hardware_error", "other"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as RepairPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "critical"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Optional note</Label>
            <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Extra context" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!title.trim() || !description.trim()} onClick={submit}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
