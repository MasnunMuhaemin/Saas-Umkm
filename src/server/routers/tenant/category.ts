import { z } from "zod";
import { router, merchantProcedure } from "@/server/trpc";
import { categoryService } from "@/server/services/tenant/category.service";
import { storeCategorySchema } from "@/lib/validations/category.schema";

export const categoryRouter = router({
  /** Ringkas (id+name) untuk dropdown. */
  list: merchantProcedure.query(({ ctx }) =>
    categoryService.listForSelect(ctx.tenantId),
  ),

  /** Lengkap + jumlah produk untuk halaman manajemen. */
  all: merchantProcedure.query(({ ctx }) =>
    categoryService.getAll(ctx.tenantId),
  ),

  create: merchantProcedure
    .input(storeCategorySchema)
    .mutation(({ ctx, input }) => categoryService.store(ctx.tenantId, input)),

  update: merchantProcedure
    .input(z.object({ id: z.string(), data: storeCategorySchema.partial() }))
    .mutation(({ ctx, input }) =>
      categoryService.update(ctx.tenantId, input.id, input.data),
    ),

  delete: merchantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      categoryService.destroy(ctx.tenantId, input.id),
    ),
});
