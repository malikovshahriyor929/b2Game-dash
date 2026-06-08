import { z } from "zod";
import { amount } from "./common";

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    category: z.string().min(1),
    barcode: z.string().min(4),
    price: amount,
    cost: amount.default(0),
    is_active: z.boolean().optional(),
  }),
});

export const productUpdateSchema = z.object({ body: productCreateSchema.shape.body.partial(), params: z.object({ id: z.string().uuid() }) });
