"use client";

import { FiClock, FiCreditCard, FiLock, FiPlay, FiPower, FiTool } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { RoleGuard } from "@/components/shared/role-guard";
import { money, minutes } from "@/lib/format";
import { Simulator } from "@/types/simulator";
import { useDashboardStore } from "@/components/providers/dashboard-store";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-900/70 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-100">{value ?? "-"}</div></div>;
}

export function SimulatorDetailSheet({ open, onOpenChange, simulator, onAction }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onAction: (action: "start" | "addTime" | "payment" | "stop") => void }) {
  const { setMaintenance, toggleLock } = useDashboardStore();
  if (!simulator) return null;
  const free = simulator.status === "free";
  const busy = ["busy", "ending_soon", "unpaid"].includes(simulator.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">{simulator.name}<StatusBadge status={simulator.status} /></SheetTitle>
          <SheetDescription>{simulator.zone} - {simulator.deviceId}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" value={simulator.type} />
          <Field label="IP address" value={simulator.ipAddress} />
          <Field label="Current user" value={simulator.currentUser ?? "No session"} />
          <Field label="Tariff" value={simulator.tariff ?? "Not selected"} />
          <Field label="Started" value={simulator.startedAt ?? "-"} />
          <Field label="Remaining" value={minutes(simulator.remainingMinutes)} />
          <Field label="Paid" value={money(simulator.paidAmount)} />
          <Field label="Payment" value={simulator.paymentStatus} />
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Order items</div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">{simulator.orderItems.length ? simulator.orderItems.join(", ") : "No active shop order"}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <RoleGuard action="start"><Button disabled={!free && simulator.status !== "reserved"} onClick={() => onAction("start")}><FiPlay /> Start</Button></RoleGuard>
          <RoleGuard action="addTime"><Button variant="secondary" disabled={!busy} onClick={() => onAction("addTime")}><FiClock /> Add time</Button></RoleGuard>
          <RoleGuard action="payment"><Button variant="success" disabled={free} onClick={() => onAction("payment")}><FiCreditCard /> Payment</Button></RoleGuard>
          <RoleGuard action="stop"><Button variant="destructive" disabled={!busy} onClick={() => onAction("stop")}><FiPower /> Stop</Button></RoleGuard>
          <RoleGuard action="lock"><Button variant="secondary" onClick={() => toggleLock(simulator.id)}><FiLock /> Lock / Unlock</Button></RoleGuard>
          <RoleGuard action="maintenance"><Button variant="warning" onClick={() => setMaintenance(simulator.id, simulator.status !== "maintenance")}><FiTool /> Maintenance</Button></RoleGuard>
        </div>
      </SheetContent>
    </Sheet>
  );
}
