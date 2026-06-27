import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";
import type { CreateNotificationInput } from "@/lib/validations/notification.schema";

export const notificationService = {
  list: async () => {
    const rows = await prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: r.isRead,
      dateLabel: formatDate(r.createdAt),
    }));
  },

  unreadCount: () =>
    prisma.adminNotification.count({ where: { isRead: false } }),

  async create(data: CreateNotificationInput) {
    await prisma.adminNotification.create({ data });
    return { ok: true };
  },

  async markRead(id: string) {
    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
    return { ok: true };
  },

  async markAllRead() {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  },
};
