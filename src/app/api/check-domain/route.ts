import { prisma } from "@/server/db";

/**
 * Validasi untuk Caddy on-demand TLS.
 * Sebelum menerbitkan sertifikat HTTPS untuk sebuah host, Caddy memanggil:
 *   GET /api/check-domain?domain=<host>
 * Balas 200 => host sah (boleh terbit). Selain itu => tolak (cegah pihak lain
 * mengarahkan domain sembarang ke server kita lalu memicu penerbitan sertifikat).
 */
const ROOT = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id"
).toLowerCase();

const allow = () => new Response("ok", { status: 200 });
const deny = () => new Response("no", { status: 403 });

export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams
    .get("domain")
    ?.toLowerCase()
    .trim();
  if (!domain) return new Response("missing domain", { status: 400 });

  // Domain platform utama (root & www).
  if (domain === ROOT || domain === `www.${ROOT}`) return allow();

  // Subdomain toko: <slug>.<ROOT> → cek slug tenant.
  if (domain.endsWith(`.${ROOT}`)) {
    const slug = domain.slice(0, domain.length - ROOT.length - 1);
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    return tenant ? allow() : deny();
  }

  // Domain custom merchant (mis. tokosaya.com) → cek field customDomain.
  const tenant = await prisma.tenant.findFirst({
    where: { customDomain: domain },
    select: { id: true },
  });
  return tenant ? allow() : deny();
}
