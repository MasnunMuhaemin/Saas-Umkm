import { prisma } from "@/server/db";
import type { UpdateWebsiteInput } from "@/lib/validations/website.schema";

/** Tipe eksplisit (bukan Json mentah) agar tipe tRPC tetap ringan. */
export type WebsiteData = {
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  heroCtaText: string | null;
  aboutHeadline: string | null;
  aboutBody: string | null;
  yearsExperience: number;
  aboutChecklist: string[];
  promoEnabled: boolean;
  promoTitle: string | null;
  promoSubtitle: string | null;
  promoCode: string | null;
};

export const websiteService = {
  async getWebsite(tenantId: string): Promise<WebsiteData> {
    const t = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        bannerTitle: true,
        bannerSubtitle: true,
        heroCtaText: true,
        aboutHeadline: true,
        aboutBody: true,
        yearsExperience: true,
        aboutChecklist: true,
        promoEnabled: true,
        promoTitle: true,
        promoSubtitle: true,
        promoCode: true,
      },
    });
    return {
      ...t,
      aboutChecklist: Array.isArray(t.aboutChecklist)
        ? t.aboutChecklist.map(String)
        : [],
    };
  },

  /** Update konten website. Return minimal agar tipe tRPC ringan. */
  async updateWebsite(tenantId: string, data: UpdateWebsiteInput) {
    await prisma.tenant.update({ where: { id: tenantId }, data });
    return { ok: true };
  },
};
