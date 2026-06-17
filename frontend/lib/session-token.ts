import type { NextRequest, NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-env";

// NextAuth sessiya cookie'sining default umri (30 kun). Tokenni qayta yozganda
// shu umrni saqlaymiz, shunda faol foydalanuvchi sessiyasi uzayib boradi.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function isSecureRequest(request: NextRequest) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return forwardedProtocol ? forwardedProtocol === "https" : request.nextUrl.protocol === "https:";
}

function sessionCookieName(secureCookie: boolean) {
  return `${secureCookie ? "__Secure-" : ""}next-auth.session-token`;
}

export async function getSessionToken(request: NextRequest) {
  const secureCookie = isSecureRequest(request);
  return (
    (await getToken({ req: request, secret: authSecret, secureCookie })) ??
    (await getToken({ req: request, secret: authSecret, secureCookie: !secureCookie }))
  );
}

export type RefreshedBackendTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

// Yangilangan backend tokenlarni NextAuth sessiya cookie'siga qaytarib yozadi.
// Shu tufayli keyingi so'rovlar har safar /auth/refresh chaqirmasdan, eng so'nggi
// access tokendan foydalanadi va refresh token muddati ham siljib boradi.
export async function persistRefreshedSession(
  request: NextRequest,
  response: NextResponse,
  token: JWT,
  refreshed: RefreshedBackendTokens,
) {
  const nextToken: JWT = {
    ...token,
    backendToken: refreshed.accessToken,
    backendRefreshToken: refreshed.refreshToken,
    backendTokenExpiresAt: refreshed.accessTokenExpiresAt,
  };
  // Re-login majburlovchi bayroqni tozalaymiz (muvaffaqiyatli yangilanish bo'ldi).
  delete nextToken.authError;

  const encoded = await encode({ token: nextToken, secret: authSecret, maxAge: SESSION_MAX_AGE });
  // NextAuth 4096 baytdan oshib ketgan cookie'ni bo'laklarga ajratadi. Bu yerda bo'laklamaymiz,
  // shuning uchun xavfsizlik chegarasidan oshsa cookie'ni yozmaymiz (eski xulq saqlanadi).
  if (encoded.length > 3900) return;

  const secureCookie = isSecureRequest(request);
  response.cookies.set({
    name: sessionCookieName(secureCookie),
    value: encoded,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookie,
    maxAge: SESSION_MAX_AGE,
  });
}
