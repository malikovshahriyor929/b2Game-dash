import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authSecret } from "@/lib/auth-env";
import { backendServerAxios } from "@/server/api";
import { readBackendTokens, refreshBackendTokens, RefreshTokenInvalidError } from "@/server/backend-auth";
import type { Role } from "@/types/user";

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "super_admin" || value === "dev_admin" || value === "dev_super_admin";
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Backend credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const response = await backendServerAxios.post("/auth/login", { email, password }, { responseType: "text" });
        const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
        if (response.status < 200 || response.status >= 300) return null;
        if (!text) return null;
        let payload: any;
        try {
          payload = JSON.parse(text);
        } catch {
          return null;
        }
        const user = payload.data?.user;
        const tokens = readBackendTokens(payload);
        if (!user || !isRole(user.role) || !tokens) return null;
        // Developer roles are hidden: the UI treats dev_super_admin exactly like super_admin
        // and dev_admin exactly like admin. `isDev` unlocks the dev-only management bits.
        const isDev = user.role === "dev_admin" || user.role === "dev_super_admin";
        const role: Role = user.role === "dev_super_admin" ? "super_admin" : user.role === "dev_admin" ? "admin" : user.role;
        const branchIds = role === "super_admin" ? ["all"] : user.branch_id ? [String(user.branch_id)] : [];
        return {
          id: String(user.id),
          name: String(user.name),
          email: String(user.email),
          role,
          isDev,
          branchIds,
          backendToken: tokens.accessToken,
          backendRefreshToken: tokens.refreshToken,
          backendTokenExpiresAt: tokens.accessTokenExpiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.isDev = user.isDev;
        token.branchIds = user.branchIds;
        token.backendToken = user.backendToken;
        token.backendRefreshToken = user.backendRefreshToken;
        token.backendTokenExpiresAt = user.backendTokenExpiresAt;
        delete token.authError;
        return token;
      }

      if (token.backendToken && token.backendTokenExpiresAt && Date.now() < token.backendTokenExpiresAt - 60_000) return token;
      if (!token.backendRefreshToken) {
        token.authError = "RefreshAccessTokenError";
        return token;
      }

      try {
        const refreshed = await refreshBackendTokens(token.backendRefreshToken);
        token.backendToken = refreshed.accessToken;
        token.backendRefreshToken = refreshed.refreshToken;
        token.backendTokenExpiresAt = refreshed.accessTokenExpiresAt;
        delete token.authError;
      } catch (error) {
        // Only force re-login when the refresh token is genuinely rejected. A transient
        // backend outage keeps the current tokens so the session survives a restart.
        if (error instanceof RefreshTokenInvalidError) token.authError = "RefreshAccessTokenError";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.name = token.name ?? "";
      session.user.email = token.email ?? "";
      session.user.role = isRole(token.role) ? token.role : "admin";
      session.user.isDev = Boolean(token.isDev);
      session.user.branchIds = Array.isArray(token.branchIds) ? token.branchIds : [];
      session.authError = token.authError;
      return session;
    },
  },
};
