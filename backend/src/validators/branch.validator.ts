import { z } from "zod";

export const branchCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    address: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const branchUpdateSchema = z.object({ body: branchCreateSchema.shape.body.partial(), params: z.object({ id: z.string().uuid() }) });
