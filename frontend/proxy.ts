import { NextResponse, type NextRequest } from "next/server";
import { getSessionToken } from "@/lib/session-token";

const authCookieNames = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
];

function isValidDashboardToken(token: Awaited<ReturnType<typeof getSessionToken>>) {
  if (!token || typeof token === "string") return false;

  return Boolean(token?.sub && (token.role === "admin" || token.role === "super_admin") && Array.isArray(token.branchIds));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const response = NextResponse.redirect(loginUrl);
  authCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: name.startsWith("__"),
    });
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const token = await getSessionToken(request);

  if (isValidDashboardToken(token)) {
    return NextResponse.next();
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
