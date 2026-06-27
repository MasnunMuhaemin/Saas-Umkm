import { getSitemapUrls } from "@/server/services/public/storefront.service";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;
  const data = await getSitemapUrls(domain);
  if (!data) return new Response("Not found", { status: 404 });

  const staticUrls = ["", "/tentang", "/kontak"].map(
    (p) => `<url><loc>${esc(data.base + p)}</loc></url>`,
  );
  const productUrls = data.products.map(
    (p) =>
      `<url><loc>${esc(`${data.base}/produk/${p.slug}`)}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...productUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
