import { z } from "zod";
import { router, superAdminProcedure } from "@/server/trpc";
import { superAdminTenantService } from "@/server/services/superadmin/tenant.service";

export const tenantAdminRouter = router({
  list: superAdminProcedure.query(() => superAdminTenantService.list()),

  setStatus: superAdminProcedure
    .input(z.object({ id: z.string(), status: z.enum(["ACTIVE", "SUSPENDED"]) }))
    .mutation(({ ctx, input }) =>
      superAdminTenantService.setStatus(input.id, input.status, ctx.user.id),
    ),
});
