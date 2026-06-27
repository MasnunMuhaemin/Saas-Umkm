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

  /** Daftar paket untuk pilihan ganti paket. */
  plans: merchantProcedure.query(() => billingService.listPlans()),

  /** Ganti paket (upgrade/downgrade). */
  changePlan: merchantProcedure
    .input(z.object({ planSlug: z.string() }))
    .mutation(({ ctx, input }) =>
      billingService.changePlan(ctx.tenantId, input.planSlug),
    ),

  /** Batalkan / aktifkan kembali perpanjangan otomatis. */
  setAutoRenew: merchantProcedure
    .input(z.object({ autoRenew: z.boolean() }))
    .mutation(({ ctx, input }) =>
      billingService.setAutoRenew(ctx.tenantId, input.autoRenew),
    ),

  /** Merchant bayar langganan sendiri (opsional pakai kupon). */
  createMyInvoice: merchantProcedure
    .input(z.object({ couponCode: z.string().optional() }).optional())
    .mutation(({ ctx, input }) =>
      billingService.createInvoice(ctx.tenantId, input?.couponCode || undefined),
    ),

  /** Super admin buat tagihan untuk tenant tertentu. */
  createInvoiceFor: superAdminProcedure
    .input(z.object({ tenantId: z.string() }))
    .mutation(({ input }) => billingService.createInvoice(input.tenantId)),
});
