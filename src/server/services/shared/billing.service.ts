import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { pakasir } from "@/lib/pakasir/client";
import { formatDate } from "@/lib/helpers/format";
import { GRACE_PERIOD_DAYS } from "@/lib/constants/config";
import { sendEmail } from "@/lib/email/client";
import {
  paymentSuccessEmail,
  subscriptionReminderEmail,
  pastDueEmail,
  suspendedEmail,
} from "@/lib/email/templates";
import { captureError } from "@/lib/logger";
import { couponService } from "@/server/services/shared/coupon.service";
import type { Prisma } from "@/generated/prisma/client";

function makeOrderId() {
  return `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const billingService = {
  /** Info langganan + riwayat pembayaran untuk halaman billing merchant. */
  async getInfo(tenantId: string) {
    const sub = await prisma.subscription.findUniqueOrThrow({
      where: { tenantId },
      include: { plan: { select: { name: true, price: true, slug: true } } },
    });
    const payments = await prisma.payment.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        orderId: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paidAt: true,
        createdAt: true,
      },
    });
    const pending = await prisma.payment.findFirst({
      where: {
        subscriptionId: sub.id,
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: { orderId: true, amount: true, paymentNumber: true, expiredAt: true },
    });

    return {
      status: sub.status,
      planName: sub.plan.name,
      planSlug: sub.plan.slug,
      planPrice: sub.plan.price,
      currentEndLabel: sub.currentEnd ? formatDate(sub.currentEnd) : null,
      autoRenew: sub.autoRenew,
      payments: payments.map((p) => ({
        orderId: p.orderId,
        amount: p.amount,
        status: p.status,
        dateLabel: formatDate(p.createdAt),
      })),
      pendingQr: pending
        ? {
            orderId: pending.orderId,
            amount: pending.amount,
            paymentNumber: pending.paymentNumber,
            expiredLabel: pending.expiredAt
              ? formatDate(pending.expiredAt)
              : null,
          }
        : null,
    };
  },

  /** Daftar paket aktif untuk pilihan ganti paket. */
  listPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        price: true,
        maxProducts: true,
        hasPos: true,
        hasInvoice: true,
        hasCustomerDb: true,
      },
    });
  },

  /** Ganti paket (upgrade/downgrade). Fitur & harga berikutnya langsung berubah. */
  async changePlan(tenantId: string, planSlug: string) {
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
      select: { id: true },
    });
    if (!plan)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Paket tidak ditemukan.",
      });
    await prisma.subscription.update({
      where: { tenantId },
      data: { planId: plan.id },
    });
    return { ok: true };
  },

  /** Atur perpanjangan otomatis (batal langganan = autoRenew false). */
  async setAutoRenew(tenantId: string, autoRenew: boolean) {
    await prisma.subscription.update({
      where: { tenantId },
      data: { autoRenew },
    });
    return { ok: true };
  },

  /** Buat invoice langganan + transaksi QRIS Pakasir (merchant/super admin). */
  async createInvoice(tenantId: string, couponCode?: string) {
    const sub = await prisma.subscription.findUniqueOrThrow({
      where: { tenantId },
      include: { plan: true },
    });

    // Kupon opsional → diskon dari harga paket.
    let amount = sub.plan.price;
    let couponId: string | null = null;
    if (couponCode) {
      const applied = await couponService.apply(couponCode, amount);
      amount = applied.discounted;
      couponId = applied.couponId;
    }
    const orderId = makeOrderId();

    const base =
      sub.currentEnd && sub.currentEnd > new Date() ? sub.currentEnd : new Date();
    const periodStart = base;
    const periodEnd = new Date(base);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const result = await pakasir.createQris(orderId, amount);

    const payment = await prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        orderId,
        amount,
        status: "PENDING",
        paymentNumber: result.payment.payment_number,
        periodStart,
        periodEnd,
        expiredAt: new Date(result.payment.expired_at),
      },
    });

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { redeemedCount: { increment: 1 } },
      });
    }

    return {
      orderId: payment.orderId,
      amount: payment.amount,
      paymentNumber: payment.paymentNumber,
      mock: pakasir.isMock,
    };
  },

  /**
   * Konfirmasi pembayaran (dari webhook). VERIFIKASI ULANG ke Pakasir dulu
   * (anti-spoof). Idempotent: skip jika sudah COMPLETED.
   */
  async confirmPayment(orderId: string, webhookPayload: unknown) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { subscription: true },
    });
    if (!payment) throw new Error("Payment tidak ditemukan");
    if (payment.status === "COMPLETED") return payment; // idempotent

    const detail = await pakasir.getDetail(orderId, payment.amount);
    if (
      detail.transaction.status !== "completed" ||
      detail.transaction.amount !== payment.amount
    ) {
      throw new Error("Verifikasi pembayaran gagal / tidak cocok");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paymentMethod: detail.transaction.payment_method,
          paidAt: new Date(detail.transaction.completed_at ?? Date.now()),
          rawWebhook: (webhookPayload ?? {}) as Prisma.InputJsonValue,
        },
      });

      await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          startedAt: payment.subscription.startedAt ?? new Date(),
          currentEnd: payment.periodEnd,
          graceUntil: null,
        },
      });

      await tx.tenant.update({
        where: { id: payment.subscription.tenantId },
        data: { status: "ACTIVE", subscriptionEnd: payment.periodEnd },
      });

      return updated;
    });

    // Email "pembayaran berhasil" — fire-and-forget, jangan gagalkan webhook.
    try {
      const t = await prisma.tenant.findUnique({
        where: { id: payment.subscription.tenantId },
        select: {
          user: { select: { email: true, name: true } },
          plan: { select: { name: true } },
        },
      });
      if (t?.user.email) {
        await sendEmail({
          to: t.user.email,
          ...paymentSuccessEmail({
            name: t.user.name,
            planName: t.plan.name,
            amount: payment.amount,
            currentEnd: payment.periodEnd,
          }),
        });
      }
    } catch (e) {
      captureError(e, { where: "confirmPayment.email" });
    }

    return result;
  },

  /** Lifecycle harian: reminder H-3 + ACTIVE→PAST_DUE→EXPIRED(+suspend) + email. */
  async runLifecycle() {
    const now = new Date();
    const include = {
      plan: { select: { name: true, price: true } },
      tenant: { select: { user: { select: { email: true, name: true } } } },
    } as const;
    const mail = async (
      to: string | undefined,
      tpl: { subject: string; html: string },
    ) => {
      if (!to) return;
      try {
        await sendEmail({ to, ...tpl });
      } catch (e) {
        captureError(e, { where: "runLifecycle.mail" });
      }
    };

    // 1. Reminder H-3 (currentEnd 2–3 hari ke depan → terkirim sekali).
    const d2 = new Date(now);
    d2.setDate(d2.getDate() + 2);
    const d3 = new Date(now);
    d3.setDate(d3.getDate() + 3);
    const reminders = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        autoRenew: true,
        currentEnd: { gte: d2, lt: d3 },
      },
      include,
    });
    for (const sub of reminders) {
      await mail(
        sub.tenant.user.email,
        subscriptionReminderEmail({
          name: sub.tenant.user.name,
          planName: sub.plan.name,
          amount: sub.plan.price,
          currentEnd: sub.currentEnd!,
        }),
      );
    }

    // 2. Lewat jatuh tempo → PAST_DUE + grace + email.
    const expiring = await prisma.subscription.findMany({
      where: { status: "ACTIVE", currentEnd: { lt: now } },
      include,
    });
    for (const sub of expiring) {
      const graceUntil = new Date(now);
      graceUntil.setDate(graceUntil.getDate() + GRACE_PERIOD_DAYS);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "PAST_DUE", graceUntil },
      });
      await mail(
        sub.tenant.user.email,
        pastDueEmail({ name: sub.tenant.user.name, graceUntil }),
      );
    }

    // 3. Lewat grace → EXPIRED + suspend tenant + email.
    const toSuspend = await prisma.subscription.findMany({
      where: { status: "PAST_DUE", graceUntil: { lt: now } },
      include,
    });
    for (const sub of toSuspend) {
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "EXPIRED" },
        }),
        prisma.tenant.update({
          where: { id: sub.tenantId },
          data: { status: "SUSPENDED" },
        }),
      ]);
      await mail(
        sub.tenant.user.email,
        suspendedEmail({ name: sub.tenant.user.name }),
      );
    }

    return {
      reminded: reminders.length,
      pastDue: expiring.length,
      suspended: toSuspend.length,
    };
  },
};
