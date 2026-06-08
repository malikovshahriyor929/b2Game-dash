"use client";

import { useEffect, useState } from "react";
import { backendGet } from "@/lib/backend-client";

export type BackendTariff = { id: string; name: string; type: string; price: number };

export function useBackendTariffs() {
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);

  useEffect(() => {
    void backendGet<Array<Record<string, unknown>>>("/tariffs?branch_id=all")
      .then((rows) => setTariffs(rows.map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        type: String(row.type ?? row.simulator_zone ?? ""),
        price: Number(row.price ?? 0),
      }))))
      .catch(() => undefined);
  }, []);

  return tariffs;
}
