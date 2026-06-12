import { backendServerAxios } from "@/server/api";

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

type BackendTokenResponse = {
  data?: {
    access_token?: unknown;
    refresh_token?: unknown;
  };
};

export function getJwtExpiresAt(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function readBackendTokens(payload: BackendTokenResponse): BackendTokens | null {
  const accessToken = payload.data?.access_token;
  const refreshToken = payload.data?.refresh_token;
  if (typeof accessToken !== "string" || typeof refreshToken !== "string") return null;

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: getJwtExpiresAt(accessToken),
  };
}

// Thrown only when the backend explicitly rejects the refresh token (expired/invalid) —
// i.e. the user genuinely must log in again. Transient/network failures throw a plain Error.
export class RefreshTokenInvalidError extends Error {}

export async function refreshBackendTokens(refreshToken: string) {
  let response;
  try {
    response = await backendServerAxios.post("/auth/refresh", { refresh_token: refreshToken });
  } catch (error) {
    // Network / backend-down: transient, do NOT force a logout.
    throw new Error(`Backend unreachable during refresh: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    throw new RefreshTokenInvalidError("Refresh token rejected");
  }
  if (response.status < 200 || response.status >= 300) throw new Error("Backend session refresh failed");

  const tokens = readBackendTokens(response.data);
  if (!tokens) throw new Error("Backend refresh returned invalid tokens");
  return tokens;
}
