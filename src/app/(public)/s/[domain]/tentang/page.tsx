import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { getStorefront } from "@/server/services/public/storefront.service";
import { buildTenantMetadata } from "@/lib/seo/metadata";
import { WaButton } from "../_components/storefront-chrome";

type Params = Promise<{ domain: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) return { title: "Tidak ditemukan" };
  const { tenant } = data;
  return buildTenantMetadata({
    name: tenant.name,
    titleSuffix: "Tentang Kami",
    description:
      tenant.aboutBody ?? tenant.description ?? `Tentang ${tenant.name}.`,
    slug: tenant.slug,
    customDomain: tenant.customDomain,
    logo: tenant.logo,
    path: "/tentang",
  });
}

export default async function AboutPage({ params }: { params: Params }) {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();
  const { tenant } = data;

  const checklist = Array.isArray(tenant.aboutChecklist)
    ? (tenant.aboutChecklist as string[]).filter(Boolean)
    : [];

  const bodyText =
    tenant.aboutBody ||
    tenant.description ||
    `${tenant.name} berkomitmen menghadirkan produk terbaik untuk Anda.`;

  // Pecah body jadi paragraf: prioritaskan baris kosong (\n\n), fallback ke \n.
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .flatMap((block) => (block.includes("\n\n") ? [block] : block.split("\n")))
    .map((p) => p.trim())
    .filter(Boolean);

  const leadParagraph =
    tenant.description || paragraphs[0] || bodyText;

  const storeInitial = tenant.name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium hover:text-primary transition-colors">
            Beranda
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Tentang Kami</span>
        </div>
      </div>

      {/* Hero / header band */}
      <section className="bg-primary/5 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center animate-fade-up">
          <p className="text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Tentang Kami
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
            {tenant.aboutHeadline || `Tentang ${tenant.name}`}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
            {leadParagraph}
          </p>
          {tenant.yearsExperience > 0 && (
            <div className="mt-7 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">
              <Star size={15} className="fill-current" />
              {tenant.yearsExperience}+ tahun pengalaman
            </div>
          )}
        </div>
      </section>

      {/* Cerita + gambar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap"
              >
                {p}
              </p>
            ))}

            {checklist.length > 0 && (
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none mt-0.5">
                      <Check size={16} />
                    </span>
                    <span className="text-slate-700 text-sm font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-first md:order-last">
            {tenant.aboutImage ? (
              <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                <Image
                  src={tenant.aboutImage}
                  alt={tenant.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-4/3 rounded-3xl border border-slate-100 shadow-sm bg-primary/10 text-primary flex items-center justify-center">
                <span className="font-display text-6xl sm:text-7xl font-bold">
                  {storeInitial}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Strip statistik */}
      {tenant.heroStats.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-primary text-white rounded-3xl px-6 py-10 sm:px-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
              {tenant.heroStats.map((stat, i) => (
                <div key={i} className="px-4 py-4 text-center">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-white/80 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Keunggulan */}
      {tenant.advantages.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center mb-10">
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
                Keunggulan
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Mengapa Memilih Kami
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tenant.advantages.map((adv, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Sparkles size={22} />
                  </div>
                  {adv.title && (
                    <h3 className="font-display font-bold text-slate-900 mb-1.5">
                      {adv.title}
                    </h3>
                  )}
                  {adv.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {adv.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimoni */}
      {tenant.testimonials.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
              Testimoni
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Apa Kata Mereka
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenant.testimonials.map((t, i) => (
              <figure
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col"
              >
                <div className="flex items-center gap-0.5 mb-3 text-primary">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={16}
                      className={
                        s < t.rating
                          ? "fill-current"
                          : "fill-none text-slate-200"
                      }
                    />
                  ))}
                </div>
                {t.text && (
                  <blockquote className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                )}
                {t.name && (
                  <figcaption className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-primary/5 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Tertarik dengan produk kami?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Hubungi kami langsung atau jelajahi katalog produk {tenant.name}.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <WaButton
              tenant={tenant}
              className="bg-primary text-white px-7 py-3.5 shadow-sm hover:opacity-90 active:scale-95"
            >
              Hubungi via WhatsApp
            </WaButton>
            <a
              href="/produk"
              className="inline-flex items-center gap-2 rounded-xl font-semibold px-7 py-3.5 border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              Lihat Produk <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
