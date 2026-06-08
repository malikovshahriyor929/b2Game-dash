import { z } from "zod";
import { amount } from "./common";

export const scanSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    barcode: z.string().min(4),
  }),
});

export const createSaleSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    session_id: z.string().uuid().nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
    items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.coerce.number().int().positive() })).min(1),
    discount: amount.default(0),
  }),
});

export const paySaleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    method: z.enum(["cash", "card", "qr", "balance", "mixed"]),
    cash_amount: amount.default(0),
    card_amount: amount.default(0),
    qr_amount: amount.default(0),
    balance_amount: amount.default(0),
    received_amount: amount.optional(),
    change_amount: amount.optional(),
  }),
});
