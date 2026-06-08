import { z } from "zod";

export const inventoryMoveSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    product_id: z.string().uuid(),
    quantity: z.coerce.number().int(),
    reason: z.string().optional(),
  }),
});
