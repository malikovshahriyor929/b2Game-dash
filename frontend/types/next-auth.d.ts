import NextAuth from "next-auth";
import { Role } from "./user";

declare module "next-auth" {
  interface Session {
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email: string;
    role: Role;
    branchIds: string[];
  }
}
