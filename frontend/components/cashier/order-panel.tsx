"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiMinus, FiPlus, FiSearch, FiTrash2, FiUser, FiUserCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeletons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { money } from "@/lib/format";
import { usePaymentMethods } from "@/lib/use-payment-methods";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { backendGet } from "@/server/api";

type CustomerRow = {
  id: string;
  name: string;
  phone?: string | null;
  balance?: number | string | null;
  sessions_count?: number | string | null;
  branch_id?: string | null;
};

type ActiveSessionRow = {
  customer_id?: string | null;
  customer_name?: string | null;
  simulator_id?: string | null;
};

type PayStep = "type" | "registered";

export function OrderPanel() {
  const { order, updateQty, clearOrder, payOrder, simulators } = useDashboardStore();
  const paymentMethods = usePaymentMethods();
  const [attachTarget, setAttachTarget] = useState("general");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const [cashReceived, setCashReceived] = useState("");
  const [mixedCash, setMixedCash] = useState("0");
  const [mixedCashReceived, setMixedCashReceived] = useState("");
  const [mixedCard, setMixedCard] = useState("0");
  const [mixedBalance, setMixedBalance] = useState("0");
  const [payOpen, setPayOpen] = useState(false);
  const [payStep, setPayStep] = useState<PayStep>("type");
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [onlineCustomerIds, setOnlineCustomerIds] = useState<Set<string>>(new Set());
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
  const active = simulators.filter((item) => ["busy", "unpaid"].includes(item.status));
  const attachId = active.some((item) => item.id === attachTarget) ? attachTarget : undefined;
  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId);
  const selectedCustomerBalance = Number(selectedCustomer?.balance ?? 0);
  const paymentValue = paymentMethods.find((item) => item.label === paymentMethod)?.value ?? "card";
  const registeredBalanceInvalid = paymentValue === "balance" && selectedCustomerBalance < total;
  const cashReceivedAmount = Number(cashReceived || 0);
  const cashChange = Math.max(cashReceivedAmount - total, 0);
  const mixedCashAmount = Number(mixedCash || 0);
  const mixedCardAmount = Number(mixedCard || 0);
  const mixedBalanceAmount = Number(mixedBalance || 0);
  const mixedTotal = mixedCashAmount + mixedCardAmount + mixedBalanceAmount;
  const mixedReceivedAmount = Number(mixedCashReceived || 0);
  const mixedChange = Math.max(mixedReceivedAmount - mixedCashAmount, 0);
  const cashInvalid = paymentValue === "cash" && cashReceivedAmount < total;
  const mixedInvalid = paymentValue === "mixed" && (mixedTotal !== total || mixedReceivedAmount < mixedCashAmount);
  const paymentInvalid = cashInvalid || mixedInvalid;

  const sortedCustomers = useMemo(() => {
    const text = customerQuery.trim().toLowerCase();
    return [...customers]
      .filter((item) => `${item.name} ${item.phone ?? ""}`.toLowerCase().includes(text))
      .sort((a, b) => {
        const aOnline = onlineCustomerIds.has(a.id);
        const bOnline = onlineCustomerIds.has(b.id);
        if (aOnline !== bOnline) return aOnline ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [customerQuery, customers, onlineCustomerIds]);

  useEffect(() => {
    if (!payOpen || payStep !== "registered") return;
    let cancelled = false;

    async function loadCustomers() {
      setLoadingCustomers(true);
      try {
        const [customerRows, sessionRows] = await Promise.all([
          backendGet<CustomerRow[]>("/customers?branch_id=all"),
          backendGet<ActiveSessionRow[]>("/sessions/active?branch_id=all"),
        ]);
        if (cancelled) return;
        setCustomers(customerRows);
        setOnlineCustomerIds(new Set(sessionRows.map((item) => item.customer_id).filter(Boolean) as string[]));
      } catch {
        if (!cancelled) {
          setCustomers([]);
          setOnlineCustomerIds(new Set());
        }
      } finally {
        if (!cancelled) setLoadingCustomers(false);
      }
    }

    void loadCustomers();
    return () => {
      cancelled = true;
    };
  }, [payOpen, payStep]);

  useEffect(() => {
    if (!paymentMethods.some((item) => item.label === paymentMethod)) {
      setPaymentMethod(paymentMethods[0]?.label ?? "Karta");
    }
  }, [paymentMethod, paymentMethods]);

  function resetPayFlow() {
    setPayStep("type");
    setCustomerQuery("");
    setSelectedCustomerId(null);
    setCashReceived("");
    setMixedCash("0");
    setMixedCashReceived("");
    setMixedCard("0");
    setMixedBalance("0");
  }

  function submitPayment(customerId?: string) {
    if (paymentInvalid) return;
    if (paymentValue === "balance" && !customerId) return;
    const payload =
      paymentValue === "cash"
        ? { cash_amount: total, card_amount: 0, qr_amount: 0, balance_amount: 0, received_amount: cashReceivedAmount, change_amount: cashChange }
        : paymentValue === "balance"
          ? { cash_amount: 0, card_amount: 0, qr_amount: 0, balance_amount: total }
        : paymentValue === "mixed"
          ? { cash_amount: mixedCashAmount, card_amount: mixedCardAmount, qr_amount: 0, balance_amount: mixedBalanceAmount, received_amount: mixedReceivedAmount || mixedCashAmount, change_amount: mixedChange }
          : undefined;
    payOrder(attachId, paymentMethod, customerId, payload);
    setPayOpen(false);
    resetPayFlow();
  }

  function paymentFields() {
    if (paymentValue === "cash") {
      return (
        <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Mijoz berdi</div>
            <Input className="mt-2" inputMode="numeric" value={cashReceived} onChange={(event) => setCashReceived(event.target.value.replace(/\D/g, ""))} placeholder="50 000" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Qaytim</div>
            <div className={`mt-2 rounded-lg border px-3 py-2 text-lg font-black ${cashInvalid ? "border-red-500/40 text-red-300" : "border-slate-800 text-emerald-200"}`}>{money(cashChange)}</div>
          </div>
        </div>
      );
    }
    if (paymentValue === "mixed") {
      return (
        <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:grid-cols-2">
          <Input inputMode="numeric" value={mixedCash} onChange={(event) => setMixedCash(event.target.value.replace(/\D/g, ""))} placeholder="Naqd" />
          <Input inputMode="numeric" value={mixedCard} onChange={(event) => setMixedCard(event.target.value.replace(/\D/g, ""))} placeholder="Karta" />
          <Input inputMode="numeric" value={mixedBalance} onChange={(event) => setMixedBalance(event.target.value.replace(/\D/g, ""))} placeholder="Balans" />
          <Input inputMode="numeric" value={mixedCashReceived} onChange={(event) => setMixedCashReceived(event.target.value.replace(/\D/g, ""))} placeholder="Naqd berilgan summa" />
          <div className={`text-sm font-semibold ${mixedInvalid ? "text-amber-300" : "text-emerald-300"}`}>Aralash total: {money(mixedTotal)} · Qaytim: {money(mixedChange)}</div>
        </div>
      );
    }
    return null;
  }

  return (
    <Card className="flex flex-col overflow-hidden xl:sticky xl:top-0 xl:h-[calc(100dvh-112px)] xl:max-h-[calc(100dvh-112px)]">
      <CardHeader><CardTitle>Joriy buyurtma</CardTitle></CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-[132px] flex-1 space-y-2 overflow-auto thin-scrollbar">
          {order.length === 0 ? <div className="flex min-h-[112px] items-center justify-center rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">Buyurtma bo&apos;sh</div> : null}
          {order.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-950/70 p-3">
              <div className="flex justify-between gap-2"><div className="font-semibold">{item.name}</div><button onClick={() => updateQty(item.id, 0)}><FiTrash2 className="text-red-300" /></button></div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>{money(item.price)}</span>
                <div className="flex items-center gap-2"><Button size="icon" variant="secondary" onClick={() => updateQty(item.id, item.qty - 1)}><FiMinus /></Button><span>{item.qty}</span><Button size="icon" variant="secondary" onClick={() => updateQty(item.id, item.qty + 1)}><FiPlus /></Button></div>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Oraliq jami</span><b>{money(total)}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">Chegirma</span><b>{money(0)}</b></div>
          <div className="flex justify-between text-lg"><span>Jami</span><b className="text-sky-200">{money(total)}</b></div>
        </div>
        <Select value={attachTarget} onValueChange={setAttachTarget}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Umumiy savdo</SelectItem>
            {active.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} sessiyasi</SelectItem>)}
            <SelectItem value="user">Ro&apos;yxatdan o&apos;tgan mijoz</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{paymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
        {paymentFields()}
        <div className="grid gap-2 sm:grid-cols-3"><Button variant="secondary">Saqlash</Button><Button onClick={() => setPayOpen(true)} disabled={!order.length || paymentInvalid}>To&apos;lash</Button><Button variant="destructive" onClick={clearOrder} disabled={!order.length}>Tozalash</Button></div>
      </CardContent>
      <Dialog open={payOpen} onOpenChange={(open) => {
        setPayOpen(open);
        if (!open) resetPayFlow();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buyurtma to&apos;lovi</DialogTitle>
            <DialogDescription>Avval mijoz turini tanlang, keyin to'lovni yakunlang.</DialogDescription>
          </DialogHeader>

          {payStep === "type" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-left transition hover:border-sky-400 hover:bg-sky-500/10"
                onClick={() => submitPayment()}
                disabled={paymentValue === "balance"}
              >
                <div className="flex items-center gap-3 text-lg font-black text-white"><FiUser /> Mehmon</div>
                <div className="mt-2 text-sm text-slate-400">Mijoz ro'yxatidan tanlanmaydi. To'lov darhol yakunlanadi.</div>
                <div className="mt-3 text-xs font-semibold text-slate-500">To'lov: {paymentMethod}</div>
                {paymentValue === "balance" ? <div className="mt-2 text-xs font-semibold text-red-300">Balans bilan to'lash uchun ro'yxatdan o'tgan mijoz tanlang.</div> : null}
                {paymentValue === "cash" ? <div className="mt-2 text-xs font-semibold text-emerald-200">Berdi: {money(cashReceivedAmount)} · Qaytim: {money(cashChange)}</div> : null}
                <div className="mt-4 text-2xl font-black text-sky-200">{money(total)}</div>
              </button>
              <button
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setPayStep("registered")}
              >
                <div className="flex items-center gap-3 text-lg font-black text-white"><FiUserCheck /> Ro&apos;yxatdan o&apos;tgan</div>
                <div className="mt-2 text-sm text-slate-400">Online mijozlar birinchi chiqadi, keyin offline mijozlar.</div>
                <div className="mt-4 text-2xl font-black text-emerald-200">{money(total)}</div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-xs font-semibold uppercase text-slate-500">Tanlangan mijoz balansi</div>
                  <div className={`mt-1 text-2xl font-black ${registeredBalanceInvalid ? "text-red-300" : "text-sky-200"}`}>
                    {selectedCustomer ? money(selectedCustomerBalance) : "Mijoz tanlanmagan"}
                  </div>
                  {registeredBalanceInvalid ? <div className="mt-1 text-xs font-semibold text-red-300">Balans yetarli emas.</div> : null}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-slate-500">To&apos;lov</div>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{paymentMethods.map((item) => <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {paymentFields()}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9" value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Mijoz ismi yoki telefon..." autoFocus />
              </div>
              <div className="max-h-[320px] space-y-2 overflow-auto pr-1 thin-scrollbar">
                {loadingCustomers ? <ListSkeleton rows={4} /> : null}
                {!loadingCustomers && !sortedCustomers.length ? <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm font-semibold text-slate-500">Mijoz topilmadi</div> : null}
                {sortedCustomers.map((customer) => {
                  const online = onlineCustomerIds.has(customer.id);
                  const selected = selectedCustomerId === customer.id;
                  return (
                    <button
                      key={customer.id}
                      className={`w-full rounded-xl border p-3 text-left transition ${selected ? "border-sky-400 bg-sky-500/15" : "border-slate-800 bg-slate-950/70 hover:border-slate-600"}`}
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-bold text-white">{customer.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{customer.phone ?? "Telefon yo'q"} · {Number(customer.sessions_count ?? 0)} sessiya</div>
                        </div>
                        <Badge variant={online ? "success" : "muted"}>{online ? "Onlayn" : "Oflayn"}</Badge>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-sky-200">Balans: {money(Number(customer.balance ?? 0))}</div>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <Button variant="secondary" onClick={() => setPayStep("type")}>Orqaga</Button>
                <Button variant="outline" onClick={() => submitPayment()} disabled={paymentInvalid || paymentValue === "balance"}>Mehmon sifatida to&apos;lash</Button>
                <Button onClick={() => selectedCustomerId && submitPayment(selectedCustomerId)} disabled={!selectedCustomerId || registeredBalanceInvalid || paymentInvalid}>
                  <FiCheckCircle /> To'lash{selectedCustomer ? ` - ${selectedCustomer.name}` : ""}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
