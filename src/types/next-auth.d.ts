import type { DefaultSession } from "next-auth";

type AppRole = "SUPERADMIN" | "MERCHANT";
type AppTenantRole = "OWNER" | "STAFF" | null;

declare module "next-auth" {
  interface User {
    role: AppRole;
    tenantId: string | null;
    tenantRole?: AppTenantRole;
  }
  interface Session {
    user: {
      id: string;
      role: AppRole;
      tenantId: string | null;
      tenantRole: AppTenantRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: AppRole;
    tenantId: string | null;
    tenantRole: AppTenantRole;
  }
}
