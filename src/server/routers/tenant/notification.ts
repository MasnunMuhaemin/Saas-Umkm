import { router, merchantProcedure } from "@/server/trpc";
import { tenantNotificationService } from "@/server/services/tenant/notification.service";

export const tenantNotificationRouter = router({
  list: merchantProcedure.query(({ ctx }) =>
    tenantNotificationService.list(ctx.tenantId),
  ),
  unreadCount: merchantProcedure.query(({ ctx }) =>
    tenantNotificationService.unreadCount(ctx.tenantId),
  ),
  markAllRead: merchantProcedure.mutation(({ ctx }) =>
    tenantNotificationService.markAllRead(ctx.tenantId),
  ),
});
