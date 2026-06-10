import NextAuth from "next-auth";
import { Role } from "./user";

declare module "next-auth" {
  interface Session {
    authError?: "RefreshAccessTokenError";
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      branchIds: string[];
    };
  }

  interface User {
    email: string;
    role: Role;
    branchIds: string[];
    backendToken?: string;
    backendRefreshToken?: string;
    backendTokenExpiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email: string;
    role: Role;
    branchIds: string[];
    backendToken?: string;
    backendRefreshToken?: string;
    backendTokenExpiresAt?: number;
    authError?: "RefreshAccessTokenError";
  }
}
