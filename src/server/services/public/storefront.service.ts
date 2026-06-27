import { cache } from "react";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { prisma } from "@/server/db";
import { tenantBaseUrl } from "@/lib/seo/metadata";

/**
 * Ambil data toko publik berdasarkan slug/customDomain.
 * - Hanya tenant LIVE (ACTIVE/TRIAL). Hanya field publik.
 * - Lapisan cache: `cache` (dedup per request) + `unstable_cache`
 *   (Data Cache persisten, revalidate 1 jam, tag per domain untuk
 *   invalidasi on-demand saat merchant edit → revalidateStorefront()).
 */
export const getStorefront = cache((slug: string) =>
  unstable_cache(() => fetchStorefront(slug), ["storefront", slug], {
    tags: [`storefront-${slug}`],
    revalidate: 300, // fallback: tersegarkan ≤5 menit walau on-demand gagal
  })(),
);

/** Invalidasi cache storefront tenant (panggil setelah edit yang memengaruhi toko). */
export async function revalidateStorefront(tenantId: string) {
  try {
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, customDomain: true },
    });
    if (!t) return;
    revalidateTag(`storefront-${t.slug}`, "max");
    if (t.customDomain) revalidateTag(`storefront-${t.customDomain}`, "max");
  } catch {
    // on-demand gagal → andalkan revalidate time-based (300s) di atas
  }
}

async function fetchStorefront(slug: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ slug }, { customDomain: slug }],
      status: { in: ["ACTIVE", "TRIAL"] },
    },
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
      email: true,
      address: true,
      city: true,
      province: true,
      openingHours: true,
      googleMapsUrl: true,
      bannerTitle: true,
      bannerSubtitle: true,
      bannerImage: true,
      heroCtaText: true,
      // Tentang
      aboutHeadline: true,
      aboutBody: true,
      aboutChecklist: true,
      yearsExperience: true,
      // Promo
      promoEnabled: true,
      promoTitle: true,
      promoSubtitle: true,
      promoCode: true,
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
}

export type StorefrontData = NonNullable<
  Awaited<ReturnType<typeof getStorefront>>
>;

/** Detail 1 produk publik milik tenant (by slug). Null jika tak ada/nonaktif. */
export const getStorefrontProduct = cache(
  async (tenantId: string, productSlug: string) => {
    const p = await prisma.product.findFirst({
      where: { tenantId, slug: productSlug, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        originalPrice: true,
        stock: true,
        mainImage: true,
        images: true,
        isBest: true,
        isNew: true,
        rating: true,
        reviewsCount: true,
        category: { select: { name: true } },
        variants: {
          select: { id: true, name: true, price: true, stock: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!p) return null;
    // Decimal → number, Json → string[] (aman dikirim ke Client Component)
    return {
      ...p,
      rating: Number(p.rating),
      images: Array.isArray(p.images) ? p.images.map(String) : [],
    };
  },
);

export type StorefrontProduct = NonNullable<
  Awaited<ReturnType<typeof getStorefrontProduct>>
>;

/** URL untuk sitemap.xml: base + semua slug produk aktif. Null jika toko tak ada. */
export async function getSitemapUrls(domain: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      status: { in: ["ACTIVE", "TRIAL"] },
    },
    select: { id: true, slug: true, customDomain: true },
  });
  if (!tenant) return null;
  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return {
    base: tenantBaseUrl(tenant.slug, tenant.customDomain),
    products,
  };
}
