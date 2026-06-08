import { z } from "zod";
import { amount } from "./common";

export const startSessionSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    simulator_id: z.string().uuid(),
    customer_id: z.string().uuid().optional(),
    customer_name: z.string().optional(),
    phone: z.string().optional(),
    tariff_id: z.string().uuid().optional(),
    duration_minutes: z.coerce.number().int().positive(),
    payment_mode: z.enum(["prepaid", "postpaid", "balance"]).default("prepaid"),
    paid_amount: amount.default(0),
    method: z.enum(["cash", "card", "qr", "balance", "mixed"]).default("cash"),
  }),
});

export const addTimeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    minutes: z.coerce.number().int().positive(),
    amount: amount.default(0),
    method: z.enum(["cash", "card", "qr", "balance", "mixed"]).default("cash"),
  }),
});

export const stopSessionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ force: z.boolean().optional() }).optional(),
});
