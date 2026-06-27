import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import { RESERVED_SUBDOMAINS } from "@/lib/constants/config";

// Instance edge-safe (authConfig tanpa Prisma) — hanya untuk baca sesi JWT.
const { auth } = NextAuth(authConfig);

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export default auth((req) => {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0]; // buang port
  const url = req.nextUrl;
  const path = url.pathname;

  // 1. Subdomain tenant → rewrite ke route publik /s/[domain]
  //    Dukung domain produksi (slug.tokopintar.id) & dev (slug.localhost).
  let subdomain: string | null = null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
  } else if (hostname.endsWith(".localhost")) {
    subdomain = hostname.replace(".localhost", "");
  }

  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Rewrite ke route publik /s/[domain]. (Hindari prefix "_" — folder
    // berawalan underscore bersifat private di Next App Router.)
    return NextResponse.rewrite(new URL(`/s/${subdomain}${path}`, req.url));
  }

  // 1b. Custom domain (mis. tokosaya.com) → rewrite ke /s/<host>.
  //     getStorefront mencocokkan host ke field customDomain tenant.
  const isPlatformHost =
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname.endsWith(`.${ROOT_DOMAIN}`) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");

  if (!isPlatformHost && hostname.includes(".")) {
    return NextResponse.rewrite(new URL(`/s/${hostname}${path}`, req.url));
  }

  // 2. Guard role berbasis sesi (req.auth diisi oleh wrapper auth())
  const role = req.auth?.user?.role;

  if (path.startsWith("/super-admin") && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (
    (path.startsWith("/dashboard") || path.startsWith("/onboarding")) &&
    role !== "MERCHANT"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
