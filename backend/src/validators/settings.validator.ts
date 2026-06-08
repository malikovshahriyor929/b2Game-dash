import { z } from "zod";

export const settingsUpdateSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    settings: z.record(z.unknown()),
  }),
});
