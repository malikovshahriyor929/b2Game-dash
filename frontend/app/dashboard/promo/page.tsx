"use client";

import { useEffect, useState } from "react";
import { FiGift } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { backendGet } from "@/server/api";

type Promo = { id: string; name: string; status: "Active" | "Inactive" };

const PROMO_STATUS_LABELS: Record<Promo["status"], string> = {
  Active: "Faol",
  Inactive: "Nofaol",
};

export default function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    void backendGet<Array<{ key: string; value: unknown }>>("/settings?branch_id=all")
      .then((rows) => {
        const setting = rows.find((row) => row.key === "promos");
        setPromos(Array.isArray(setting?.value) ? setting.value as Promo[] : []);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <PageHeader title="Promo" description="Promo kodlar, paketlar, tug'ilgan kun va tungi takliflar." />
      {promos.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {promos.map((item) => (
            <Card key={item.id} className="p-4">
              <FiGift className="mb-4 text-2xl text-amber-300" />
              <div className="font-bold">{item.name}</div>
              <Badge className="mt-3" variant={item.status === "Active" ? "warning" : "muted"}>{PROMO_STATUS_LABELS[item.status]}</Badge>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-slate-400">Promo ma&apos;lumotlari hali yo&apos;q.</Card>
      )}
    </div>
  );
}
