import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-env";
import { backendServerAxios } from "@/server/api";

const BACKEND_PROXY_EMAIL = process.env.BACKEND_PROXY_EMAIL ?? "superadmin@b2game.uz";
const BACKEND_PROXY_PASSWORD = process.env.BACKEND_PROXY_PASSWORD ?? "12345678";

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    const sessionToken = await getToken({ req: request, secret: authSecret });
    if (sessionToken?.backendToken) {
      return NextResponse.json({ success: true, data: { token: sessionToken.backendToken } });
    }

    if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
      return NextResponse.json({ success: true, data: { token: tokenCache.token } });
    }

    const response = await backendServerAxios.post("/auth/login", { email: BACKEND_PROXY_EMAIL, password: BACKEND_PROXY_PASSWORD });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json({ success: false, message: `Backend login failed: ${response.status}`, errors: [] }, { status: 502 });
    }

    const json = response.data;
    if (!json) {
      return NextResponse.json({ success: false, message: "Backend login returned an empty response", errors: [] }, { status: 502 });
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
