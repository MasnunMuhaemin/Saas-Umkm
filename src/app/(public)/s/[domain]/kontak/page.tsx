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
      <div className="border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-gray-500">
          <a href="/" className="hover:text-primary transition-colors">
            Beranda
          </a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Kontak</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hubungi Kami</h1>
        <p className="text-gray-500 mb-8">
          Ada pertanyaan atau ingin memesan? Hubungi {tenant.name} langsung.
        </p>

        <div className="space-y-4 mb-8">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {r.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{r.value}</p>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="text-gray-500 text-sm">
              Informasi kontak belum dilengkapi.
            </p>
          )}
        </div>

        {tenant.showWhatsappButton && (
          <WaButton
            tenant={tenant}
            message={`Halo ${tenant.name}, saya ingin bertanya.`}
            className="bg-primary text-white px-6 py-3"
          >
            Chat via WhatsApp
          </WaButton>
        )}
      </div>
    </div>
  );
}
