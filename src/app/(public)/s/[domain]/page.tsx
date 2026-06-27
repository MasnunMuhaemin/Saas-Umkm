import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgePercent, ShoppingBag, Sparkles, ArrowRight, Tag } from "lucide-react";
import {
  getStorefront,
  type StorefrontData,
} from "@/server/services/public/storefront.service";
import { buildTenantMetadata, tenantBaseUrl } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { formatRupiah } from "@/lib/helpers/format";
import { WaButton, waPhone } from "./_components/storefront-chrome";

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

function Hero({ tenant }: { tenant: Tenant }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white min-h-[480px] flex items-center">
      <div className="absolute inset-0 bg-linear-to-br from-black/0 via-black/5 to-black/30" />
      <div className="absolute inset-0 bg-grid opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-white/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative w-full">
        <div className="max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-sm font-medium mb-7 shadow-soft">
            <Sparkles size={14} className="text-white" />
            <span>{tenant.tagline || "Produk Berkualitas"}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05] whitespace-pre-line">
            {tenant.bannerTitle || tenant.name}
          </h1>
          <p className="text-white/85 text-lg md:text-xl mb-9 leading-relaxed max-w-lg">
            {tenant.bannerSubtitle ||
              tenant.description ||
              "Belanja produk pilihan kami dengan mudah, langsung pesan via WhatsApp."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#produk"
              className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3.5 rounded-xl font-bold shadow-float hover:shadow-2xl transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} /> {tenant.heroCtaText || "Lihat Produk"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            {tenant.showWhatsappButton && (
              <WaButton
                tenant={tenant}
                message={`Halo ${tenant.name}, saya tertarik dengan produk Anda.`}
                className="justify-center px-7 py-3.5 bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 text-white active:scale-[0.98]"
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

function PromoBanner({ tenant }: { tenant: Tenant }) {
  if (!tenant.promoEnabled) return null;
  return (
    <section className="py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-amber-500 via-orange-500 to-rose-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 p-8 shadow-float">
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <BadgePercent size={16} />
              <span className="font-bold text-xs uppercase tracking-wider">Promo Spesial</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-1.5">
              {tenant.promoTitle || "Promo Eksklusif untuk Anda!"}
            </h3>
            {tenant.promoSubtitle && (
              <p className="text-white/90 text-sm md:text-base">{tenant.promoSubtitle}</p>
            )}
            {tenant.promoCode && (
              <p className="text-white/90 text-sm mt-2">
                Gunakan kode:{" "}
                <span className="bg-white/25 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-mono font-bold tracking-wide">
                  {tenant.promoCode}
                </span>{" "}
                saat pesan via WhatsApp
              </p>
            )}
          </div>
          {tenant.showWhatsappButton && (
            <WaButton
              tenant={tenant}
              message={`Halo, saya mau klaim promo${tenant.promoCode ? ` (kode ${tenant.promoCode})` : ""}.`}
              className="relative flex-none bg-white text-orange-600 hover:bg-orange-50 px-7 py-3.5 shadow-float active:scale-[0.98]"
            >
              Klaim Promo
            </WaButton>
          )}
        </div>
      </div>
    </section>
  );
}

function Categories({ data }: { data: StorefrontData }) {
  if (data.categories.length === 0) return null;
  return (
    <section id="kategori" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
            Kategori Produk
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Temukan Produk Favorit Anda
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-soft hover:-translate-y-1 hover:shadow-card transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag size={22} />
              </div>
              <p className="text-sm font-bold text-slate-900">{cat.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
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
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-float hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
      <a href={`/produk/${product.slug}`} className="block">
        <div className="relative h-52 bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden">
          {product.mainImage ? (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={52} className="text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBest && (
              <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-soft backdrop-blur-sm">
                Terlaris
              </span>
            )}
            {product.isNew && (
              <span className="bg-linear-to-r from-emerald-500 to-green-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-soft">
                Baru
              </span>
            )}
            {tenant.showDiscount && discount > 0 && (
              <span className="bg-linear-to-r from-rose-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-soft">
                -{discount}%
              </span>
            )}
          </div>
        </div>
      </a>
      <div className="p-4">
        {tenant.showCategory && product.category && (
          <p className="text-xs text-primary font-bold uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}
        <a href={`/produk/${product.slug}`}>
          <h3 className="font-display text-sm font-bold text-slate-900 mb-2.5 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </a>
        {tenant.showPrice && (
          <div className="flex items-end justify-between mb-3.5">
            <div>
              <p className="font-display font-extrabold text-lg text-slate-900 leading-none">
                {formatRupiah(product.price)}
              </p>
              {tenant.showDiscount && product.originalPrice && (
                <p className="text-xs text-slate-400 line-through mt-1">
                  {formatRupiah(product.originalPrice)}
                </p>
              )}
            </div>
            {tenant.showStock && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                  product.stock > 10
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
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
            className="w-full justify-center bg-primary text-white text-sm py-2.5 shadow-soft hover:opacity-90 active:scale-[0.98]"
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
    <section id="produk" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
              Katalog
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Produk Pilihan
            </h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400">
            <Tag size={15} /> {data.products.length} produk
          </span>
        </div>
        {data.products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada produk.</p>
          </div>
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

export default async function StorefrontHome({
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
    <>
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
      <Hero tenant={tenant} />
      <PromoBanner tenant={tenant} />
      <Categories data={data} />
      <Products data={data} />
    </>
  );
}
