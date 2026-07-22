"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { money, seconds } from "@/lib/format";
import { useBackendTariffs } from "@/lib/use-backend-tariffs";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { Simulator } from "@/types/simulator";

function Row({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm"><span className="text-slate-400">{label}</span><span className={danger ? "font-bold text-red-300" : "font-semibold text-slate-100"}>{value}</span></div>;
}

function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours} soat ${mins} daqiqa`;
  if (hours) return `${hours} soat`;
  return `${mins} daqiqa`;
}

export function StopSessionDialog({ open, onOpenChange, simulator, onTakePayment }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onTakePayment?: () => void }) {
  const { products, stopSession } = useDashboardStore();
  const tariffs = useBackendTariffs(simulator?.branchId, open);
  const tariff = tariffs.find((item) => item.name === simulator?.tariff);
  const shopItems = simulator?.orderItems.flatMap((item) => item.split(",").map((name) => name.trim()).filter(Boolean)) ?? [];
  const shop = shopItems.reduce((sum, name) => sum + (products.find((product) => product.name === name)?.price ?? 0), 0);
  // Open (VIP) sessions bill by elapsed time — the accrued amount grows live in the store.
  const isOpen = simulator?.billingMode === "open";
  const billingSegments = isOpen ? simulator?.billingSegments ?? [] : [];
  const sessionAmount = isOpen ? (simulator?.accruedAmount ?? 0) : (simulator?.sessionAmount ?? tariff?.price ?? 0);
  const addedTime = simulator?.addedTimeAmount ?? 0;
  const total = isOpen
    ? sessionAmount + addedTime + shop
    : (simulator?.totalAmount ?? (sessionAmount + addedTime + shop));
  const paid = simulator?.paidAmount ?? 0;
  const debt = Math.max(total - paid, 0);

  function submit(override = false) {
    if (!simulator) return;
    stopSession(simulator.id, override);
    onOpenChange(false);
  }

  function takePayment() {
    onOpenChange(false);
    onTakePayment?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sessiyani to'xtatish</DialogTitle>
          <DialogDescription>{simulator?.name} uchun yakuniy hisob-kitob va to'lov nazorati.</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <Label>Hisob-kitob</Label>
          <Row label="Mijoz" value={simulator?.currentUser ?? "Mehmon"} />
          <Row label="Boshlangan vaqt" value={simulator?.startedAt ?? "-"} />
          <Row label="Tugagan vaqt" value={new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })} />
          {isOpen ? <Row label="O'tgan vaqt" value={seconds(simulator?.elapsedSeconds ?? simulator?.remainingSeconds ?? 0)} /> : null}
          {isOpen ? <Row label="Soatlik stavka" value={`${money(simulator?.hourlyRate ?? 0)}/soat`} /> : null}
          <Row label={isOpen ? "Vaqt to'lovi (VIP)" : "Tarif summasi"} value={money(sessionAmount)} />
          {!isOpen && addedTime > 0 ? <Row label="Qo'shilgan vaqt" value={money(addedTime)} /> : null}
          <Row label="Do'kon xaridlari" value={money(shop)} />
          <Row label="Jami" value={money(total)} />
          <Row label="Avval to'langan" value={money(paid)} />
          <Row label="To'lanadi" value={money(debt)} danger={debt > 0} />
        </div>
        {billingSegments.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <Label>Tarif bo'yicha hisob</Label>
            <div className="mt-3 space-y-2">
              {billingSegments.map((segment, index) => (
                <div key={`${segment.from}-${segment.until}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-white">{segment.from} - {segment.until}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">{segment.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-sky-200">{money(segment.amount)}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">{money(segment.hourlyPrice)}/soat</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-500">{minutesLabel(segment.minutes)} hisoblandi</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {debt > 0 ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">To'lanmagan summa bor. Yakuniy to'xtatishdan oldin to'lovni qabul qiling yoki admin huquqi bilan majburiy to'xtating.</div> : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          {debt > 0 ? <Button variant="warning" onClick={takePayment}>To'lovni qabul qilish</Button> : null}
          <Button variant={debt > 0 ? "destructive" : "default"} onClick={() => submit(true)}>{debt > 0 ? "Admin huquqi bilan to'xtatish" : "Sessiyani to'xtatish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
