import { z } from "zod";

/** Update profil bisnis (data yang tampil di storefront). Whitelist field. */
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nama toko wajib diisi").max(255),
  tagline: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  // Kontak
  phone: z.string().max(30).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  email: z.string().max(255).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  province: z.string().max(100).nullable().optional(),
  openingHours: z.string().max(255).nullable().optional(),
  // Tampilan
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus format hex (#RRGGBB)")
    .optional(),
  showBusinessName: z.boolean().optional(),
  showTagline: z.boolean().optional(),
  showPrice: z.boolean().optional(),
  showStock: z.boolean().optional(),
  showRating: z.boolean().optional(),
  showWhatsappButton: z.boolean().optional(),
  showCategory: z.boolean().optional(),
  showDiscount: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
