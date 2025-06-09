import NextAuth from "next-auth";
import { User } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}
