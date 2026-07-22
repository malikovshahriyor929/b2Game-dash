"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiClock, FiCreditCard, FiLock, FiPlay, FiPower, FiTool, FiXCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { money, seconds } from "@/lib/format";
import { backendDateTime } from "@/lib/datetime";
import { Simulator } from "@/types/simulator";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { RequestFixDialog } from "@/components/simulator/request-fix-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-900/70 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-100">{value ?? "-"}</div></div>;
}

function simulatorKind(simulator: Simulator) {
  return simulator.zone === "Standard" ? "Logitech (Main)" : "Moza (Premium)";
}

function sessionTariffLabel(simulator: Simulator) {
  return simulator.billingMode === "open" ? "VIP" : simulator.tariff ?? "Tanlanmagan";
}

const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  open: "Ta'mirda (ochiq)",
  pending_review: "Tekshiruv kutilmoqda",
  cleared: "Tasdiqlangan (haqiqiy)",
  charged: "Jarima qo'yilgan",
};

export function SimulatorDetailSheet({ open, onOpenChange, simulator, onAction }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onAction: (action: "start" | "addTime" | "payment" | "stop") => void }) {
  const { closeMaintenance, transferMaintenanceSession, repairRequests, allSimulators, toggleLock, notifyRig, availableRig, pushRigUpdate, removeOfflineRig } = useDashboardStore();
  const confirm = useConfirm();
  const { data } = useSession();

  async function confirmRemoveOfflineRig() {
    if (!simulator) return;
    const ok = await confirm({
      title: "Oflayn rig o'chirilsinmi?",
      description: `${simulator.name} ro'yxatdan olib tashlanadi.`,
      confirmLabel: "Olib tashlash",
      tone: "destructive",
    });
    if (ok) removeOfflineRig(simulator.id);
  }
  const [fixOpen, setFixOpen] = useState(false);
  const [sessionFixOpen, setSessionFixOpen] = useState(false);
  const [closeMaintenanceOpen, setCloseMaintenanceOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  if (!simulator) return null;
  const role = data?.user?.role;
  const canOperate = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  const ready = simulator.status === "ready_to_play";
  const busy = ["busy", "unpaid"].includes(simulator.status);
  const repairRequest = repairRequests.find((item) => item.id === simulator.repairRequestId)
    ?? repairRequests.find((item) => item.simulatorId === simulator.id && item.reviewStatus === "open");
  const inMaintenance = simulator.status === "repair_requested" || repairRequest?.reviewStatus === "open";
  const canStartSession = canOperate && !inMaintenance && (ready || simulator.status === "reserved");
  const canAddTime = canOperate && !inMaintenance && busy && simulator.billingMode !== "open";
  const canTakePayment = canOperate && !inMaintenance && ["busy", "unpaid", "reserved"].includes(simulator.status);
  const canStop = canOperate && !inMaintenance && busy;
  const canToggleLock = isSuperAdmin
    ? canOperate && !inMaintenance && (simulator.rigId ? simulator.rigOnline : !busy)
    : canOperate && !inMaintenance && simulator.status === "locked" && (simulator.rigId ? simulator.rigOnline : true);
  const canOpenMaintenance = canOperate && !inMaintenance && ["ready_to_play", "broken"].includes(simulator.status);
  const canOpenMaintenanceDuringSession = canOperate && !inMaintenance && busy;
  const canCloseMaintenance = canOperate && inMaintenance;
  const hasSessionDetails = Boolean(simulator.currentSessionId || simulator.currentUser || ["busy", "unpaid", "reserved"].includes(simulator.status));
  const showSessionActions = canStartSession || canAddTime || canTakePayment || canStop || canToggleLock || canOpenMaintenance || canOpenMaintenanceDuringSession;
  const showRigDetails = isSuperAdmin && Boolean(simulator.rigId);
  const showRigActions = isSuperAdmin && Boolean(simulator.rigId);
  const showRepairActions = canCloseMaintenance;
  const transferTargets = repairRequest?.sessionId
    ? allSimulators.filter((item) =>
      item.branchId === simulator.branchId &&
      item.id !== simulator.id &&
      item.status === "ready_to_play" &&
      item.zone === simulator.zone
    )
    : [];
  const canTransferToSelected = transferTargets.some((item) => item.id === transferTargetId);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[min(94vw,620px)] pb-8">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">{simulator.name}<StatusBadge status={simulator.status} /></SheetTitle>
          <SheetDescription>{simulator.branchName} - {simulatorKind(simulator)}</SheetDescription>
        </SheetHeader>
        {hasSessionDetails || repairRequest ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {hasSessionDetails ? <Field label="Joriy foydalanuvchi" value={simulator.currentUser ?? "Sessiya yo'q"} /> : null}
            {hasSessionDetails ? <Field label="Tarif" value={sessionTariffLabel(simulator)} /> : null}
            {hasSessionDetails ? <Field label="Boshlangan" value={simulator.startedAt ?? "-"} /> : null}
            {hasSessionDetails ? <Field label={simulator.billingMode === "open" ? "O'tgan vaqt" : "Qolgan"} value={seconds(simulator.billingMode === "open" ? (simulator.elapsedSeconds ?? simulator.remainingSeconds ?? 0) : (simulator.remainingSeconds ?? simulator.remainingMinutes * 60))} /> : null}
            {hasSessionDetails ? <Field label="To'langan" value={money(simulator.paidAmount)} /> : null}
            {hasSessionDetails ? <Field label="To'lov" value={simulator.paymentStatus} /> : null}
            {repairRequest ? <Field label="Ta'mir holati" value={MAINTENANCE_STATUS_LABELS[repairRequest.reviewStatus] ?? repairRequest.reviewStatus} /> : null}
          </div>
        ) : null}
        {showRigDetails ? (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase text-slate-500">Rig texnik ma'lumotlari</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Device ID" value={simulator.deviceId} />
                <Field label="IP manzil" value={simulator.ipAddress} />
                <Field label="Rig ID" value={simulator.rigId} />
                <Field label="Rig versiyasi" value={`${simulator.rigVersion ?? "-"} / oxirgi ${simulator.rigLatestVersion ?? "-"}`} />
                <Field label="Rig host" value={simulator.rigHostname ?? "-"} />
                <Field label="Oxirgi ko'rilgan" value={simulator.rigLastSeen ? backendDateTime(simulator.rigLastSeen) : "-"} />
                {simulator.rigUpdateStatus ? <Field label="Yangilanish holati" value={simulator.rigUpdateStatus} /> : null}
              </div>
            </div>
          </>
        ) : null}
        {repairRequest ? (
          <>
            <Separator className="my-4" />
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">
              <div className="font-semibold text-slate-100">{repairRequest.title}</div>
              <div className="mt-1">{repairRequest.description}</div>
              <div className="mt-2 text-xs text-slate-500">{repairRequest.errorType} - {repairRequest.priority} - so'rovchi {repairRequest.requestedByName ?? repairRequest.requestedBy}</div>
            </div>
          </>
        ) : null}
        {simulator.orderItems.length ? (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase text-slate-500">Buyurtma mahsulotlari</div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">{simulator.orderItems.join(", ")}</div>
            </div>
          </>
        ) : null}
        {showSessionActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Sessiya amallari</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {canStartSession ? <Button onClick={() => onAction("start")}><FiPlay /> Boshlash</Button> : null}
              {canAddTime ? <Button variant="secondary" onClick={() => onAction("addTime")}><FiClock /> Vaqt qo'shish</Button> : null}
              {canTakePayment ? <Button variant="success" onClick={() => onAction("payment")}><FiCreditCard /> To'lov</Button> : null}
              {canStop ? <Button variant="destructive" onClick={() => onAction("stop")}><FiPower /> To'xtatish</Button> : null}
              {canOpenMaintenanceDuringSession ? <Button variant="warning" onClick={() => setSessionFixOpen(true)}><FiTool /> Sessiya vaqtida buzildi</Button> : null}
              {canToggleLock ? <Button variant="secondary" onClick={() => toggleLock(simulator.id)}><FiLock /> {simulator.status === "locked" ? "Qulfdan chiqarish" : "Qulflash / Ochish"}</Button> : null}
              {canOpenMaintenance ? <Button variant="warning" onClick={() => setFixOpen(true)}><FiTool /> Maintenance ochish</Button> : null}
            </div>
          </div>
        ) : null}
        {showRigActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Rig admin amallari</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {simulator.rigId && simulator.rigOnline ? <Button variant="secondary" onClick={() => notifyRig(simulator.id, "Hello")}><FiClock /> Xabar berish</Button> : null}
              {simulator.rigId && simulator.rigOnline ? <Button variant="success" onClick={() => availableRig(simulator.id)}><FiCheckCircle /> Bo'sh qilish</Button> : null}
              {simulator.rigId && simulator.rigOnline ? <Button variant="secondary" onClick={() => pushRigUpdate(simulator.id)}><FiTool /> Yangilanishni yuborish</Button> : null}
              {simulator.rigId && !simulator.rigOnline ? <Button variant="destructive" onClick={confirmRemoveOfflineRig}><FiXCircle /> Oflayn rigni o'chirish</Button> : null}
            </div>
          </div>
        ) : null}
        {showRepairActions ? (
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">Ta'mir jarayoni</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {canCloseMaintenance ? <Button variant="success" onClick={() => repairRequest?.openedDuringSession ? setCloseMaintenanceOpen(true) : closeMaintenance(simulator.id)}><FiCheckCircle /> Maintenance yopish</Button> : null}
              {repairRequest?.sessionId && repairRequest.sessionStatus === "paused" ? (
                <div className="flex gap-2 sm:col-span-2">
                  <Select value={transferTargetId} onValueChange={setTransferTargetId}>
                    <SelectTrigger><SelectValue placeholder="Bo'sh simulyatorni tanlang" /></SelectTrigger>
                    <SelectContent>{transferTargets.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="secondary" disabled={!canTransferToSelected} onClick={() => transferMaintenanceSession(repairRequest.id, transferTargetId)}><FiPlay /> Sessiyani ko'chirish</Button>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">Yopilgach mijoz sessiyasi qolgan vaqt bilan davom etadi. Ta'mir cho'zilishini bilsangiz, sessiyani istalgan payt bo'sh simulyatorga ko'chiring; maintenance vaqti super admin tekshiruviga darhol yuboriladi.</p>
          </div>
        ) : null}
        </SheetContent>
      </Sheet>
      <RequestFixDialog open={fixOpen} onOpenChange={setFixOpen} simulator={simulator} />
      <RequestFixDialog open={sessionFixOpen} onOpenChange={setSessionFixOpen} simulator={simulator} duringSession />
      <RequestFixDialog open={closeMaintenanceOpen} onOpenChange={setCloseMaintenanceOpen} simulator={simulator} closing repairRequest={repairRequest} />
    </>
  );
}
