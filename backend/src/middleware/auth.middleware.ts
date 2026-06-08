import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { AuthUser, JwtPayload } from "../types/auth.types";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(new ApiError(401, "Authentication token required"));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & { name?: string };
    req.user = {
      user_id: payload.user_id,
      role: payload.role,
      branch_id: payload.branch_id,
      email: payload.email,
      name: payload.name ?? payload.email,
    } satisfies AuthUser;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
