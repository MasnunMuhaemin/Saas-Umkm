import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgePercent,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Tag,
  Check,
  Star,
} from "lucide-react";
import {
  getStorefront,
  type StorefrontData,
} from "@/server/services/public/storefront.service";
import { buildTenantMetadata, tenantBaseUrl } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { formatRupiah } from "@/lib/helpers/format";
import { WaButton, waPhone } from "./_components/storefront-chrome";
import { FaqAccordion } from "./_components/faq-accordion";

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
  const tagline = tenant.tagline || "Produk Berkualitas";
  const title = tenant.bannerTitle || tenant.name;
  const subtitle =
    tenant.bannerSubtitle ||
    tenant.description ||
    "Belanja produk pilihan kami dengan mudah, langsung pesan via WhatsApp.";
  const ctaLabel = tenant.heroCtaText || "Lihat Produk";
  const stats = tenant.heroStats;

  // Stats di atas blok warna (on-color)
  const statsOnColor = stats.length > 0 && (
    <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 mt-10 pt-6">
      {stats.map((s, i) => (
        <div key={i}>
          <p className="text-2xl font-bold">{s.value}</p>
          <p className="text-white/70 text-sm">{s.label}</p>
        </div>
      ))}
    </div>
  );

  // Stats untuk varian minimal (latar terang)
  const statsOnLight = stats.length > 0 && (
    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 border-t border-slate-200 mt-10 pt-6">
      {stats.map((s, i) => (
        <div key={i}>
          <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          <p className="text-slate-500 text-sm">{s.label}</p>
        </div>
      ))}
    </div>
  );

  // Background image (jika ada) untuk varian on-color
  const bgImageStyle = tenant.bannerImage
    ? {
        backgroundImage: `url(${tenant.bannerImage})`,
      }
    : undefined;

  // CTA di atas blok warna (tombol putih)
  const ctaOnColor = (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href="#produk"
        className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3.5 rounded-xl font-bold shadow-float hover:shadow-2xl transition-all active:scale-[0.98]"
      >
        <ShoppingBag size={18} /> {ctaLabel}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </a>
      {tenant.showWhatsappButton && (
        <WaButton
          tenant={tenant}
          message={`Halo ${tenant.name}, saya tertarik dengan produk Anda.`}
          className="justify-center px-7 py-3.5 bg-white/15 border border-white/25 hover:bg-white/25 text-white active:scale-[0.98]"
        >
          Pesan via WhatsApp
        </WaButton>
      )}
    </div>
  );

  // ===== MINIMAL: latar terang, rapi =====
  if (tenant.heroStyle === "minimal") {
    return (
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <p className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">
            {tagline}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-5 leading-[1.05] whitespace-pre-line">
            {title}
          </h1>
          <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#produk"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} /> {ctaLabel}
            </a>
            {tenant.showWhatsappButton && (
              <WaButton
                tenant={tenant}
                message={`Halo ${tenant.name}, saya tertarik dengan produk Anda.`}
                className="justify-center px-7 py-3.5 border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Pesan via WhatsApp
              </WaButton>
            )}
          </div>
          {statsOnLight}
        </div>
      </section>
    );
  }

  // ===== SPLIT: teks kiri + panel kanan =====
  if (tenant.heroStyle === "split") {
    return (
      <section
        className="relative bg-primary text-white overflow-hidden bg-cover bg-center"
        style={bgImageStyle}
      >
        {tenant.bannerImage && <div className="absolute inset-0 bg-black/50" />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} /> <span>{tagline}</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05] whitespace-pre-line">
              {title}
            </h1>
            <p className="text-white/85 text-lg mb-8 leading-relaxed max-w-lg">
              {subtitle}
            </p>
            {ctaOnColor}
            {statsOnColor}
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-sm rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              {tenant.logo ? (
                <Image
                  src={tenant.logo}
                  alt={tenant.name}
                  width={220}
                  height={220}
                  className="object-contain max-h-[60%] max-w-[70%]"
                />
              ) : (
                <span className="font-display text-8xl font-extrabold text-white/90">
                  {tenant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===== CENTERED (default) =====
  return (
    <section
      className="relative overflow-hidden bg-primary text-white bg-cover bg-center"
      style={bgImageStyle}
    >
      <div
        className={`absolute inset-0 ${tenant.bannerImage ? "bg-black/50" : "bg-black/[0.06]"}`}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 relative text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-sm font-medium mb-7">
          <Sparkles size={14} className="text-white" />
          <span>{tagline}</span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05] whitespace-pre-line">
          {title}
        </h1>
        <p className="text-white/85 text-lg md:text-xl mb-9 leading-relaxed max-w-xl mx-auto">
          {subtitle}
        </p>
        <div className="flex justify-center">{ctaOnColor}</div>
        {statsOnColor && (
          <div className="flex justify-center">{statsOnColor}</div>
        )}
      </div>
    </section>
  );
}

function PromoBanner({ tenant }: { tenant: Tenant }) {
  if (!tenant.promoEnabled) return null;
  return (
    <section className="py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-amber-500 text-white flex flex-col md:flex-row items-center justify-between gap-6 p-8 shadow-float">
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
        <div className="relative h-52 bg-slate-100 overflow-hidden">
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
              <span className="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-soft">
                Baru
              </span>
            )}
            {tenant.showDiscount && discount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-soft">
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

function ProductRow({
  product,
  tenant,
}: {
  product: StorefrontData["products"][number];
  tenant: Tenant;
}) {
  return (
    <div className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-soft p-3 hover:shadow-float transition-all">
      <a
        href={`/produk/${product.slug}`}
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 overflow-hidden flex-none"
      >
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={28} className="text-slate-300" />
          </div>
        )}
      </a>
      <div className="flex-1 min-w-0">
        {tenant.showCategory && product.category && (
          <p className="text-xs text-primary font-bold uppercase tracking-wide mb-0.5">
            {product.category.name}
          </p>
        )}
        <a href={`/produk/${product.slug}`}>
          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </a>
        {tenant.showPrice && (
          <p className="font-display font-extrabold text-lg text-slate-900 mt-1">
            {formatRupiah(product.price)}
          </p>
        )}
      </div>
      {tenant.showWhatsappButton && (
        <WaButton
          tenant={tenant}
          message={`Halo, saya ingin pesan ${product.name}.`}
          className="flex-none bg-primary text-white text-sm py-2.5 px-4 shadow-soft hover:opacity-90 active:scale-[0.98]"
        >
          Pesan
        </WaButton>
      )}
    </div>
  );
}

function Products({ data }: { data: StorefrontData }) {
  const isList = data.tenant.productStyle === "list";
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
        ) : isList ? (
          <div className="space-y-3 max-w-3xl mx-auto">
            {data.products.map((p) => (
              <ProductRow key={p.id} product={p} tenant={data.tenant} />
            ))}
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

function Advantages({ tenant }: { tenant: Tenant }) {
  if (tenant.advantages.length === 0) return null;
  const isList = tenant.advantagesStyle === "list";
  return (
    <section className="py-16 bg-slate-50">
      <div
        className={`mx-auto px-4 sm:px-6 ${isList ? "max-w-3xl" : "max-w-7xl"}`}
      >
        <div className="mb-10">
          <p className="text-primary text-sm font-semibold mb-1">
            Kenapa Memilih Kami
          </p>
          <h2 className="text-2xl font-bold text-slate-900">Keunggulan Kami</h2>
        </div>
        {isList ? (
          <div className="space-y-4">
            {tenant.advantages.map((adv, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none">
                  <Check size={20} />
                </div>
                <div>
                  {adv.title && (
                    <h3 className="font-bold text-slate-900 mb-0.5">
                      {adv.title}
                    </h3>
                  )}
                  {adv.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {adv.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenant.advantages.map((adv, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Check size={22} />
                </div>
                {adv.title && (
                  <h3 className="font-bold text-slate-900 mb-1.5">{adv.title}</h3>
                )}
                {adv.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {adv.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Testimonials({ tenant }: { tenant: Tenant }) {
  if (tenant.testimonials.length === 0) return null;
  const isHighlight = tenant.testimonialStyle === "highlight";
  const stars = (n: number) => (
    <div
      className={`flex gap-0.5 mb-3 ${isHighlight ? "justify-center" : ""}`}
    >
      {Array.from({ length: n }).map((_, s) => (
        <Star key={s} size={16} className="fill-current text-amber-400" />
      ))}
    </div>
  );
  return (
    <section className="py-16 bg-white">
      <div
        className={`mx-auto px-4 sm:px-6 ${isHighlight ? "max-w-3xl" : "max-w-7xl"}`}
      >
        <div className={`mb-10 ${isHighlight ? "text-center" : ""}`}>
          <p className="text-primary text-sm font-semibold mb-1">Kata Mereka</p>
          <h2 className="text-2xl font-bold text-slate-900">
            Apa Kata Pelanggan
          </h2>
        </div>
        {isHighlight ? (
          <div className="space-y-5">
            {tenant.testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center"
              >
                {stars(t.rating)}
                {t.text && (
                  <p className="text-slate-700 text-lg italic leading-relaxed mb-4">
                    &ldquo;{t.text}&rdquo;
                  </p>
                )}
                {t.name && (
                  <p className="font-bold text-slate-900">{t.name}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenant.testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                {stars(t.rating)}
                {t.text && (
                  <p className="text-slate-600 text-sm italic leading-relaxed mb-4">
                    &ldquo;{t.text}&rdquo;
                  </p>
                )}
                {t.name && (
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Faqs({ tenant }: { tenant: Tenant }) {
  if (tenant.faqs.length === 0) return null;
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-primary text-sm font-semibold mb-1">FAQ</p>
          <h2 className="text-2xl font-bold text-slate-900">Pertanyaan Umum</h2>
        </div>
        {tenant.faqStyle === "open" ? (
          <div className="space-y-3">
            {tenant.faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <p className="font-bold text-slate-900 mb-1.5">{f.question}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <FaqAccordion faqs={tenant.faqs} />
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
      <Advantages tenant={tenant} />
      <Testimonials tenant={tenant} />
      <Faqs tenant={tenant} />
    </>
  );
}
