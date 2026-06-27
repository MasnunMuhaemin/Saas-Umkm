import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
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
    titleSuffix: "Kontak",
    description: `Hubungi ${tenant.name}. Pesan langsung via WhatsApp.`,
    slug: tenant.slug,
    customDomain: tenant.customDomain,
    logo: tenant.logo,
    path: "/kontak",
  });
}

export default async function ContactPage({ params }: { params: Params }) {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();
  const { tenant } = data;

  const fullAddress = [tenant.address, tenant.city, tenant.province]
    .filter(Boolean)
    .join(", ");

  const rows = [
    tenant.phone && { icon: Phone, label: "Telepon", value: tenant.phone },
    tenant.email && { icon: Mail, label: "Email", value: tenant.email },
    fullAddress && { icon: MapPin, label: "Alamat", value: fullAddress },
    tenant.openingHours && {
      icon: Clock,
      label: "Jam Buka",
      value: tenant.openingHours,
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="font-medium hover:text-primary transition-colors">
            Beranda
          </a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Kontak</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 animate-fade-up">
        <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
          Kontak
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
          Hubungi Kami
        </h1>
        <p className="text-slate-500 text-lg mb-9">
          Ada pertanyaan atau ingin memesan? Hubungi {tenant.name} langsung.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-9">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className="group flex items-start gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {r.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{r.value}</p>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="text-slate-500 text-sm sm:col-span-2">
              Informasi kontak belum dilengkapi.
            </p>
          )}
        </div>

        {tenant.showWhatsappButton && (
          <div className="rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-center shadow-float">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white mb-2">
              Siap membantu Anda
            </h2>
            <p className="text-slate-300 text-sm mb-5">
              Chat langsung dan dapatkan respon cepat dari tim kami.
            </p>
            <WaButton
              tenant={tenant}
              message={`Halo ${tenant.name}, saya ingin bertanya.`}
              className="bg-primary text-white px-7 py-3.5 shadow-float active:scale-[0.98]"
            >
              Chat via WhatsApp
            </WaButton>
          </div>
        )}
      </div>
    </div>
  );
}
