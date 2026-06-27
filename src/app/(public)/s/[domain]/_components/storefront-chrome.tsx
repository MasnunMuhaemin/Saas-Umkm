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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <a href="/" className="flex items-center gap-2.5">
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
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Beranda
          </a>
          <a href="/#produk" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Produk
          </a>
          <a href="/kontak" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Kontak
          </a>
        </nav>
        {tenant.showWhatsappButton && (
          <WaButton tenant={tenant} className="bg-primary text-white text-sm py-2 px-3">
            WhatsApp
          </WaButton>
        )}
      </div>
    </header>
  );
}

export function StoreFooter({ tenant }: { tenant: StoreTenant }) {
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
