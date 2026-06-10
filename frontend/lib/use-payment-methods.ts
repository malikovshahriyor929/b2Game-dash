"use client";

import { useEffect, useState } from "react";
import { backendGet } from "@/server/api";

export type PaymentMethodOption = {
  label: string;
  value: "cash" | "card" | "balance" | "mixed" | "qr";
  enabled?: boolean;
};

const fallbackPaymentMethods: PaymentMethodOption[] = [
  { label: "Naqd", value: "cash", enabled: true },
  { label: "Karta", value: "card", enabled: true },
  { label: "Balans", value: "balance", enabled: true },
  { label: "Aralash", value: "mixed", enabled: true },
];

function uniquePaymentMethods(methods: PaymentMethodOption[]) {
  const seen = new Set<string>();
  return methods.filter((item) => {
    if (item.enabled === false || item.value === "qr") return false;
    const key = item.value;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function usePaymentMethods(branchId?: string, enabled = true) {
  const [methods, setMethods] = useState<PaymentMethodOption[]>(fallbackPaymentMethods);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const query = branchId && branchId !== "all" ? `?branch_id=${encodeURIComponent(branchId)}` : "";
    backendGet<PaymentMethodOption[]>(`/settings/payment-methods${query}`)
      .then((rows) => {
        if (cancelled) return;
        const active = uniquePaymentMethods(rows);
        setMethods(active.length ? active : fallbackPaymentMethods);
      })
      .catch(() => {
        if (!cancelled) setMethods(fallbackPaymentMethods);
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, enabled]);

  return methods;
}
