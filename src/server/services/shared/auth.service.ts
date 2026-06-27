import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { createResetToken, verifyResetToken } from "@/lib/auth/reset-token";
import { sendEmail } from "@/lib/email/client";
import { passwordResetEmail } from "@/lib/email/templates";
import { checkRateLimit } from "@/lib/auth/rate-limit";

const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export const authService = {
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
