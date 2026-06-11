"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { backendGet } from "@/server/api";

export type BackendTariff = {
  id: string;
  name: string;
  type: string;
  branchId?: string;
  simulatorZone: "main" | "vip" | "all";
  durationMinutes: number;
  price: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  weekdayBonus?: string;
  weekendBonus?: string;
  bonus?: string;
  isWeekend?: boolean;
  isEvening?: boolean;
  pricePeriod?: "weekday" | "evening" | "weekend";
};

export function mapTariffRow(row: Record<string, unknown>): BackendTariff {
  const weekdayPrice = row.weekday_price == null ? undefined : Number(row.weekday_price);
  const weekendPrice = row.weekend_price == null ? undefined : Number(row.weekend_price);
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    type: String(row.type ?? ""),
    branchId: row.branch_id == null ? undefined : String(row.branch_id),
    simulatorZone: String(row.simulator_zone ?? "all") as BackendTariff["simulatorZone"],
    durationMinutes: Number(row.duration_minutes ?? 0),
    price: Number(row.price ?? weekendPrice ?? weekdayPrice ?? 0),
    weekdayPrice,
    weekendPrice,
    weekdayBonus: row.weekday_bonus == null ? undefined : String(row.weekday_bonus),
    weekendBonus: row.weekend_bonus == null ? undefined : String(row.weekend_bonus),
    bonus: row.bonus == null ? undefined : String(row.bonus),
    isWeekend: Boolean(row.is_weekend),
    isEvening: Boolean(row.is_evening),
    pricePeriod: row.price_period == null ? undefined : String(row.price_period) as BackendTariff["pricePeriod"],
  };
}

export function dedupeTariffs(tariffs: BackendTariff[]) {
  const seen = new Set<string>();
  return tariffs.filter((item) => {
    const key = `${item.simulatorZone}:${item.type}:${item.name.trim().toLowerCase()}:${item.durationMinutes}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function tariffPricePeriodLabel(item: BackendTariff) {
  if (item.pricePeriod === "weekend" || item.isWeekend) return "Juma-Yakshanba";
  if (item.pricePeriod === "evening" || item.isEvening) return "Kechki";
  return "PN-CHT";
}

export function formatTariffOptionLabel(item: BackendTariff) {
  const bonus = item.bonus ? ` + ${item.bonus}` : "";
  // VIP tariffs are open/hourly — show the rate per hour.
  const suffix = item.type.toLowerCase() === "vip" ? "/soat" : "";
  if (item.weekdayPrice != null && item.weekendPrice != null && item.weekdayPrice !== item.weekendPrice) {
    return `${item.name} — ${money(item.weekdayPrice)}${suffix} / ${money(item.weekendPrice)}${suffix}${bonus}`;
  }
  return `${item.name} — ${money(item.price)}${suffix}${bonus}`;
}

export function useBackendTariffs(branchId?: string, enabled = true) {
  const queryBranchId = branchId && branchId !== "all" ? branchId : "all";
  const [tariffs, setTariffs] = useState<BackendTariff[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const query = `branch_id=${encodeURIComponent(queryBranchId)}`;
    void backendGet<Array<Record<string, unknown>>>(`/tariffs?${query}`)
      .then((rows) => {
        const mapped = rows.map(mapTariffRow);
        setTariffs(dedupeTariffs(mapped));
      })
      .catch(() => undefined);
  }, [enabled, queryBranchId]);

  return tariffs;
}
