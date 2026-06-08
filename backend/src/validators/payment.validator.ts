import { z } from "zod";
import { amount } from "./common";

export const paymentSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    session_id: z.string().uuid().optional(),
    sale_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
    method: z.enum(["cash", "card", "qr", "balance", "mixed"]),
    cash_amount: amount.default(0),
    card_amount: amount.default(0),
    qr_amount: amount.default(0),
    balance_amount: amount.default(0),
  }),
});
