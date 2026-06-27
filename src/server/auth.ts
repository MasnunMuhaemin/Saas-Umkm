import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./db";
import { loginSchema } from "@/lib/validations/auth.schema";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";

/**
 * Instance Auth.js LENGKAP (Node runtime) — Credentials provider pakai Prisma +
 * bcrypt. Dipakai oleh route handler /api/auth dan server actions.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Rate limit: maks 5 percobaan / menit / email.
        const rlKey = `login:${parsed.data.email}`;
        if (!checkRateLimit(rlKey)) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { tenant: { select: { id: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        clearRateLimit(rlKey); // sukses → reset counter

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenant?.id ?? null,
        };
      },
    }),
  ],
});
