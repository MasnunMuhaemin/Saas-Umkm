import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";
import type { CreateCouponInput } from "@/lib/validations/coupon.schema";

export const couponService = {
  list: async () => {
    const rows = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      maxRedemptions: c.maxRedemptions,
      redeemedCount: c.redeemedCount,
      isActive: c.isActive,
      expiresLabel: c.expiresAt ? formatDate(c.expiresAt) : null,
    }));
  },

  async create(input: CreateCouponInput) {
    const exists = await prisma.coupon.findUnique({
      where: { code: input.code },
    });
    if (exists)
      throw new TRPCError({ code: "CONFLICT", message: "Kode kupon sudah ada." });
    await prisma.coupon.create({
      data: {
        code: input.code,
        type: input.type,
        value: input.value,
        maxRedemptions: input.maxRedemptions ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
    return { ok: true };
  },

  async toggle(id: string) {
    const c = await prisma.coupon.findUniqueOrThrow({ where: { id } });
    await prisma.coupon.update({
      where: { id },
      data: { isActive: !c.isActive },
    });
    return { ok: true };
  },

  /** Validasi kupon & hitung jumlah setelah diskon. Lempar jika tidak valid. */
  async apply(code: string, amount: number) {
    const c = await prisma.coupon.findUnique({ where: { code } });
    if (!c || !c.isActive)
      throw new TRPCError({ code: "BAD_REQUEST", message: "Kupon tidak valid." });
    if (c.expiresAt && c.expiresAt < new Date())
      throw new TRPCError({ code: "BAD_REQUEST", message: "Kupon kedaluwarsa." });
    if (c.maxRedemptions !== null && c.redeemedCount >= c.maxRedemptions)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Kuota kupon habis.",
      });
    const discount =
      c.type === "PERCENT" ? Math.round((amount * c.value) / 100) : c.value;
    return { couponId: c.id, discounted: Math.max(0, amount - discount) };
  },
};
