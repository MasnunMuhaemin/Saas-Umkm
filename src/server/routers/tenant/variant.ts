import { z } from "zod";
import { router, merchantProcedure } from "@/server/trpc";
import { variantService } from "@/server/services/tenant/variant.service";
import { storeVariantSchema } from "@/lib/validations/variant.schema";

export const variantRouter = router({
  list: merchantProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) =>
      variantService.list(ctx.tenantId, input.productId),
    ),

  add: merchantProcedure
    .input(z.object({ productId: z.string(), data: storeVariantSchema }))
    .mutation(({ ctx, input }) =>
      variantService.add(ctx.tenantId, input.productId, input.data),
    ),

  update: merchantProcedure
    .input(z.object({ id: z.string(), data: storeVariantSchema }))
    .mutation(({ ctx, input }) =>
      variantService.update(ctx.tenantId, input.id, input.data),
    ),

  delete: merchantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      variantService.remove(ctx.tenantId, input.id),
    ),
});
