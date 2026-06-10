import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session-token";
import { refreshBackendTokens } from "@/server/backend-auth";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = await getSessionToken(request);
    if (!sessionToken?.backendToken) {
      return NextResponse.json({ success: false, message: "Authentication required", errors: [] }, { status: 401 });
    }

    if (!sessionToken.backendTokenExpiresAt || sessionToken.backendTokenExpiresAt > Date.now() + 30_000) {
      return NextResponse.json({ success: true, data: { token: sessionToken.backendToken } });
    }

    if (!sessionToken.backendRefreshToken) {
      return NextResponse.json({ success: false, message: "Session refresh token missing", errors: [] }, { status: 401 });
    }
    const refreshed = await refreshBackendTokens(sessionToken.backendRefreshToken);
    return NextResponse.json({ success: true, data: { token: refreshed.accessToken } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Backend unavailable", errors: [] }, { status: 502 });
  }
}
