import { z } from "zod";

/** Validasi Website Builder (konten storefront: hero, about, promo). */
export const updateWebsiteSchema = z.object({
  // Hero
  bannerTitle: z.string().max(255).nullable().optional(),
  bannerSubtitle: z.string().nullable().optional(),
  heroCtaText: z.string().max(100).nullable().optional(),
  // Tentang
  aboutHeadline: z.string().max(255).nullable().optional(),
  aboutBody: z.string().nullable().optional(),
  yearsExperience: z.number().int().min(0).max(200).optional(),
  aboutChecklist: z.array(z.string()).optional(),
  // Promo
  promoEnabled: z.boolean().optional(),
  promoTitle: z.string().max(255).nullable().optional(),
  promoSubtitle: z.string().nullable().optional(),
  promoCode: z.string().max(50).nullable().optional(),
});
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
