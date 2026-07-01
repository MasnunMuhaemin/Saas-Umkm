import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";

/**
 * Notifikasi platform (dibuat super admin) untuk merchant. Broadcast ke semua
 * tenant; status baca dilacak per tenant lewat NotificationRead.
 */
export const tenantNotificationService = {
  list: async (tenantId: string) => {
    const [rows, reads] = await Promise.all([
      prisma.adminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          createdAt: true,
        },
      }),
      prisma.notificationRead.findMany({
        where: { tenantId },
        select: { notificationId: true },
      }),
    ]);
    const readSet = new Set(reads.map((r) => r.notificationId));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: readSet.has(r.id),
      dateLabel: formatDate(r.createdAt),
    }));
  },

  unreadCount: (tenantId: string) =>
    prisma.adminNotification.count({
      where: { reads: { none: { tenantId } } },
    }),

  async markAllRead(tenantId: string) {
    const unread = await prisma.adminNotification.findMany({
      where: { reads: { none: { tenantId } } },
      select: { id: true },
    });
    if (unread.length) {
      await prisma.notificationRead.createMany({
        data: unread.map((n) => ({ notificationId: n.id, tenantId })),
        skipDuplicates: true,
      });
    }
    return { ok: true };
  },
};
