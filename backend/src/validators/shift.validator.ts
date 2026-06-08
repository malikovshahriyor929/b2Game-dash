import { z } from "zod";
import { amount } from "./common";

export const openShiftSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    starting_cash: amount,
  }),
});

export const closeShiftSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    actual_cash: amount,
    notes: z.string().optional(),
  }),
});
