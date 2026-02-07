import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountType: string;
      platformRoles: string[];
    } & DefaultSession["user"];
  }

  interface User {
    accountType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accountType?: string;
    platformRoles?: string[];
  }
}
