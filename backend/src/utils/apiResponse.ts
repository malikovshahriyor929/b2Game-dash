import { Response } from "express";

export function ok(res: Response, data: unknown = {}, message?: string, status = 200) {
  return res.status(status).json({ success: true, data, ...(message ? { message } : {}) });
}

export function created(res: Response, data: unknown = {}, message = "Created") {
  return ok(res, data, message, 201);
}
