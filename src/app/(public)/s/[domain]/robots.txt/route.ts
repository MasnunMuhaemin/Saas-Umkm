import { getStorefront } from "@/server/services/public/storefront.service";
import { tenantBaseUrl } from "@/lib/seo/metadata";

const IS_PROD = process.env.NODE_ENV === "production";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;
  const data = await getStorefront(domain);

  // Toko tak ada / non-prod → noindex.
  if (!data || !IS_PROD) {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  const base = tenantBaseUrl(data.tenant.slug, data.tenant.customDomain);
  const body = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
