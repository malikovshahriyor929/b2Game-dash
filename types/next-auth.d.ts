import NextAuth from "next-auth";
import { Role } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      phone: string;
      role: Role;
    };
  }

  interface User {
    phone: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone: string;
    role: Role;
  }
}
