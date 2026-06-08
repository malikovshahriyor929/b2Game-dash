import { z } from "zod";

export const simulatorStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(["ready_to_play","busy","reserved","unpaid","broken","repair_requested","repair_approved","fixing","fixed_waiting_confirmation","offline","locked"]),
  }),
});

export const simulatorCommandSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    message: z.string().optional(),
    minutes: z.coerce.number().int().positive().optional(),
  }).optional(),
});

export const pushUpdateSchema = z.object({
  body: z.object({
    simulator_ids: z.array(z.string().uuid()).optional(),
    rig_ids: z.array(z.string()).optional(),
  }).refine((value) => Boolean(value.simulator_ids?.length || value.rig_ids?.length), "simulator_ids or rig_ids required"),
});
