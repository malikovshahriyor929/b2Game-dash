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
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const user = mockUsers.find((item) => item.phone === credentials?.phone && item.password === credentials?.password);
        if (!user) return null;
        return { id: user.id, name: user.name, phone: user.phone, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.phone = user.phone;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.phone = token.phone;
      session.user.role = token.role;
      return session;
    },
  },
};
