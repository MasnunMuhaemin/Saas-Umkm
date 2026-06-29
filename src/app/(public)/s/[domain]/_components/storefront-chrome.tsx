import Image from "next/image";
import {
  BadgeCheck,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { buildWaLink } from "@/lib/helpers/whatsapp";
import type { StorefrontData } from "@/server/services/public/storefront.service";

type StoreTenant = StorefrontData["tenant"];

export function waPhone(t: StoreTenant) {
  return t.whatsapp || t.phone || "";
}

export function WaButton({
  tenant,
  message,
  children,
  className = "",
}: {
  tenant: StoreTenant;
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

const NAV = [
  ["/", "Beranda"],
  ["/produk", "Produk"],
  ["/tentang", "Tentang"],
  ["/kontak", "Kontak"],
] as const;

export function StoreHeader({ tenant }: { tenant: StoreTenant }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <a href="/" className="flex items-center gap-2.5">
          {tenant.logo ? (
            <Image
              src={tenant.logo}
              alt={tenant.name}
              width={120}
              height={36}
              className="h-9 w-auto max-w-[120px] rounded-lg object-contain"
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag size={17} className="text-white" />
            </div>
          )}
          <div className="text-left">
            {tenant.showBusinessName && (
              <p className="font-display font-bold text-slate-900 text-sm leading-tight">
                {tenant.name}
              </p>
            )}
            {tenant.showTagline && tenant.tagline && (
              <p className="text-slate-500 text-xs leading-tight">
                {tenant.tagline}
              </p>
            )}
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-7">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        {tenant.showWhatsappButton && (
          <WaButton
            tenant={tenant}
            className="bg-primary text-white text-sm py-2.5 px-4 shadow-sm hover:opacity-90 active:scale-95"
          >
            WhatsApp
          </WaButton>
        )}
      </div>
    </header>
  );
}

export function StoreFooter({ tenant }: { tenant: StoreTenant }) {
  const s = tenant.socialLinks;
  const socials = [
    s.instagram && { label: "Instagram", url: s.instagram },
    s.tiktok && { label: "TikTok", url: s.tiktok },
    s.facebook && { label: "Facebook", url: s.facebook },
    s.youtube && { label: "YouTube", url: s.youtube },
  ].filter(Boolean) as { label: string; url: string }[];
  const address = [tenant.address, tenant.city, tenant.province]
    .filter(Boolean)
    .join(", ");
  const phone = waPhone(tenant);

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-14 pb-8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          {/* Brand + sosial */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg flex-none">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <p className="font-display font-bold text-white text-lg">
                {tenant.name}
              </p>
            </div>
            {(tenant.description || tenant.tagline) && (
              <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
                {tenant.description || tenant.tagline}
              </p>
            )}
            {socials.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Ikuti Kami
                </p>
                <div className="flex flex-wrap gap-2">
                  {socials.map((so) => (
                    <a
                      key={so.label}
                      href={so.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {so.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigasi + Kontak — dikelompokkan di sisi kanan */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 lg:gap-20">
            {/* Navigasi */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Navigasi
              </p>
              <ul className="space-y-2">
                {NAV.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

            {/* Kontak */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Kontak
              </p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 flex-none text-primary" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2.5">
                  <MessageCircle size={15} className="flex-none text-primary" />
                  <span>{phone}</span>
                </li>
              )}
              {tenant.email && (
                <li className="flex items-center gap-2.5">
                  <Mail size={15} className="flex-none text-primary" />
                  <span>{tenant.email}</span>
                </li>
              )}
              {tenant.openingHours && (
                <li className="flex items-center gap-2.5">
                  <Clock size={15} className="flex-none text-primary" />
                  <span>{tenant.openingHours}</span>
                </li>
              )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {tenant.name}
          </p>
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <BadgeCheck size={15} className="text-primary" /> Didukung oleh{" "}
            <span className="font-semibold text-slate-200">MayWeb</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
