import { z } from "zod";
import { router, merchantProcedure } from "@/server/trpc";
import { productService } from "@/server/services/tenant/product.service";
import {
  storeProductSchema,
  listProductSchema,
} from "@/lib/validations/product.schema";

export const productRouter = router({
  list: merchantProcedure
    .input(listProductSchema)
    .query(({ ctx, input }) => productService.getPaginated(ctx.tenantId, input)),

  byId: merchantProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => productService.getById(ctx.tenantId, input.id)),

  create: merchantProcedure
    .input(storeProductSchema)
    .mutation(({ ctx, input }) => productService.store(ctx.tenantId, input)),

  update: merchantProcedure
    .input(z.object({ id: z.string(), data: storeProductSchema.partial() }))
    .mutation(({ ctx, input }) =>
      productService.update(ctx.tenantId, input.id, input.data),
    ),

  delete: merchantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      productService.destroy(ctx.tenantId, input.id),
    ),
});
