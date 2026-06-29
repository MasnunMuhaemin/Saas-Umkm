import { prisma } from "@/server/db";
import { revalidateStorefront } from "@/server/services/public/storefront.service";
import type { UpdateWebsiteInput } from "@/lib/validations/website.schema";
import {
  coerceAdvantages,
  coerceFaqs,
  coerceHeroStats,
  coerceSocialLinks,
  coerceTestimonials,
  type Advantage,
  type Faq,
  type HeroStat,
  type SocialLinks,
  type Testimonial,
} from "@/types/storefront-content";

/** Tipe eksplisit (bukan Json mentah) agar tipe tRPC tetap ringan. */
export type WebsiteData = {
  name: string;
  tagline: string | null;
  description: string | null;
  logo: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  heroCtaText: string | null;
  bannerImage: string | null;
  heroStats: HeroStat[];
  aboutHeadline: string | null;
  aboutBody: string | null;
  aboutImage: string | null;
  yearsExperience: number;
  aboutChecklist: string[];
  advantages: Advantage[];
  testimonials: Testimonial[];
  faqs: Faq[];
  promoEnabled: boolean;
  promoTitle: string | null;
  promoSubtitle: string | null;
  promoCode: string | null;
  promoImage: string | null;
  googleMapsUrl: string | null;
  openingHours: string | null;
  socialLinks: SocialLinks;
  primaryColor: string;
  heroStyle: string;
  productStyle: string;
  advantagesStyle: string;
  testimonialStyle: string;
  faqStyle: string;
  showBusinessName: boolean;
  showTagline: boolean;
  showPrice: boolean;
  showStock: boolean;
  showCategory: boolean;
  showDiscount: boolean;
  showRating: boolean;
  showWhatsappButton: boolean;
};

export const websiteService = {
  async getWebsite(tenantId: string): Promise<WebsiteData> {
    const t = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        name: true,
        tagline: true,
        description: true,
        logo: true,
        bannerTitle: true,
        bannerSubtitle: true,
        heroCtaText: true,
        bannerImage: true,
        heroStats: true,
        aboutHeadline: true,
        aboutBody: true,
        aboutImage: true,
        yearsExperience: true,
        aboutChecklist: true,
        advantages: true,
        testimonials: true,
        faqs: true,
        promoEnabled: true,
        promoTitle: true,
        promoSubtitle: true,
        promoCode: true,
        promoImage: true,
        googleMapsUrl: true,
        openingHours: true,
        socialLinks: true,
        primaryColor: true,
        heroStyle: true,
        productStyle: true,
        advantagesStyle: true,
        testimonialStyle: true,
        faqStyle: true,
        showBusinessName: true,
        showTagline: true,
        showPrice: true,
        showStock: true,
        showCategory: true,
        showDiscount: true,
        showRating: true,
        showWhatsappButton: true,
      },
    });
    return {
      ...t,
      aboutChecklist: Array.isArray(t.aboutChecklist)
        ? t.aboutChecklist.map(String)
        : [],
      heroStats: coerceHeroStats(t.heroStats),
      advantages: coerceAdvantages(t.advantages),
      testimonials: coerceTestimonials(t.testimonials),
      faqs: coerceFaqs(t.faqs),
      socialLinks: coerceSocialLinks(t.socialLinks),
    };
  },

  /** Update konten website. Return minimal agar tipe tRPC ringan. */
  async updateWebsite(tenantId: string, data: UpdateWebsiteInput) {
    await prisma.tenant.update({ where: { id: tenantId }, data });
    await revalidateStorefront(tenantId);
    return { ok: true };
  },
};
