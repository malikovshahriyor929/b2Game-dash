import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-env";

export async function getSessionToken(request: NextRequest) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secureCookie = forwardedProtocol
    ? forwardedProtocol === "https"
    : request.nextUrl.protocol === "https:";

  return await getToken({ req: request, secret: authSecret, secureCookie })
    ?? await getToken({ req: request, secret: authSecret, secureCookie: !secureCookie });
}
