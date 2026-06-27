import { router, merchantProcedure } from "@/server/trpc";
import { onboardingService } from "@/server/services/tenant/onboarding.service";
import { completeOnboardingSchema } from "@/lib/validations/onboarding.schema";

export const onboardingRouter = router({
  status: merchantProcedure.query(({ ctx }) =>
    onboardingService.status(ctx.tenantId),
  ),
  complete: merchantProcedure
    .input(completeOnboardingSchema)
    .mutation(({ ctx, input }) =>
      onboardingService.complete(ctx.tenantId, input),
    ),
});
