"use client";

import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/format";
import { Product } from "@/types/product";
import { ProductIcon } from "@/lib/product-icons";
import { getProductImageByKey, getProductImageByName } from "@/lib/product-images";

export function ProductCard({ product, onAdd, onEdit, onDelete }: { product: Product; onAdd: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageByKey(product.icon) || getProductImageByName(product.name) || product.imageUrl;
  const showImage = Boolean(imageUrl && !imageFailed);

  return (
    <Card className="group overflow-hidden">
      <div className="relative h-32 overflow-hidden bg-slate-800/70 sm:h-36">
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#1f3b53,transparent_55%),linear-gradient(135deg,#0f172a,#020617)] text-4xl text-sky-200">
            <ProductIcon iconKey={product.icon} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/95 to-transparent" />
        <div className="absolute left-3 top-3 max-w-[70%] truncate rounded-full border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
          {product.category}
        </div>
        <Badge className="absolute right-3 top-3" variant={product.stock > 0 ? "success" : "destructive"}>{product.stock}</Badge>
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          {onEdit ? <Button size="icon" variant="secondary" className="h-8 w-8 bg-slate-950/80 backdrop-blur" aria-label={`${product.name} tahrirlash`} onClick={onEdit}><FiEdit2 /></Button> : null}
          {onDelete ? <Button size="icon" variant="destructive" className="h-8 w-8" aria-label={`${product.name} o'chirish`} onClick={onDelete}><FiTrash2 /></Button> : null}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="min-h-10 text-sm font-semibold text-white">{product.name}</div>
        <div className="truncate rounded-lg bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-400">{product.qrCode}</div>
        <div className="font-black text-sky-200">{money(product.price)}</div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span>Cost: {money(product.cost ?? 0)}</span>
          <span>Profit: {money(product.price - (product.cost ?? 0))}</span>
        </div>
        <Button size="sm" className="w-full" disabled={product.stock <= 0} onClick={onAdd}><FiPlus /> Add</Button>
      </div>
    </Card>
  );
}
