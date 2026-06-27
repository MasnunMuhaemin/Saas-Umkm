import { router, merchantProcedure } from "@/server/trpc";
import { websiteService } from "@/server/services/tenant/website.service";
import { updateWebsiteSchema } from "@/lib/validations/website.schema";

export const websiteRouter = router({
  get: merchantProcedure.query(({ ctx }) =>
    websiteService.getWebsite(ctx.tenantId),
  ),
  update: merchantProcedure
    .input(updateWebsiteSchema)
    .mutation(({ ctx, input }) =>
      websiteService.updateWebsite(ctx.tenantId, input),
    ),
});
