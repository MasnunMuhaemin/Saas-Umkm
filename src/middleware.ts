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

  // 1. Subdomain tenant → rewrite ke route publik (_sites/[domain])
  const subdomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
    ? hostname.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.rewrite(
      new URL(`/_sites/${subdomain}${path}`, req.url),
    );
  }

  // 2. Guard role berbasis sesi (req.auth diisi oleh wrapper auth())
  const role = req.auth?.user?.role;

  if (path.startsWith("/super-admin") && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (path.startsWith("/dashboard") && role !== "MERCHANT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
