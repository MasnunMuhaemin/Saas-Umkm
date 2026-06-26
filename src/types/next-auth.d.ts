import type { DefaultSession } from "next-auth";

type AppRole = "SUPERADMIN" | "MERCHANT";

declare module "next-auth" {
  interface User {
    role: AppRole;
    tenantId: string | null;
  }
  interface Session {
    user: {
      role: AppRole;
      tenantId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: AppRole;
    tenantId: string | null;
  }
}
