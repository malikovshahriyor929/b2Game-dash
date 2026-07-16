import axios from "axios";
import { env } from "../config/env";
import type { AuthUser } from "../types/auth.types";

type CashboxArticle = "Simracing — Касса" | "Bar — Касса" | "Выемка — Касса";
type CashboxWallet = "Наличка" | "Карта" | "Банк";

type CashboxPart = {
  wallet: CashboxWallet;
  amount: number;
};

type CashboxWebhookInput = {
  article: CashboxArticle;
  actor?: AuthUser;
  comment?: string | null;
  parts: CashboxPart[];
};

const walletByField = {
  cash: "Наличка",
  card: "Карта",
  qr: "Банк",
} as const;

function actorLabel(actor?: AuthUser) {
  return actor?.name || actor?.email || actor?.user_id || "System";
}

export function paymentCashboxParts(input: { cash_amount?: unknown; card_amount?: unknown; qr_amount?: unknown }) {
  return [
    { wallet: walletByField.cash, amount: Math.round(Number(input.cash_amount ?? 0)) },
    { wallet: walletByField.card, amount: Math.round(Number(input.card_amount ?? 0)) },
    { wallet: walletByField.qr, amount: Math.round(Number(input.qr_amount ?? 0)) },
  ].filter((part) => Number.isFinite(part.amount) && part.amount > 0);
}

export async function sendCashboxWebhook(input: CashboxWebhookInput) {
  if (!env.MAKE_CASHBOX_WEBHOOK_URL) return;

  for (const part of input.parts) {
    await axios.post(
      env.MAKE_CASHBOX_WEBHOOK_URL,
      {
        "Статья": input.article,
        "Кошелек": part.wallet,
        "Сумма": part.amount,
        ID: actorLabel(input.actor),
        "Комментарии": input.comment ?? "",
      },
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        timeout: 5000,
      },
    );
  }
}

export function notifyCashboxWebhook(input: CashboxWebhookInput) {
  void sendCashboxWebhook(input).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Make cashbox webhook failed:", message);
  });
}
