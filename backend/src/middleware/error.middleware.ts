import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

export function errorMiddleware(error: Error, _req: Request, res: Response, _next: NextFunction) {
  const status = error instanceof ApiError ? error.statusCode : 500;
  const errors = error instanceof ApiError ? error.errors : [];
  res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
    errors,
    ...(env.NODE_ENV !== "production" && !(error instanceof ApiError) ? { stack: error.stack } : {}),
  });
}
