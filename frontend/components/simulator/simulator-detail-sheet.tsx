"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiClock, FiCreditCard, FiLock, FiPlay, FiPower, FiTool, FiXCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { money, seconds } from "@/lib/format";
import { backendDateTime } from "@/lib/datetime";
import { Simulator } from "@/types/simulator";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RequestFixDialog } from "@/components/simulator/request-fix-dialog";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-900/70 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-100">{value ?? "-"}</div></div>;
}

function simulatorKind(simulator: Simulator) {
  return simulator.zone === "Standard" ? "Logitech (Standard)" : "Moza (VIP)";
}

export function SimulatorDetailSheet({ open, onOpenChange, simulator, onAction }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onAction: (action: "start" | "addTime" | "payment" | "stop") => void }) {
  const { approveRepair, askRepairDetails, confirmFixed, rejectFix, rejectRepair, repairRequests, startFixing, markFixed, toggleLock, notifyRig, pushRigUpdate, removeOfflineRig } = useDashboardStore();
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
  const canToggleLock = isSuperAdmin
    ? canOperate && (simulator.rigId ? simulator.rigOnline : !busy)
    : canOperate && simulator.status === "locked" && (simulator.rigId ? simulator.rigOnline : true);
  const canRequestFix = canOperate && !inRepairFlow && !["locked", "offline"].includes(simulator.status);
  const canStartFix = canOperate && simulator.status === "repair_approved";
  const canMarkFixed = canOperate && simulator.status === "fixing";
  const canReviewRepair = isSuperAdmin && repairRequest?.status === "pending";
  const canConfirmFix = isSuperAdmin && repairRequest?.status === "fixed_waiting_confirmation";
  const showSessionActions = canStartSession || canAddTime || canTakePayment || canStop || canToggleLock || canRequestFix;
  const showRigActions = Boolean(simulator.rigId);
  const showRepairActions = canStartFix || canMarkFixed || canReviewRepair || canConfirmFix;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[min(94vw,620px)] pb-8">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">{simulator.name}<StatusBadge status={simulator.status} /></SheetTitle>
          <SheetDescription>{simulator.branchName} - {simulatorKind(simulator)} - {simulator.deviceId}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Branch" value={simulator.branchName} />
          <Field label="Type" value={simulatorKind(simulator)} />
          <Field label="Current user" value={simulator.currentUser ?? "No session"} />
          <Field label="Tariff" value={simulator.tariff ?? "Not selected"} />
          <Field label="Started" value={simulator.startedAt ?? "-"} />
          <Field label="Remaining" value={seconds(simulator.remainingSeconds ?? simulator.remainingMinutes * 60)} />
          <Field label="Paid" value={money(simulator.paidAmount)} />
          <Field label="Payment" value={simulator.paymentStatus} />
          <Field label="IP address" value={simulator.ipAddress} />
          <Field label="Repair status" value={repairRequest?.status ?? "-"} />
          {simulator.rigId ? <Field label="Rig ID" value={simulator.rigId} /> : null}
          {simulator.rigId ? <Field label="Rig version" value={`${simulator.rigVersion ?? "-"} / latest ${simulator.rigLatestVersion ?? "-"}`} /> : null}
          {simulator.rigId ? <Field label="Rig host" value={simulator.rigHostname ?? "-"} /> : null}
          {simulator.rigId ? <Field label="Last seen" value={simulator.rigLastSeen ? backendDateTime(simulator.rigLastSeen) : "-"} /> : null}
          {simulator.rigUpdateStatus ? <Field label="Update status" value={simulator.rigUpdateStatus} /> : null}
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
              {canToggleLock ? <Button variant="secondary" onClick={() => toggleLock(simulator.id)}><FiLock /> {simulator.status === "locked" ? "Unlock" : "Lock / Unlock"}</Button> : null}
              {canRequestFix ? <Button variant="warning" onClick={() => setFixOpen(true)}><FiTool /> Request Fix</Button> : null}
            </div>
          </div>
        ) : null}
        {showRigActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Rig admin actions</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {simulator.rigId && simulator.rigOnline ? <Button variant="secondary" onClick={() => notifyRig(simulator.id, "Hello")}><FiClock /> Notify</Button> : null}
              {simulator.rigId && simulator.rigOnline ? <Button variant="secondary" onClick={() => pushRigUpdate(simulator.id)}><FiTool /> Push update</Button> : null}
              {simulator.rigId && !simulator.rigOnline ? <Button variant="destructive" onClick={() => removeOfflineRig(simulator.id)}><FiXCircle /> Remove offline rig</Button> : null}
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
