import { cache } from "react";
import { prisma } from "@/server/db";

/**
 * Ambil data toko publik berdasarkan slug subdomain.
 * - Hanya tenant yang LIVE (ACTIVE/TRIAL) yang tampil.
 * - HANYA field publik yang di-expose (tanpa email/billing/internal).
 * - `cache` agar generateMetadata & page berbagi 1 query per request.
 */
export const getStorefront = cache(async (slug: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: { slug, status: { in: ["ACTIVE", "TRIAL"] } },
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      tagline: true,
      description: true,
      logo: true,
      primaryColor: true,
      whatsapp: true,
      phone: true,
      bannerTitle: true,
      bannerSubtitle: true,
      bannerImage: true,
      heroCtaText: true,
      // Visibilitas elemen
      showBusinessName: true,
      showTagline: true,
      showPrice: true,
      showStock: true,
      showRating: true,
      showWhatsappButton: true,
      showCategory: true,
      showDiscount: true,
    },
  });
  if (!tenant) return null;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: {
        id: true,
        name: true,
        icon: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { tenantId: tenant.id, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        stock: true,
        mainImage: true,
        isBest: true,
        isNew: true,
        category: { select: { name: true } },
      },
      orderBy: [{ isBest: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
  ]);

  return { tenant, categories, products };
});

export type StorefrontData = NonNullable<
  Awaited<ReturnType<typeof getStorefront>>
>;
