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

export function StopSessionDialog({ open, onOpenChange, simulator, onTakePayment }: { open: boolean; onOpenChange: (open: boolean) => void; simulator?: Simulator; onTakePayment?: () => void }) {
  const { products, stopSession } = useDashboardStore();
  const tariffs = useBackendTariffs(simulator?.branchId, open);
  const tariff = tariffs.find((item) => item.name === simulator?.tariff);
  const shopItems = simulator?.orderItems.flatMap((item) => item.split(",").map((name) => name.trim()).filter(Boolean)) ?? [];
  const shop = shopItems.reduce((sum, name) => sum + (products.find((product) => product.name === name)?.price ?? 0), 0);
  // Open (VIP) sessions bill by elapsed time — the accrued amount grows live in the store.
  const isOpen = simulator?.billingMode === "open";
  const sessionAmount = isOpen ? (simulator?.accruedAmount ?? 0) : (tariff?.price ?? 0);
  const total = sessionAmount + shop;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stop session</DialogTitle>
          <DialogDescription>Final calculation and payment control for {simulator?.name}.</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <Label>Calculation</Label>
          <Row label="Customer" value={simulator?.currentUser ?? "Guest"} />
          <Row label="Started time" value={simulator?.startedAt ?? "-"} />
          <Row label="Finished time" value={new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })} />
          {isOpen ? <Row label="O'tgan vaqt" value={seconds(simulator?.elapsedSeconds ?? simulator?.remainingSeconds ?? 0)} /> : null}
          {isOpen ? <Row label="Soatlik stavka" value={`${money(simulator?.hourlyRate ?? 0)}/soat`} /> : null}
          <Row label={isOpen ? "Vaqt to'lovi (VIP)" : "Tariff amount"} value={money(sessionAmount)} />
          <Row label="Shop purchases" value={money(shop)} />
          <Row label="Total" value={money(total)} />
          <Row label="Already paid" value={money(paid)} />
          <Row label="Remaining debt" value={money(debt)} danger={debt > 0} />
        </div>
        {debt > 0 ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">Unpaid amount exists. Take payment before final stop, or use admin override.</div> : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          {debt > 0 ? <Button variant="warning" onClick={takePayment}>Take payment</Button> : null}
          <Button variant={debt > 0 ? "destructive" : "default"} onClick={() => submit(true)}>{debt > 0 ? "Admin override stop" : "Stop session"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
