import { z } from "zod";
import { router, planProcedure } from "@/server/trpc";
import { orderService } from "@/server/services/tenant/order.service";
import { posOrderSchema } from "@/lib/validations/order.schema";

// POS butuh hasPos; riwayat Invoice butuh hasInvoice (keduanya paket Plus).
const posProcedure = planProcedure("hasPos");
const invoiceProcedure = planProcedure("hasInvoice");

export const orderRouter = router({
  posData: posProcedure.query(({ ctx }) =>
    orderService.getPosData(ctx.tenantId),
  ),

  createPos: posProcedure
    .input(posOrderSchema)
    .mutation(({ ctx, input }) =>
      orderService.createPos(ctx.tenantId, input),
    ),

  list: invoiceProcedure.query(({ ctx }) =>
    orderService.getInvoices(ctx.tenantId),
  ),

  exportRows: invoiceProcedure.query(({ ctx }) =>
    orderService.exportRows(ctx.tenantId),
  ),

  byId: invoiceProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      orderService.getInvoiceById(ctx.tenantId, input.id),
    ),
});
