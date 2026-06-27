import { router, merchantProcedure } from "@/server/trpc";
import { settingsService } from "@/server/services/tenant/settings.service";
import { updateProfileSchema } from "@/lib/validations/settings.schema";

export const settingsRouter = router({
  get: merchantProcedure.query(({ ctx }) =>
    settingsService.getProfile(ctx.tenantId),
  ),

  update: merchantProcedure
    .input(updateProfileSchema)
    .mutation(({ ctx, input }) =>
      settingsService.updateProfile(ctx.tenantId, input),
    ),
});
