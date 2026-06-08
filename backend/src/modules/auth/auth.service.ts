import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { pool } from "../../db/pool";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { JwtPayload } from "../../types/auth.types";

function signAccess(payload: JwtPayload & { name: string }) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
}

function signRefresh(payload: JwtPayload & { name: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

export async function login(email: string, password: string) {
  const { rows } = await pool.query("select * from users where email=$1 and is_active=true", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new ApiError(401, "Invalid email or password");
  const payload = { user_id: user.id, role: user.role, branch_id: user.branch_id, email: user.email, name: user.name };
  await auditLog({ branch_id: user.branch_id, actor: payload, action_type: "login", entity_type: "user", entity_id: user.id });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id },
    access_token: signAccess(payload),
    refresh_token: signRefresh(payload),
  };
}

export async function refresh(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload & { name: string };
    return { access_token: signAccess(payload), refresh_token: signRefresh(payload) };
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }
}
