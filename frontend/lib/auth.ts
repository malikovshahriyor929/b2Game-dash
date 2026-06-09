import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authSecret } from "@/lib/auth-env";
import { backendServerAxios } from "@/server/api";
import type { Role } from "@/types/user";

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "super_admin";
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
        console.log("[auth] backend login response", {
          url: "/api/auth/login",
          status: response.status,
          ok: response.status >= 200 && response.status < 300,
          contentType: response.headers["content-type"],
          body: text,
        });
        if (response.status < 200 || response.status >= 300) return null;
        if (!text) return null;
        let payload: any;
        try {
          payload = JSON.parse(text);
        } catch {
          return null;
        }
        const user = payload.data?.user;
        if (!user || !isRole(user.role)) return null;
        const branchIds = user.role === "super_admin" ? ["all"] : user.branch_id ? [String(user.branch_id)] : [];
        return { id: String(user.id), name: String(user.name), email: String(user.email), role: user.role, branchIds };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.branchIds = user.branchIds;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.name = token.name ?? "";
      session.user.email = token.email ?? "";
      session.user.role = isRole(token.role) ? token.role : "admin";
      session.user.branchIds = Array.isArray(token.branchIds) ? token.branchIds : [];
      return session;
    },
  },
};
