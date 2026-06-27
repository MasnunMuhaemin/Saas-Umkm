import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-gray-500">
          <a href="/" className="hover:text-primary transition-colors">
            Beranda
          </a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tentang Kami</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {tenant.aboutHeadline || `Tentang ${tenant.name}`}
        </h1>

        {tenant.yearsExperience > 0 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            {tenant.yearsExperience}+ tahun pengalaman
          </div>
        )}

        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
          {tenant.aboutBody ||
            tenant.description ||
            `${tenant.name} berkomitmen menghadirkan produk terbaik untuk Anda.`}
        </p>

        {checklist.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Mengapa Memilih Kami</h2>
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary flex-none" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
