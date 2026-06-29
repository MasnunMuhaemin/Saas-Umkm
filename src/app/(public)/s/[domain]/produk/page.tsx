import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import {
  getStorefront,
  getStorefrontProducts,
} from "@/server/services/public/storefront.service";
import { buildTenantMetadata } from "@/lib/seo/metadata";
import { ProductCard, ProductRow } from "../_components/product-card";

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
    titleSuffix: "Produk",
    description:
      tenant.description ?? tenant.tagline ?? `Produk dari ${tenant.name}.`,
    slug: tenant.slug,
    customDomain: tenant.customDomain,
    logo: tenant.logo,
    path: "/produk",
  });
}

export default async function ProductsListingPage({
  params,
}: {
  params: Params;
}) {
  const { domain } = await params;
  const data = await getStorefront(domain);
  if (!data) notFound();
  const products = await getStorefrontProducts(domain);
  const isList = data.tenant.productStyle === "list";

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-semibold mb-1">Katalog</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Semua Produk
            </h1>
          </div>
          <span className="text-sm font-semibold text-slate-400">
            {products.length} produk
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada produk.</p>
          </div>
        ) : isList ? (
          <div className="space-y-3 max-w-3xl mx-auto">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} tenant={data.tenant} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} tenant={data.tenant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
