import { router, merchantProcedure } from "@/server/trpc";
import { dashboardService } from "@/server/services/tenant/dashboard.service";

export const dashboardRouter = router({
  shell: merchantProcedure.query(({ ctx }) =>
    dashboardService.getShellData(ctx.tenantId),
  ),
  overview: merchantProcedure.query(({ ctx }) =>
    dashboardService.getOverview(ctx.tenantId),
  ),
});
