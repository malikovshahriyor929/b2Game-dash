"use client";

import { useEffect, useState } from "react";
import { FiGift } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { backendGet } from "@/lib/backend-client";

type Promo = { id: string; name: string; status: "Active" | "Inactive" };

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
      <PageHeader title="Promo" description="Promo codes, packages, birthday and night offers." />
      {promos.length ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {promos.map((item) => (
            <Card key={item.id} className="p-4">
              <FiGift className="mb-4 text-2xl text-amber-300" />
              <div className="font-bold">{item.name}</div>
              <Badge className="mt-3" variant={item.status === "Active" ? "warning" : "muted"}>{item.status}</Badge>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-slate-400">Promo data backendda hali yo'q.</Card>
      )}
    </div>
  );
}
