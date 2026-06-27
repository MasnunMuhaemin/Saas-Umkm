import { router, merchantProcedure } from "@/server/trpc";
import { categoryService } from "@/server/services/tenant/category.service";

export const categoryRouter = router({
  list: merchantProcedure.query(({ ctx }) =>
    categoryService.listForSelect(ctx.tenantId),
  ),
});
