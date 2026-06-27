import { router, publicProcedure } from "@/server/trpc";
import { authService } from "@/server/services/shared/auth.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";

export const authRouter = router({
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(({ input }) => authService.forgotPassword(input.email)),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(({ input }) =>
      authService.resetPassword(input.token, input.password),
    ),
});
