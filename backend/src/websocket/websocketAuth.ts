import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser, JwtPayload } from "../types/auth.types";

export function verifyWsToken(token?: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & { name?: string };
    return { user_id: payload.user_id, role: payload.role, branch_id: payload.branch_id, email: payload.email, name: payload.name ?? payload.email };
  } catch {
    return null;
  }
}
