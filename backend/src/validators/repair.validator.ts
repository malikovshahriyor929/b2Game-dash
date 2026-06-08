import { z } from "zod";

export const repairCreateSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    simulator_id: z.string().uuid(),
    title: z.string().min(2),
    description: z.string().min(2),
    error_type: z.enum(["game_error","device_error","network_error","payment_error","hardware_error","other"]),
    priority: z.enum(["low","medium","high","critical"]),
    admin_note: z.string().optional(),
  }),
});

export const repairActionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ note: z.string().optional() }).optional(),
});
