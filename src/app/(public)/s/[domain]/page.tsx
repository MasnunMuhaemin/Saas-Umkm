import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import {
  getStorefront,
  type StorefrontData,
} from "@/server/services/public/storefront.service";
import { buildTenantMetadata, tenantBaseUrl } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildWaLink } from "@/lib/helpers/whatsapp";
import { formatRupiah } from "@/lib/helpers/format";

type Tenant = StorefrontData["tenant"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) return { title: "Toko tidak ditemukan" };
  const { tenant } = data;
  return buildTenantMetadata({
    name: tenant.name,
    description: tenant.description ?? tenant.tagline,
    slug: tenant.slug,
    customDomain: tenant.customDomain,
    logo: tenant.logo,
  });
}

function waPhone(t: Tenant) {
  return t.whatsapp || t.phone || "";
}

function WaButton({
  tenant,
  message,
  children,
  className = "",
}: {
  tenant: Tenant;
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const phone = waPhone(tenant);
  if (!phone) return null;
  return (
    <a
      href={buildWaLink(phone, message ?? `Halo ${tenant.name}, saya mau bertanya.`)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors ${className}`}
    >
      <MessageCircle size={16} /> {children}
    </a>
  );
}

function Header({ tenant }: { tenant: Tenant }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <a href="#" className="flex items-center gap-2.5">
          {tenant.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="h-9 w-auto max-w-[120px] rounded-lg object-contain"
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag size={17} className="text-white" />
            </div>
          )}
          <div className="text-left">
            {tenant.showBusinessName && (
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {tenant.name}
              </p>
            )}
            {tenant.showTagline && tenant.tagline && (
              <p className="text-gray-500 text-xs leading-tight">
                {tenant.tagline}
              </p>
            )}
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#produk" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Produk
          </a>
          <a href="#kategori" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Kategori
          </a>
        </nav>
        {tenant.showWhatsappButton && (
          <WaButton
            tenant={tenant}
            className="bg-primary text-white text-sm py-2 px-3"
          >
            WhatsApp
          </WaButton>
        )}
      </div>
    </header>
  );
}

function Hero({ tenant }: { tenant: Tenant }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white min-h-[460px] flex items-center">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm mb-6">
            <Sparkles size={14} />
            <span>{tenant.tagline || "Produk Berkualitas"}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight whitespace-pre-line">
            {tenant.bannerTitle || tenant.name}
          </h1>
          <p className="text-white/85 text-lg mb-8 leading-relaxed max-w-lg">
            {tenant.bannerSubtitle ||
              tenant.description ||
              "Belanja produk pilihan kami dengan mudah, langsung pesan via WhatsApp."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#produk"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              <ShoppingBag size={18} /> {tenant.heroCtaText || "Lihat Produk"}
            </a>
            {tenant.showWhatsappButton && (
              <WaButton
                tenant={tenant}
                message={`Halo ${tenant.name}, saya tertarik dengan produk Anda.`}
                className="justify-center px-6 py-3 bg-white/15 hover:bg-white/25 text-white"
              >
                Pesan via WhatsApp
              </WaButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories({ data }: { data: StorefrontData }) {
  if (data.categories.length === 0) return null;
  return (
    <section id="kategori" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-semibold mb-1">Kategori Produk</p>
          <h2 className="text-2xl font-bold text-gray-900">
            Temukan Produk Favorit Anda
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {cat._count.products} produk
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  tenant,
}: {
  product: StorefrontData["products"][number];
  tenant: Tenant;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={52} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBest && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-lg font-semibold">
              Terlaris
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-lg font-semibold">
              Baru
            </span>
          )}
          {tenant.showDiscount && discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-lg font-semibold">
              -{discount}%
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        {tenant.showCategory && product.category && (
          <p className="text-xs text-primary font-semibold mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        {tenant.showPrice && (
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900">
                {formatRupiah(product.price)}
              </p>
              {tenant.showDiscount && product.originalPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {formatRupiah(product.originalPrice)}
                </p>
              )}
            </div>
            {tenant.showStock && (
              <span
                className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                  product.stock > 10
                    ? "bg-green-50 text-green-700"
                    : "bg-orange-50 text-orange-700"
                }`}
              >
                {product.stock} stok
              </span>
            )}
          </div>
        )}
        {tenant.showWhatsappButton && (
          <WaButton
            tenant={tenant}
            message={`Halo, saya ingin pesan ${product.name}.`}
            className="w-full justify-center bg-primary text-white text-sm py-2"
          >
            Pesan Sekarang
          </WaButton>
        )}
      </div>
    </div>
  );
}

function Products({ data }: { data: StorefrontData }) {
  return (
    <section id="produk" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-semibold mb-1">Katalog</p>
          <h2 className="text-2xl font-bold text-gray-900">Produk Pilihan</h2>
        </div>
        {data.products.length === 0 ? (
          <p className="text-gray-500">Belum ada produk.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.products.map((p) => (
              <ProductCard key={p.id} product={p} tenant={data.tenant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer({ tenant }: { tenant: Tenant }) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <ShoppingBag size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white">{tenant.name}</p>
            {tenant.tagline && (
              <p className="text-xs text-gray-400">{tenant.tagline}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <BadgeCheck size={15} className="text-primary" />
          Didukung oleh MayWeb
        </div>
      </div>
    </footer>
  );
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();

  const { tenant } = data;
  const baseUrl = tenantBaseUrl(tenant.slug, tenant.customDomain);

  return (
    <div style={{ ["--color-primary" as string]: tenant.primaryColor }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: tenant.name,
          description: tenant.description ?? tenant.tagline ?? undefined,
          url: baseUrl,
          ...(tenant.logo ? { logo: tenant.logo } : {}),
          ...(waPhone(tenant) ? { telephone: waPhone(tenant) } : {}),
        }}
      />
      <Header tenant={tenant} />
      <main>
        <Hero tenant={tenant} />
        <Categories data={data} />
        <Products data={data} />
      </main>
      <Footer tenant={tenant} />
    </div>
  );
}
