import { z } from "zod";

export const bookingCreateSchema = z.object({
  body: z.object({
    branch_id: z.string().uuid().optional(),
    simulator_id: z.string().uuid(),
    booking_type: z.enum(["customer_booking", "repair_booking"]).default("customer_booking"),
    customer_id: z.string().uuid().optional(),
    customer_name: z.string().optional(),
    phone: z.string().optional(),
    repair_request_id: z.string().uuid().optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    status: z.enum(["pending","confirmed","arrived","cancelled","no_show","completed"]).optional(),
    note: z.string().optional(),
  }),
});

export const bookingUpdateSchema = z.object({ params: z.object({ id: z.string().uuid() }), body: bookingCreateSchema.shape.body.partial() });
