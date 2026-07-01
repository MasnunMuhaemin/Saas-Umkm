import type { NextAuthConfig } from "next-auth";

type AppRole = "SUPERADMIN" | "MERCHANT";
type AppTenantRole = "OWNER" | "STAFF" | null;

/**
 * Config Auth.js EDGE-SAFE (tanpa Prisma/bcrypt) — dipakai di middleware untuk
 * membaca sesi JWT. Provider Credentials (butuh Node) diisi terpisah di auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantRole = user.tenantRole ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // Cast: augmentasi JWT tak ter-merge lintas package (next-auth/jwt
        // vs @auth/core/jwt), jadi token.* bertipe unknown di sini.
        session.user.id = (token.sub ?? "") as string;
        session.user.role = token.role as AppRole;
        session.user.tenantId = (token.tenantId ?? null) as string | null;
        session.user.tenantRole = (token.tenantRole ?? null) as AppTenantRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
