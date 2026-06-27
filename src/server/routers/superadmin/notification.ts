import { z } from "zod";
import { router, superAdminProcedure } from "@/server/trpc";
import { notificationService } from "@/server/services/superadmin/notification.service";
import { createNotificationSchema } from "@/lib/validations/notification.schema";

export const notificationAdminRouter = router({
  list: superAdminProcedure.query(() => notificationService.list()),
  unreadCount: superAdminProcedure.query(() =>
    notificationService.unreadCount(),
  ),
  create: superAdminProcedure
    .input(createNotificationSchema)
    .mutation(({ input }) => notificationService.create(input)),
  markRead: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => notificationService.markRead(input.id)),
  markAllRead: superAdminProcedure.mutation(() =>
    notificationService.markAllRead(),
  ),
});
