import { z } from "zod";
import { router, superAdminProcedure } from "@/server/trpc";
import { superAdminPlanService } from "@/server/services/superadmin/plan.service";
import { planUpdateSchema } from "@/lib/validations/superadmin.schema";

export const planAdminRouter = router({
  list: superAdminProcedure.query(() => superAdminPlanService.list()),

  update: superAdminProcedure
    .input(z.object({ id: z.string(), data: planUpdateSchema }))
    .mutation(({ input }) =>
      superAdminPlanService.update(input.id, input.data),
    ),
});
