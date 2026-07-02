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
  isHappyHour?: boolean;
  isAvailable?: boolean;
  availableDays?: number[];
  availableFrom?: string;
  availableUntil?: string;
  availabilityLabel?: string;
  pricePeriod?: "weekday" | "evening" | "weekend" | "happy_hour";
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
    isHappyHour: Boolean(row.is_happy_hour),
    isAvailable: row.is_available == null ? undefined : Boolean(row.is_available),
    availableDays: Array.isArray(row.available_days) ? row.available_days.map(Number) : undefined,
    availableFrom: row.available_from == null ? undefined : String(row.available_from),
    availableUntil: row.available_until == null ? undefined : String(row.available_until),
    availabilityLabel: row.availability_label == null ? undefined : String(row.availability_label),
    pricePeriod: row.price_period == null ? undefined : String(row.price_period) as BackendTariff["pricePeriod"],
  };
}

export function dedupeTariffs(tariffs: BackendTariff[]) {
  const seen = new Set<string>();
  return tariffs.filter((item) => {
    const dayKey = item.availableDays?.join(",") ?? "";
    const key = `${item.simulatorZone}:${item.type}:${item.name.trim().toLowerCase()}:${item.durationMinutes}:${dayKey}:${item.availableFrom ?? ""}:${item.availableUntil ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function tariffPricePeriodLabel(item: BackendTariff) {
  if (item.availabilityLabel) return item.availabilityLabel;
  if (item.isHappyHour || item.pricePeriod === "happy_hour") return "Skidka · Dush–Pay 10:00–17:00";
  if (item.pricePeriod === "evening" || item.isEvening) return "17:00–03:00";
  if (item.pricePeriod === "weekend" || item.isWeekend) return "Juma–Yakshanba";
  return "Dushanba–Payshanba";
}

export function formatTariffOptionLabel(item: BackendTariff) {
  const bonus = item.bonus ? ` + ${item.bonus}` : "";
  // VIP tariffs are open/hourly — show the rate per hour.
  const suffix = item.type.toLowerCase() === "vip" ? "/soat" : "";
  // Happy hour: chegirma narxini ko'rsatamiz (eski narx ustidan).
  if (item.isHappyHour) {
    return `${item.name} — ${money(item.price)}${suffix} (skidka)${bonus}`;
  }
  return `${item.name} — ${money(item.price)}${suffix}${bonus} (${tariffPricePeriodLabel(item)})`;
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
