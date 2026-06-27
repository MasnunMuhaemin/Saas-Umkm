import { z } from "zod";
import {
  router,
  merchantProcedure,
  superAdminProcedure,
} from "@/server/trpc";
import { billingService } from "@/server/services/shared/billing.service";

export const billingRouter = router({
  /** Info langganan merchant (status, riwayat, QR pending). */
  getInfo: merchantProcedure.query(({ ctx }) =>
    billingService.getInfo(ctx.tenantId),
  ),

  /** Merchant bayar langganan sendiri. */
  createMyInvoice: merchantProcedure.mutation(({ ctx }) =>
    billingService.createInvoice(ctx.tenantId),
  ),

  /** Super admin buat tagihan untuk tenant tertentu. */
  createInvoiceFor: superAdminProcedure
    .input(z.object({ tenantId: z.string() }))
    .mutation(({ input }) => billingService.createInvoice(input.tenantId)),
});
