import { NextAuthOptions, Session } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    token: string;
    image?: string;

    isEmployee?: boolean;
    companyId?: string | null;
    companyRole?: string | null;
  }

  interface Session {
    user: User & {
      role: string;
      accessToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    isEmployee?: boolean;
    companyId?: string | null;
    companyRole?: string | null;
  }
}