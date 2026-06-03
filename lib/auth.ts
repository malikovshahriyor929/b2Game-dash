import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { mockUsers } from "@/lib/mock-data";

export const authSecret = process.env.NEXTAUTH_SECRET ?? "b2-game-club-demo-secret";

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
        const user = mockUsers.find((item) => item.email === credentials?.email && item.password === credentials?.password);
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, branchIds: user.branchIds };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.role = user.role;
        token.branchIds = user.branchIds;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.branchIds = token.branchIds;
      return session;
    },
  },
};
