import { router, superAdminProcedure } from "@/server/trpc";
import { superAdminDashboardService } from "@/server/services/superadmin/dashboard.service";

export const superDashboardRouter = router({
  stats: superAdminProcedure.query(() =>
    superAdminDashboardService.getStats(),
  ),
  globalStats: superAdminProcedure.query(() =>
    superAdminDashboardService.getGlobalStats(),
  ),
});
