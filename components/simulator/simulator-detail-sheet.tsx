"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiClock, FiCreditCard, FiLock, FiPlay, FiPower, FiTool, FiXCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { money, minutes } from "@/lib/format";
import { Simulator } from "@/types/simulator";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RequestFixDialog } from "@/components/simulator/request-fix-dialog";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-900/70 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-100">{value ?? "-"}</div></div>;
}

export function SimulatorDetailSheet({ open, onOpenChange, simulator, onAction }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onAction: (action: "start" | "addTime" | "payment" | "stop") => void }) {
  const { approveRepair, askRepairDetails, confirmFixed, rejectFix, rejectRepair, repairRequests, startFixing, markFixed, toggleLock } = useDashboardStore();
  const { data } = useSession();
  const [fixOpen, setFixOpen] = useState(false);
  if (!simulator) return null;
  const role = data?.user?.role;
  const canOperate = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  const ready = simulator.status === "ready_to_play";
  const busy = ["busy", "unpaid"].includes(simulator.status);
  const repairRequest = repairRequests.find((item) => item.id === simulator.repairRequestId);
  const inRepairFlow = ["repair_requested", "repair_approved", "fixing", "fixed_waiting_confirmation"].includes(simulator.status);
  const canStartSession = canOperate && (ready || simulator.status === "reserved");
  const canAddTime = canOperate && busy;
  const canTakePayment = canOperate && ["busy", "unpaid", "reserved"].includes(simulator.status);
  const canStop = canOperate && busy;
  const canLock = canOperate && !busy;
  const canRequestFix = canOperate && !inRepairFlow && simulator.status !== "locked";
  const canStartFix = canOperate && simulator.status === "repair_approved";
  const canMarkFixed = canOperate && simulator.status === "fixing";
  const canReviewRepair = isSuperAdmin && repairRequest?.status === "pending";
  const canConfirmFix = isSuperAdmin && repairRequest?.status === "fixed_waiting_confirmation";
  const showSessionActions = canStartSession || canAddTime || canTakePayment || canStop || canLock || canRequestFix;
  const showRepairActions = canStartFix || canMarkFixed || canReviewRepair || canConfirmFix;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">{simulator.name}<StatusBadge status={simulator.status} /></SheetTitle>
          <SheetDescription>{simulator.branchName} - {simulator.zone} - {simulator.deviceId}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Branch" value={simulator.branchName} />
          <Field label="Zone" value={simulator.zone} />
          <Field label="Current user" value={simulator.currentUser ?? "No session"} />
          <Field label="Tariff" value={simulator.tariff ?? "Not selected"} />
          <Field label="Started" value={simulator.startedAt ?? "-"} />
          <Field label="Remaining" value={minutes(simulator.remainingMinutes)} />
          <Field label="Paid" value={money(simulator.paidAmount)} />
          <Field label="Payment" value={simulator.paymentStatus} />
          <Field label="IP address" value={simulator.ipAddress} />
          <Field label="Repair status" value={repairRequest?.status ?? "-"} />
        </div>
        {repairRequest ? (
          <>
            <Separator className="my-4" />
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">
              <div className="font-semibold text-slate-100">{repairRequest.title}</div>
              <div className="mt-1">{repairRequest.description}</div>
              <div className="mt-2 text-xs text-slate-500">{repairRequest.errorType} - {repairRequest.priority} - requested by {repairRequest.requestedBy}</div>
            </div>
          </>
        ) : null}
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Order items</div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">{simulator.orderItems.length ? simulator.orderItems.join(", ") : "No active shop order"}</div>
        </div>
        {showSessionActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Session actions</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {canStartSession ? <Button onClick={() => onAction("start")}><FiPlay /> Start</Button> : null}
              {canAddTime ? <Button variant="secondary" onClick={() => onAction("addTime")}><FiClock /> Add time</Button> : null}
              {canTakePayment ? <Button variant="success" onClick={() => onAction("payment")}><FiCreditCard /> Payment</Button> : null}
              {canStop ? <Button variant="destructive" onClick={() => onAction("stop")}><FiPower /> Stop</Button> : null}
              {canLock ? <Button variant="secondary" onClick={() => toggleLock(simulator.id)}><FiLock /> Lock / Unlock</Button> : null}
              {canRequestFix ? <Button variant="warning" onClick={() => setFixOpen(true)}><FiTool /> Request Fix</Button> : null}
            </div>
          </div>
        ) : null}
        {showRepairActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Repair flow</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {canStartFix ? <Button variant="secondary" onClick={() => startFixing(simulator.id)}><FiTool /> Start fixing</Button> : null}
              {canMarkFixed ? <Button variant="success" onClick={() => markFixed(simulator.id)}><FiCheckCircle /> Mark fixed</Button> : null}
              {canReviewRepair && repairRequest ? <Button variant="success" onClick={() => approveRepair(repairRequest.id)}><FiCheckCircle /> Approve</Button> : null}
              {canReviewRepair && repairRequest ? <Button variant="destructive" onClick={() => rejectRepair(repairRequest.id)}><FiXCircle /> Reject</Button> : null}
              {canReviewRepair && repairRequest ? <Button variant="secondary" onClick={() => askRepairDetails(repairRequest.id)}>More details</Button> : null}
              {canConfirmFix && repairRequest ? <Button variant="success" onClick={() => confirmFixed(repairRequest.id)}>Confirm fixed</Button> : null}
              {canConfirmFix && repairRequest ? <Button variant="destructive" onClick={() => rejectFix(repairRequest.id)}>Reject fix</Button> : null}
            </div>
          </div>
        ) : null}
        </SheetContent>
      </Sheet>
      <RequestFixDialog open={fixOpen} onOpenChange={setFixOpen} simulator={simulator} />
    </>
  );
}
