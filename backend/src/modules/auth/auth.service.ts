import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { pool } from "../../db/pool";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { AuthUser, JwtPayload } from "../../types/auth.types";

function signAccess(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
}

function signRefresh(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

function tokens(payload: AuthUser) {
  return {
    access_token: signAccess(payload),
    refresh_token: signRefresh(payload),
  };
}

export async function login(email: string, password: string) {
  const { rows } = await pool.query("select * from users where email=$1 and is_active=true", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new ApiError(401, "Invalid email or password");
  const payload: AuthUser = { user_id: user.id, role: user.role, branch_id: user.branch_id, email: user.email, name: user.name };
  await auditLog({ branch_id: user.branch_id, actor: payload, action_type: "login", entity_type: "user", entity_id: user.id });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id },
    ...tokens(payload),
  };
}

export async function refresh(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    const { rows } = await pool.query("select id, name, email, role, branch_id from users where id=$1 and is_active=true", [decoded.user_id]);
    const user = rows[0];
    if (!user) throw new ApiError(401, "Invalid refresh token");

    const payload: AuthUser = {
      user_id: user.id,
      role: user.role,
      branch_id: user.branch_id,
      email: user.email,
      name: user.name,
    };
    return tokens(payload);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }
}

// Self-service password change for the logged-in user (admin, super_admin or dev).
export async function changePassword(actor: AuthUser, currentPassword: string, newPassword: string) {
  const { rows } = await pool.query("select id, password_hash from users where id=$1 and is_active=true", [actor.user_id]);
  const user = rows[0];
  if (!user) throw new ApiError(404, "User not found");
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) throw new ApiError(400, "Current password is incorrect");
  if (await bcrypt.compare(newPassword, user.password_hash)) throw new ApiError(400, "New password must differ from the current one");

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query("update users set password_hash=$1, updated_at=now() where id=$2", [newHash, user.id]);
  await auditLog({ branch_id: actor.branch_id, actor, action_type: "password_changed", entity_type: "user", entity_id: actor.user_id });
  return { changed: true };
}
