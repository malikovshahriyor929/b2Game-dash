"use client";

import { useEffect, useState } from "react";
import { backendGet } from "@/server/api";

export type CustomerTypeOption = {
  label: string;
  value: "Guest" | "Registered";
  enabled?: boolean;
};

export type PaymentModeOption = {
  label: string;
  value: "paid" | "unpaid";
  enabled?: boolean;
};

type StartSessionOptions = {
  customerTypes: CustomerTypeOption[];
  paymentModes: PaymentModeOption[];
};

const fallbackStartSessionOptions: StartSessionOptions = {
  customerTypes: [
    { label: "Guest", value: "Guest", enabled: true },
    { label: "Registered user", value: "Registered", enabled: true },
  ],
  paymentModes: [
    { label: "Prepaid", value: "paid", enabled: true },
    { label: "Postpaid", value: "unpaid", enabled: true },
  ],
};

function uniqueOptions<T extends { value: string; enabled?: boolean }>(options: T[], fallback: T[], allowedValues: Set<string>) {
  const seen = new Set<string>();
  const active = options.filter((item) => {
    if (item.enabled === false) return false;
    if (!allowedValues.has(item.value)) return false;
    if (seen.has(item.value)) return false;
    seen.add(item.value);
    return true;
  });
  return active.length ? active : fallback;
}

export function useStartSessionOptions(branchId?: string, enabled = true) {
  const [options, setOptions] = useState<StartSessionOptions>(fallbackStartSessionOptions);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const query = branchId && branchId !== "all" ? `?branch_id=${encodeURIComponent(branchId)}` : "";
    backendGet<StartSessionOptions>(`/settings/start-session-options${query}`)
      .then((rows) => {
        if (cancelled) return;
        setOptions({
          customerTypes: uniqueOptions(rows.customerTypes ?? [], fallbackStartSessionOptions.customerTypes, new Set(["Guest", "Registered"])),
          paymentModes: uniqueOptions(rows.paymentModes ?? [], fallbackStartSessionOptions.paymentModes, new Set(["paid", "unpaid"])),
        });
      })
      .catch(() => {
        if (!cancelled) setOptions(fallbackStartSessionOptions);
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, enabled]);

  return options;
}
