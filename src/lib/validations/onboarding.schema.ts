import { z } from "zod";

export const completeOnboardingSchema = z.object({
  name: z.string().min(1, "Nama toko wajib diisi").max(100),
  whatsapp: z.string().max(20).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  logo: z.string().max(500).nullable().optional(),
  product: z
    .object({
      name: z.string().min(1).max(150),
      price: z.number().int().min(0),
      stock: z.number().int().min(0).default(0),
    })
    .nullable()
    .optional(),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
