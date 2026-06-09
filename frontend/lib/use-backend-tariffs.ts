"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
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
  weekdayBonus?: string;
  weekendBonus?: string;
  bonus?: string;
  isWeekend?: boolean;
};

export function mapTariffRow(row: Record<string, unknown>): BackendTariff {
  const weekdayPrice = row.weekday_price == null ? undefined : Number(row.weekday_price);
  const weekendPrice = row.weekend_price == null ? undefined : Number(row.weekend_price);
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    type: String(row.type ?? ""),
    simulatorZone: String(row.simulator_zone ?? "all") as BackendTariff["simulatorZone"],
    durationMinutes: Number(row.duration_minutes ?? 0),
    price: Number(row.price ?? weekendPrice ?? weekdayPrice ?? 0),
    weekdayPrice,
    weekendPrice,
    weekdayBonus: row.weekday_bonus == null ? undefined : String(row.weekday_bonus),
    weekendBonus: row.weekend_bonus == null ? undefined : String(row.weekend_bonus),
    bonus: row.bonus == null ? undefined : String(row.bonus),
    isWeekend: Boolean(row.is_weekend),
  };
}

export function dedupeTariffs(tariffs: BackendTariff[]) {
  const seen = new Set<string>();
  return tariffs.filter((item) => {
    const key = `${item.simulatorZone}:${item.name}:${item.durationMinutes}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatTariffOptionLabel(item: BackendTariff) {
  const bonus = item.bonus ? ` + ${item.bonus}` : "";
  if (item.weekdayPrice != null && item.weekendPrice != null && item.weekdayPrice !== item.weekendPrice) {
    return `${item.name} — ${money(item.weekdayPrice)} / ${money(item.weekendPrice)}${bonus}`;
  }
  return `${item.name} — ${money(item.price)}${bonus}`;
}

export function useBackendTariffs(branchId?: string) {
  const queryBranchId = branchId && branchId !== "all" ? branchId : "all";
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);

  useEffect(() => {
    const query = `branch_id=${encodeURIComponent(queryBranchId)}`;
    void backendGet<Array<Record<string, unknown>>>(`/tariffs?${query}`)
      .then((rows) => {
        const mapped = rows.map(mapTariffRow);
        setTariffs(queryBranchId === "all" ? dedupeTariffs(mapped) : mapped);
      })
      .catch(() => undefined);
  }, [queryBranchId]);

  return tariffs;
}
