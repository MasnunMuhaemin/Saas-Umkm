import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { createResetToken, verifyResetToken } from "@/lib/auth/reset-token";
import { sendEmail } from "@/lib/email/client";
import { passwordResetEmail, welcomeEmail } from "@/lib/email/templates";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { captureError } from "@/lib/logger";
import { billingService } from "@/server/services/shared/billing.service";
import type { CreateTenantInput } from "@/lib/validations/superadmin.schema";

const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export const authService = {
  /** Registrasi mandiri merchant: buat akun + langganan PENDING + invoice paket. */
  async register(input: CreateTenantInput) {
    // Anti-abuse ringan per email.
    if (!checkRateLimit(`register:${input.ownerEmail}`, 5, 600_000)) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Terlalu banyak percobaan. Coba lagi nanti.",
      });
    }

    const plan = await prisma.plan.findUnique({
      where: { slug: input.planSlug },
    });
    if (!plan)
      throw new TRPCError({ code: "BAD_REQUEST", message: "Paket tidak ditemukan." });

    const [emailUsed, slugUsed] = await Promise.all([
      prisma.user.findUnique({ where: { email: input.ownerEmail } }),
      prisma.tenant.findUnique({ where: { slug: input.slug } }),
    ]);
    if (emailUsed)
      throw new TRPCError({ code: "CONFLICT", message: "Email sudah terpakai." });
    if (slugUsed)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Subdomain sudah terpakai.",
      });

    const hash = await bcrypt.hash(input.password, 10);
    const tenant = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.ownerName,
          email: input.ownerEmail,
          password: hash,
          role: "MERCHANT",
        },
      });
      const t = await tx.tenant.create({
        data: {
          userId: user.id,
          planId: plan.id,
          name: input.name,
          slug: input.slug,
          status: "TRIAL",
        },
      });
      await tx.tenantUser.create({
        data: { tenantId: t.id, userId: user.id, role: "OWNER" },
      });
      await tx.subscription.create({
        data: { tenantId: t.id, planId: plan.id, status: "PENDING" },
      });
      return t;
    });

    try {
      await sendEmail({
        to: input.ownerEmail,
        ...welcomeEmail({
          name: input.ownerName,
          storeUrl: `${input.slug}.${ROOT_DOMAIN}`,
        }),
      });
    } catch (e) {
      captureError(e, { where: "register.welcomeEmail" });
    }

    // Buat tagihan paket pertama (QRIS Pakasir).
    const invoice = await billingService.createInvoice(tenant.id);
    return {
      tenantId: tenant.id,
      slug: input.slug,
      planName: plan.name,
      ...invoice,
    };
  },

  /** Kirim link reset (jika email terdaftar). Selalu balas ok — jangan bocorkan. */
  async forgotPassword(email: string) {
    // Anti-abuse: maksimal 3 permintaan / 10 menit per email.
    if (!checkRateLimit(`forgot:${email}`, 3, 600_000)) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Terlalu banyak permintaan. Coba lagi nanti.",
      });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    });
    if (user) {
      const token = createResetToken(email);
      await sendEmail({
        to: email,
        ...passwordResetEmail({
          name: user.name,
          link: `${APP_URL}/reset-password/${token}`,
        }),
      });
    }
    return { ok: true };
  },

  /** Verifikasi token & set password baru. */
  async resetPassword(token: string, password: string) {
    const email = verifyResetToken(token);
    if (!email) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Token tidak valid atau sudah kedaluwarsa.",
      });
    }
    await prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(password, 10) },
    });
    return { ok: true };
  },
};
