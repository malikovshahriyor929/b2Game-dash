"use client";

import { useEffect, useState } from "react";
import { backendGet } from "@/server/api";

export type BackendTariff = {
  id: string;
  name: string;
  type: string;
  simulatorZone: "main" | "vip" | "all";
  durationMinutes: number;
  price: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  bonus?: string;
  isWeekend?: boolean;
};

export function useBackendTariffs() {
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);

  useEffect(() => {
    void backendGet<Array<Record<string, unknown>>>("/tariffs?branch_id=all")
      .then((rows) => {
        const seen = new Set<string>();
        const mapped = rows.map((row) => ({
          id: String(row.id),
          name: String(row.name ?? ""),
          type: String(row.type ?? row.simulator_zone ?? ""),
          simulatorZone: String(row.simulator_zone ?? "all") as BackendTariff["simulatorZone"],
          durationMinutes: Number(row.duration_minutes ?? 0),
          price: Number(row.price ?? 0),
          weekdayPrice: row.weekday_price == null ? undefined : Number(row.weekday_price),
          weekendPrice: row.weekend_price == null ? undefined : Number(row.weekend_price),
          bonus: row.bonus == null ? undefined : String(row.bonus),
          isWeekend: Boolean(row.is_weekend),
        })).filter((item) => {
          const key = `${item.simulatorZone}:${item.name}:${item.durationMinutes}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setTariffs(mapped);
      })
      .catch(() => undefined);
  }, []);

  return tariffs;
}
