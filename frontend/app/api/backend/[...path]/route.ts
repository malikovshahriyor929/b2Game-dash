import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session-token";
import { backendServerAxios } from "@/server/api";
import { refreshBackendTokens, RefreshTokenInvalidError } from "@/server/backend-auth";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function getRequestBackendToken(request: NextRequest) {
  const headerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerToken) return { accessToken: headerToken };

  const sessionToken = await getSessionToken(request);
  if (!sessionToken?.backendToken) return null;
  if (!sessionToken.backendTokenExpiresAt || sessionToken.backendTokenExpiresAt > Date.now() + 30_000) {
    return { accessToken: sessionToken.backendToken, refreshToken: sessionToken.backendRefreshToken };
  }
  if (!sessionToken.backendRefreshToken) return null;

  const refreshed = await refreshBackendTokens(sessionToken.backendRefreshToken);
  return { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const rawBody = request.method === "GET" || request.method === "HEAD" ? "" : await request.text();
  const body = rawBody.length ? rawBody : undefined;
  const contentType = request.headers.get("content-type");

  try {
    const tokens = await getRequestBackendToken(request);
    if (!tokens) return NextResponse.json({ success: false, message: "Authentication required", errors: [] }, { status: 401 });

    const send = (accessToken: string) => backendServerAxios.request({
      url: `/${path.join("/")}${request.nextUrl.search}`,
      method: request.method,
      headers: {
        ...(body ? { "Content-Type": contentType ?? "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
      },
      data: body,
      responseType: "text",
    });
    let response = await send(tokens.accessToken);
    if (response.status === 401 && tokens.refreshToken) {
      const refreshed = await refreshBackendTokens(tokens.refreshToken);
      response = await send(refreshed.accessToken);
    }
    const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": String(response.headers["content-type"] ?? "application/json") },
    });
  } catch (error) {
    // Genuinely invalid session -> 401 so the client signs out cleanly.
    // Transient backend outage -> 502 so the client shows an error but stays logged in.
    if (error instanceof RefreshTokenInvalidError) {
      return NextResponse.json({ success: false, message: "Session expired", errors: [] }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Backend unavailable", errors: [] }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
