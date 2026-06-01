"use client";

import { FiPackage, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/format";
import { Product } from "@/types/product";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex h-24 items-center justify-center bg-slate-800/70 text-3xl text-sky-200"><FiPackage /></div>
      <div className="space-y-2 p-3">
        <div className="min-h-10 text-sm font-semibold text-white">{product.name}</div>
        <div className="flex items-center justify-between"><span className="font-black text-sky-200">{money(product.price)}</span><Badge variant="muted">{product.stock}</Badge></div>
        <Button size="sm" className="w-full" onClick={onAdd}><FiPlus /> Add</Button>
      </div>
    </Card>
  );
}
