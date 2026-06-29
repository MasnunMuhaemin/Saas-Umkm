import { z } from "zod";

/** Validasi Website Builder (konten storefront: identitas, hero, about, promo). */
export const updateWebsiteSchema = z.object({
  // Identitas toko
  name: z.string().min(1, "Nama toko wajib diisi").max(255).optional(),
  tagline: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  logo: z.string().max(500).nullable().optional(),
  // Hero
  bannerTitle: z.string().max(255).nullable().optional(),
  bannerSubtitle: z.string().nullable().optional(),
  heroCtaText: z.string().max(100).nullable().optional(),
  bannerImage: z.string().max(500).nullable().optional(),
  heroStats: z
    .array(z.object({ value: z.string().max(40), label: z.string().max(60) }))
    .max(4)
    .optional(),
  // Tentang
  aboutHeadline: z.string().max(255).nullable().optional(),
  aboutBody: z.string().nullable().optional(),
  aboutImage: z.string().max(500).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(200).optional(),
  aboutChecklist: z.array(z.string()).optional(),
  // Keunggulan / Advantages
  advantages: z
    .array(
      z.object({
        title: z.string().max(80),
        description: z.string().max(300),
      }),
    )
    .max(6)
    .optional(),
  // Testimoni
  testimonials: z
    .array(
      z.object({
        name: z.string().max(80),
        text: z.string().max(500),
        rating: z.number().int().min(1).max(5),
      }),
    )
    .max(12)
    .optional(),
  // FAQ
  faqs: z
    .array(
      z.object({
        question: z.string().max(200),
        answer: z.string().max(1000),
      }),
    )
    .max(15)
    .optional(),
  // Promo
  promoEnabled: z.boolean().optional(),
  promoTitle: z.string().max(255).nullable().optional(),
  promoSubtitle: z.string().nullable().optional(),
  promoCode: z.string().max(50).nullable().optional(),
  promoImage: z.string().max(500).nullable().optional(),
  // Kontak & sosial
  googleMapsUrl: z.string().nullable().optional(),
  openingHours: z.string().max(255).nullable().optional(),
  socialLinks: z
    .object({
      facebook: z.string().max(300).optional(),
      instagram: z.string().max(300).optional(),
      youtube: z.string().max(300).optional(),
      tiktok: z.string().max(300).optional(),
    })
    .optional(),
  // Tema & template per-section
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format hex #RRGGBB")
    .optional(),
  heroStyle: z.enum(["centered", "split", "minimal"]).optional(),
  productStyle: z.enum(["grid", "list"]).optional(),
  advantagesStyle: z.enum(["cards", "list"]).optional(),
  testimonialStyle: z.enum(["grid", "highlight"]).optional(),
  faqStyle: z.enum(["accordion", "open"]).optional(),
  // Visibilitas elemen storefront
  showBusinessName: z.boolean().optional(),
  showTagline: z.boolean().optional(),
  showPrice: z.boolean().optional(),
  showStock: z.boolean().optional(),
  showCategory: z.boolean().optional(),
  showDiscount: z.boolean().optional(),
  showRating: z.boolean().optional(),
  showWhatsappButton: z.boolean().optional(),
});
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
