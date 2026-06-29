import { cache } from "react";
import { prisma } from "@/server/db";
import { tenantBaseUrl } from "@/lib/seo/metadata";
import {
  coerceAdvantages,
  coerceFaqs,
  coerceHeroStats,
  coerceSocialLinks,
  coerceTestimonials,
} from "@/types/storefront-content";

/**
 * Ambil data toko publik berdasarkan slug/customDomain.
 * - Hanya tenant LIVE (ACTIVE/TRIAL). Hanya field publik.
 * - `cache` = dedup per request (layout + page berbagi 1 query). Dibaca
 *   langsung dari DB tiap request → edit merchant (warna/template/produk)
 *   langsung tampil tanpa lag cache. (Catatan: `revalidateTag` Next 16
 *   hanya boleh dari Server Action, bukan mutation tRPC.)
 */
export const getStorefront = cache((slug: string) => fetchStorefront(slug));

/** Tidak diperlukan lagi (storefront dibaca per-request). Disimpan agar
 *  pemanggil lama tetap kompatibel. */
export async function revalidateStorefront(_tenantId: string) {
  // no-op
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
      heroStyle: true,
      productStyle: true,
      advantagesStyle: true,
      testimonialStyle: true,
      faqStyle: true,
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
      heroStats: true,
      // Tentang
      aboutHeadline: true,
      aboutBody: true,
      aboutImage: true,
      aboutChecklist: true,
      yearsExperience: true,
      advantages: true,
      testimonials: true,
      faqs: true,
      // Promo
      promoEnabled: true,
      promoTitle: true,
      promoSubtitle: true,
      promoCode: true,
      promoImage: true,
      socialLinks: true,
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

  return {
    tenant: {
      ...tenant,
      aboutChecklist: Array.isArray(tenant.aboutChecklist)
        ? tenant.aboutChecklist.map(String)
        : [],
      heroStats: coerceHeroStats(tenant.heroStats),
      advantages: coerceAdvantages(tenant.advantages),
      testimonials: coerceTestimonials(tenant.testimonials),
      faqs: coerceFaqs(tenant.faqs),
      socialLinks: coerceSocialLinks(tenant.socialLinks),
    },
    categories,
    products,
  };
}

export type StorefrontData = NonNullable<
  Awaited<ReturnType<typeof getStorefront>>
>;

/** Semua produk aktif tenant (untuk halaman daftar produk). Select sama dengan
 *  produk di home agar tipe kompatibel dengan <ProductCard>. */
export const getStorefrontProducts = cache(async (slug: string) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ slug }, { customDomain: slug }],
      status: { in: ["ACTIVE", "TRIAL"] },
    },
    select: { id: true },
  });
  if (!tenant) return [];
  return prisma.product.findMany({
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
    take: 200,
  });
});

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
