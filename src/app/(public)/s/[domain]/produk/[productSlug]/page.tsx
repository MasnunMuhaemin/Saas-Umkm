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
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-gray-500">
          <a href="/" className="hover:text-primary transition-colors">
            Beranda
          </a>
          <ChevronRight size={14} />
          <a href="/#produk" className="hover:text-primary transition-colors">
            Produk
          </a>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.name}</span>
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
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-lg font-bold shadow-sm">
                    Terlaris
                  </span>
                )}
                {tenant.showDiscount && discount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg font-bold shadow-sm">
                    Diskon {discount}%
                  </span>
                )}
              </div>
            </ProductGallery>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            {tenant.showCategory && product.category && (
              <p className="text-sm text-primary font-bold mb-2 uppercase tracking-wide">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {tenant.showRating && (
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
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
              <div className="border-t border-gray-100 pt-6">
                <h2 className="font-bold text-gray-900 mb-2">Deskripsi</h2>
                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
