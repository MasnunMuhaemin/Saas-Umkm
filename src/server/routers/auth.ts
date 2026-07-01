import { router, publicProcedure } from "@/server/trpc";
import { authService } from "@/server/services/shared/auth.service";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";

export const authRouter = router({
  /** Registrasi mandiri merchant (pilih paket + bayar QRIS + kupon opsional). */
  register: publicProcedure
    .input(registerSchema)
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
