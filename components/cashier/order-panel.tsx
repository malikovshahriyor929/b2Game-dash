"use client";

import { useState } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { money } from "@/lib/format";
import { useDashboardStore } from "@/components/providers/dashboard-store";

export function OrderPanel() {
  const { order, updateQty, clearOrder, payOrder, simulators } = useDashboardStore();
  const [attachTarget, setAttachTarget] = useState("general");
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
  const active = simulators.filter((item) => ["busy", "unpaid"].includes(item.status));
  const attachId = active.some((item) => item.id === attachTarget) ? attachTarget : undefined;

  function submitPayment() {
    payOrder(attachId);
  }

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Current order</CardTitle></CardHeader>
      <CardContent className="flex h-[calc(100%-72px)] flex-col gap-3">
        <div className="min-h-0 flex-1 space-y-2 overflow-auto thin-scrollbar">
          {order.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">Order empty</div> : null}
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
          <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><b>{money(total)}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">Discount</span><b>{money(0)}</b></div>
          <div className="flex justify-between text-lg"><span>Total</span><b className="text-sky-200">{money(total)}</b></div>
        </div>
        <Select value={attachTarget} onValueChange={setAttachTarget}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General sale</SelectItem>
            {active.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} session</SelectItem>)}
            <SelectItem value="user">Registered user</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Naqd", "Karta", "QR", "Balans", "Aralash"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <div className="grid gap-2 sm:grid-cols-3"><Button variant="secondary">Save</Button><Button onClick={submitPayment} disabled={!order.length}>Pay</Button><Button variant="destructive" onClick={clearOrder} disabled={!order.length}>Clear</Button></div>
      </CardContent>
    </Card>
  );
}
