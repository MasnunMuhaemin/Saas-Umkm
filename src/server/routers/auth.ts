import { router, publicProcedure } from "@/server/trpc";
import { authService } from "@/server/services/shared/auth.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";
import { createTenantSchema } from "@/lib/validations/superadmin.schema";

export const authRouter = router({
  /** Registrasi mandiri merchant (pilih paket + bayar QRIS). */
  register: publicProcedure
    .input(createTenantSchema)
    .mutation(({ input }) => authService.register(input)),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(({ input }) => authService.forgotPassword(input.email)),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(({ input }) =>
      authService.resetPassword(input.token, input.password),
    ),
});
