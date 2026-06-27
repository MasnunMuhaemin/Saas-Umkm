import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Minimal 3 karakter")
    .max(50)
    .regex(/^[A-Z0-9]+$/, "Hanya huruf besar & angka"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1),
  maxRedemptions: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(), // ISO date dari form (atau kosong)
});
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
