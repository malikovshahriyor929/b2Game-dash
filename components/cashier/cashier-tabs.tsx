"use client";

import { useState } from "react";
import { ProductCard } from "@/components/cashier/product-card";
import { OrderPanel } from "@/components/cashier/order-panel";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from "@/components/providers/dashboard-store";

const cats = ["Barchasi", "Paketlar", "Ichimliklar", "Snack", "Fast food", "Energy drink", "Merch", "Promo"];

export function CashierTabs() {
  const { products, addProduct } = useDashboardStore();
  const [category, setCategory] = useState("Barchasi");
  const visible = products.filter((item) => category === "Barchasi" || item.category === category);
  return (
    <div className="grid h-[calc(100vh-156px)] grid-cols-[minmax(0,1fr)_360px] gap-4">
      <div className="min-w-0">
        <Tabs defaultValue="shop">
          <TabsList><TabsTrigger value="shop">Do'kon</TabsTrigger><TabsTrigger value="balance">Balans to'ldirish</TabsTrigger><TabsTrigger value="return">Qaytim</TabsTrigger><TabsTrigger value="post">Post-payment</TabsTrigger><TabsTrigger value="session">Sessiya to'lovi</TabsTrigger></TabsList>
          <TabsContent value="shop">
            <div className="mb-3 flex gap-2 overflow-auto pb-1 thin-scrollbar">{cats.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${category === item ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>{item}</button>)}</div>
            <Input className="mb-3 max-w-md" placeholder="Search product..." />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{visible.map((item) => <ProductCard key={item.id} product={item} onAdd={() => addProduct(item)} />)}</div>
          </TabsContent>
          {["balance", "return", "post", "session"].map((tab) => <TabsContent key={tab} value={tab}><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">Compact cashier form with customer, amount, payment method, save and pay controls.</div></TabsContent>)}
        </Tabs>
      </div>
      <OrderPanel />
    </div>
  );
}
