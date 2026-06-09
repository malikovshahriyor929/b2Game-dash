import { NextRequest, NextResponse } from "next/server";
import { backendServerAxios } from "@/server/api";

const BACKEND_PROXY_EMAIL = process.env.BACKEND_PROXY_EMAIL ?? "superadmin@b2game.uz";
const BACKEND_PROXY_PASSWORD = process.env.BACKEND_PROXY_PASSWORD ?? "12345678";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getBackendToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const response = await backendServerAxios.post("/auth/login", { email: BACKEND_PROXY_EMAIL, password: BACKEND_PROXY_PASSWORD });
  if (response.status < 200 || response.status >= 300) throw new Error(`Backend login failed: ${response.status}`);

  const json = response.data;
  if (!json) throw new Error("Backend login returned an empty response");
  const token = json.data?.access_token;
  if (!token) throw new Error("Backend login did not return access_token");
  tokenCache = { token, expiresAt: Date.now() + 10 * 60_000 };
  return token;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const rawBody = request.method === "GET" || request.method === "HEAD" ? "" : await request.text();
  const body = rawBody.length ? rawBody : undefined;
  const contentType = request.headers.get("content-type");

  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || await getBackendToken();
    const response = await backendServerAxios.request({
      url: `/${path.join("/")}${request.nextUrl.search}`,
      method: request.method,
      headers: {
        ...(body ? { "Content-Type": contentType ?? "application/json" } : {}),
        Authorization: `Bearer ${token}`,
      },
      data: body,
      responseType: "text",
    });
    const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": String(response.headers["content-type"] ?? "application/json") },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Backend unavailable", errors: [] }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
