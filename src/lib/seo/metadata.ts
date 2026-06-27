import type { Metadata } from "next";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";
const IS_PROD = process.env.NODE_ENV === "production";

/** URL dasar toko publik tenant (custom domain jika ada, else subdomain). */
export function tenantBaseUrl(slug: string, customDomain?: string | null) {
  if (customDomain) return `https://${customDomain}`;
  return `https://${slug}.${ROOT_DOMAIN}`;
}

/**
 * Metadata SEO untuk halaman toko publik — title absolut (tanpa template MayWeb),
 * canonical, Open Graph, Twitter. Production index; non-prod noindex.
 */
export function buildTenantMetadata(opts: {
  name: string;
  description?: string | null;
  slug: string;
  customDomain?: string | null;
  logo?: string | null;
  path?: string;
  titleSuffix?: string;
}): Metadata {
  const base = tenantBaseUrl(opts.slug, opts.customDomain);
  const url = base + (opts.path ?? "");
  const title = opts.titleSuffix ? `${opts.titleSuffix} — ${opts.name}` : opts.name;
  const description =
    opts.description ?? `Belanja produk ${opts.name} secara online.`;
  const images = opts.logo ? [opts.logo] : [];

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: opts.name,
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    robots: IS_PROD
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
