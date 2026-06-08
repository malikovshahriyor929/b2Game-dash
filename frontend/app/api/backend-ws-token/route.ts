import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const BACKEND_PROXY_EMAIL = process.env.BACKEND_PROXY_EMAIL ?? "superadmin@b2game.uz";
const BACKEND_PROXY_PASSWORD = process.env.BACKEND_PROXY_PASSWORD ?? "12345678";

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function GET() {
  try {
    if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
      return NextResponse.json({ success: true, data: { token: tokenCache.token } });
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: BACKEND_PROXY_EMAIL, password: BACKEND_PROXY_PASSWORD }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: `Backend login failed: ${response.status}`, errors: [] }, { status: 502 });
    }

    const text = await response.text();
    if (!text) {
      return NextResponse.json({ success: false, message: "Backend login returned an empty response", errors: [] }, { status: 502 });
    }
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, message: "Backend login returned a non-JSON response", errors: [] }, { status: 502 });
    }
    const token = json.data?.access_token;
    if (!token) {
      return NextResponse.json({ success: false, message: "Backend login did not return access_token", errors: [] }, { status: 502 });
    }

    tokenCache = { token, expiresAt: Date.now() + 10 * 60_000 };
    return NextResponse.json({ success: true, data: { token } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Backend unavailable", errors: [] }, { status: 502 });
  }
}
