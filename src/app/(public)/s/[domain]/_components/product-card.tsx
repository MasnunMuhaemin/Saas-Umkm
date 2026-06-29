import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/lib/helpers/format";
import type { StorefrontData } from "@/server/services/public/storefront.service";
import { WaButton } from "./storefront-chrome";

type Tenant = StorefrontData["tenant"];
type Product = StorefrontData["products"][number];

export function ProductCard({
  product,
  tenant,
}: {
  product: Product;
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

export function ProductRow({
  product,
  tenant,
}: {
  product: Product;
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
