import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const BACKEND_PROXY_EMAIL = process.env.BACKEND_PROXY_EMAIL ?? "superadmin@b2game.uz";
const BACKEND_PROXY_PASSWORD = process.env.BACKEND_PROXY_PASSWORD ?? "superadmin123";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getBackendToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BACKEND_PROXY_EMAIL, password: BACKEND_PROXY_PASSWORD }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Backend login failed: ${response.status}`);
  const json = await response.json();
  const token = json.data?.access_token;
  if (!token) throw new Error("Backend login did not return access_token");
  tokenCache = { token, expiresAt: Date.now() + 10 * 60_000 };
  return token;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const target = new URL(`/api/${path.join("/")}`, BACKEND_URL);
  target.search = request.nextUrl.search;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || await getBackendToken();
    const response = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: "no-store",
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Backend unavailable", errors: [] }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
