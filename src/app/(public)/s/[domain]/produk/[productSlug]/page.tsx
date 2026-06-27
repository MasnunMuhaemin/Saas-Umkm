import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";
import {
  getStorefront,
  getStorefrontProduct,
} from "@/server/services/public/storefront.service";
import { buildTenantMetadata, tenantBaseUrl } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { ProductPurchase } from "../../_components/product-purchase";
import { ProductGallery } from "../../_components/product-gallery";

type Params = Promise<{ domain: string; productSlug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { domain, productSlug } = await params;
  const data = await getStorefront(domain);
  if (!data) return { title: "Tidak ditemukan" };
  const product = await getStorefrontProduct(data.tenant.id, productSlug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return buildTenantMetadata({
    name: data.tenant.name,
    titleSuffix: product.name,
    description: product.description ?? data.tenant.tagline,
    slug: data.tenant.slug,
    customDomain: data.tenant.customDomain,
    logo: product.mainImage ?? data.tenant.logo,
    path: `/produk/${product.slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { domain, productSlug } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();
  const product = await getStorefrontProduct(data.tenant.id, productSlug);
  if (!product) notFound();

  const { tenant } = data;
  const phone = tenant.whatsapp || tenant.phone || "";
  const baseUrl = tenantBaseUrl(tenant.slug, tenant.customDomain);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <div className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description ?? undefined,
          ...(product.mainImage ? { image: product.mainImage } : {}),
          ...(product.category ? { category: product.category.name } : {}),
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "IDR",
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `${baseUrl}/produk/${product.slug}`,
          },
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium hover:text-primary transition-colors">
            Beranda
          </a>
          <ChevronRight size={14} className="text-slate-300" />
          <a href="/#produk" className="font-medium hover:text-primary transition-colors">
            Produk
          </a>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Galeri */}
          <div className="w-full lg:w-[45%] flex-none">
            <ProductGallery
              images={
                product.images.length
                  ? product.images
                  : product.mainImage
                    ? [product.mainImage]
                    : []
              }
              alt={product.name}
            >
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isBest && (
                  <span className="bg-primary text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-float backdrop-blur-sm">
                    Terlaris
                  </span>
                )}
                {tenant.showDiscount && discount > 0 && (
                  <span className="bg-rose-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-float">
                    Diskon {discount}%
                  </span>
                )}
              </div>
            </ProductGallery>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            {tenant.showCategory && product.category && (
              <span className="inline-flex items-center text-xs text-primary font-bold mb-3 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {tenant.showRating && (
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="font-display text-sm font-bold">
                    {product.rating.toFixed(1)}
                  </span>
                </span>
                <span className="text-sm text-slate-500">
                  ({product.reviewsCount} ulasan)
                </span>
              </div>
            )}

            <div className="mb-8">
              <ProductPurchase
                productName={product.name}
                basePrice={product.price}
                originalPrice={product.originalPrice}
                baseStock={product.stock}
                variants={product.variants}
                phone={phone}
                showPrice={tenant.showPrice}
                showStock={tenant.showStock}
                showDiscount={tenant.showDiscount}
                showWhatsapp={tenant.showWhatsappButton}
              />
            </div>

            {product.description && (
              <div className="border-t border-slate-100 pt-6">
                <h2 className="font-display font-bold text-slate-900 mb-3">Deskripsi</h2>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
