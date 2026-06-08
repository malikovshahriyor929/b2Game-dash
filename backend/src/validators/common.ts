import { z } from "zod";

export const uuid = z.string().uuid();
export const idParam = z.object({ params: z.object({ id: uuid }) });
export const amount = z.coerce.number().min(0);
export const branchBody = z.object({ branch_id: uuid.optional() });
export const listQuery = z.object({
  query: z.object({
    branch_id: z.string().optional(),
    period: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }).passthrough().optional(),
});
