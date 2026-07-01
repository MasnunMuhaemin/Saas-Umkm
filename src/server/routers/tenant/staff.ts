import { z } from "zod";
import { router, merchantProcedure, ownerProcedure } from "@/server/trpc";
import { staffService } from "@/server/services/tenant/staff.service";
import { addStaffSchema } from "@/lib/validations/staff.schema";

export const staffRouter = router({
  list: merchantProcedure.query(({ ctx }) => staffService.list(ctx.tenantId)),

  add: ownerProcedure
    .input(addStaffSchema)
    .mutation(({ ctx, input }) => staffService.add(ctx.tenantId, input)),

  remove: ownerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => staffService.remove(ctx.tenantId, input.id)),
});
