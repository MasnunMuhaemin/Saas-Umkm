import { z } from "zod";
import { createTenantSchema } from "./superadmin.schema";

/** Registrasi merchant mandiri = data tenant + kode kupon opsional. */
export const registerSchema = createTenantSchema.extend({
  couponCode: z.string().trim().max(64).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
