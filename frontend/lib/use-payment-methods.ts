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

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodOption[]>(fallbackPaymentMethods);

  useEffect(() => {
    let cancelled = false;
    backendGet<PaymentMethodOption[]>("/settings/payment-methods")
      .then((rows) => {
        if (cancelled) return;
        const active = rows.filter((item) => item.enabled !== false && item.value !== "qr");
        setMethods(active.length ? active : fallbackPaymentMethods);
      })
      .catch(() => {
        if (!cancelled) setMethods(fallbackPaymentMethods);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return methods;
}
