import { router, planProcedure } from "@/server/trpc";
import { orderService } from "@/server/services/tenant/order.service";
import { posOrderSchema } from "@/lib/validations/order.schema";

// POS hanya untuk paket dengan hasPos (Plus).
const posProcedure = planProcedure("hasPos");

export const orderRouter = router({
  posData: posProcedure.query(({ ctx }) =>
    orderService.getPosData(ctx.tenantId),
  ),

  createPos: posProcedure
    .input(posOrderSchema)
    .mutation(({ ctx, input }) =>
      orderService.createPos(ctx.tenantId, input),
    ),
});
