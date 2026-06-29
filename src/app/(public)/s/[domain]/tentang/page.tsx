import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import { getStorefront } from "@/server/services/public/storefront.service";
import { buildTenantMetadata } from "@/lib/seo/metadata";

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

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium hover:text-primary transition-colors">
            Beranda
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Tentang Kami</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 animate-fade-up">
        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
          Tentang Kami
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
          {tenant.aboutHeadline || `Tentang ${tenant.name}`}
        </h1>

        {tenant.yearsExperience > 0 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-7 shadow-soft">
            {tenant.yearsExperience}+ tahun pengalaman
          </div>
        )}

        {tenant.aboutImage ? (
          <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
              {tenant.aboutBody ||
                tenant.description ||
                `${tenant.name} berkomitmen menghadirkan produk terbaik untuk Anda.`}
            </p>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
              <Image
                src={tenant.aboutImage}
                alt={tenant.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap mb-10">
            {tenant.aboutBody ||
              tenant.description ||
              `${tenant.name} berkomitmen menghadirkan produk terbaik untuk Anda.`}
          </p>
        )}

        {tenant.advantages.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
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

        {checklist.length > 0 && (
          <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 sm:p-8 shadow-soft">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900 mb-5">
              Mengapa Memilih Kami
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none">
                    <CheckCircle2 size={18} />
                  </span>
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
