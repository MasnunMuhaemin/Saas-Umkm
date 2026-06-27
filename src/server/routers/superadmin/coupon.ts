import { z } from "zod";
import { router, superAdminProcedure } from "@/server/trpc";
import { couponService } from "@/server/services/shared/coupon.service";
import { createCouponSchema } from "@/lib/validations/coupon.schema";

export const couponAdminRouter = router({
  list: superAdminProcedure.query(() => couponService.list()),
  create: superAdminProcedure
    .input(createCouponSchema)
    .mutation(({ input }) => couponService.create(input)),
  toggle: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => couponService.toggle(input.id)),
});
