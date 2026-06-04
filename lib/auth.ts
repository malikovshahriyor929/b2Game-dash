import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authSecret } from "@/lib/auth-env";
import { mockUsers } from "@/lib/mock-data";
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
      name: "Mock credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const user = mockUsers.find((item) => item.email.toLowerCase() === email && item.password === password);
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, branchIds: user.branchIds };
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
