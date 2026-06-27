import Image from "next/image";
import { BadgeCheck, MessageCircle, ShoppingBag } from "lucide-react";
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
          <a href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Beranda
          </a>
          <a href="/#produk" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Produk
          </a>
          <a href="/tentang" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Tentang
          </a>
          <a href="/kontak" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Kontak
          </a>
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
  return (
    <footer className="relative bg-slate-950 text-slate-300 py-14 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white">{tenant.name}</p>
            {tenant.tagline && (
              <p className="text-xs text-slate-400">{tenant.tagline}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <BadgeCheck size={15} className="text-primary" />
          Didukung oleh <span className="font-semibold text-slate-200">MayWeb</span>
        </div>
      </div>
    </footer>
  );
}
