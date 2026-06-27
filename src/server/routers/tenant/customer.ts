import { z } from "zod";
import { router, planProcedure } from "@/server/trpc";
import { customerService } from "@/server/services/tenant/customer.service";
import { storeCustomerSchema } from "@/lib/validations/customer.schema";

// Fitur "Data Pelanggan" hanya untuk paket dengan hasCustomerDb (Plus).
const customerProcedure = planProcedure("hasCustomerDb");

export const customerRouter = router({
  all: customerProcedure.query(({ ctx }) =>
    customerService.getAll(ctx.tenantId),
  ),

  create: customerProcedure
    .input(storeCustomerSchema)
    .mutation(({ ctx, input }) => customerService.store(ctx.tenantId, input)),

  update: customerProcedure
    .input(z.object({ id: z.string(), data: storeCustomerSchema.partial() }))
    .mutation(({ ctx, input }) =>
      customerService.update(ctx.tenantId, input.id, input.data),
    ),

  delete: customerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      customerService.destroy(ctx.tenantId, input.id),
    ),
});
