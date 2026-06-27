import { prisma } from "@/server/db";
import { pakasir } from "@/lib/pakasir/client";
import { formatDate } from "@/lib/helpers/format";
import { GRACE_PERIOD_DAYS } from "@/lib/constants/config";
import type { Prisma } from "@/generated/prisma/client";

function makeOrderId() {
  return `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const billingService = {
  /** Info langganan + riwayat pembayaran untuk halaman billing merchant. */
  async getInfo(tenantId: string) {
    const sub = await prisma.subscription.findUniqueOrThrow({
      where: { tenantId },
      include: { plan: { select: { name: true, price: true } } },
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

  /** Buat invoice langganan + transaksi QRIS Pakasir (merchant/super admin). */
  async createInvoice(tenantId: string) {
    const sub = await prisma.subscription.findUniqueOrThrow({
      where: { tenantId },
      include: { plan: true },
    });

    const amount = sub.plan.price;
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

    return prisma.$transaction(async (tx) => {
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
  },

  /** Lifecycle harian: ACTIVE→PAST_DUE→EXPIRED(+suspend). Dipanggil cron. */
  async runLifecycle() {
    const now = new Date();

    const expiring = await prisma.subscription.findMany({
      where: { status: "ACTIVE", currentEnd: { lt: now } },
    });
    for (const sub of expiring) {
      const graceUntil = new Date(now);
      graceUntil.setDate(graceUntil.getDate() + GRACE_PERIOD_DAYS);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "PAST_DUE", graceUntil },
      });
    }

    const toSuspend = await prisma.subscription.findMany({
      where: { status: "PAST_DUE", graceUntil: { lt: now } },
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
    }

    return { pastDue: expiring.length, suspended: toSuspend.length };
  },
};
