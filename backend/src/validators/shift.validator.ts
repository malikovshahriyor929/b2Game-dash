import { z } from "zod";
import { amount } from "./common";

export const openShiftSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    starting_cash: amount,
    shift_type: z.string().optional(),
  }),
});

export const closeShiftSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    actual_cash: amount,
    cash_withdrawn: amount.optional(),
    recipient: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const withdrawalRequestSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    amount: amount,
    purpose: z.enum(["owner_withdrawal", "admin_debt", "expense"]).optional(),
    note: z.string().optional(),
  }),
});
