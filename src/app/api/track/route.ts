import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { captureError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/auth/rate-limit";

/** Beacon analytics first-party: catat 1 pageview toko (anonim). */
export async function POST(req: Request) {
  try {
    // Anti-spam: maksimal 60 event/menit per IP.
    const ipKey = req.headers.get("x-forwarded-for") ?? "0";
    if (!checkRateLimit(`track:${ipKey}`, 60, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const { domain, path } = await req.json();
    if (typeof domain !== "string" || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ slug: domain }, { customDomain: domain }] },
      select: { id: true },
    });
    if (!tenant) return NextResponse.json({ ok: false });

    const ip = req.headers.get("x-forwarded-for") ?? "0";
    const ua = req.headers.get("user-agent") ?? "";
    const day = new Date().toISOString().slice(0, 10);
    // visitorId anonim (hash IP+UA+hari) — unik harian, tanpa simpan IP mentah.
    const visitorId = crypto
      .createHash("sha256")
      .update(`${ip}|${ua}|${day}`)
      .digest("hex")
      .slice(0, 32);

    await prisma.visitorEvent.create({
      data: {
        tenantId: tenant.id,
        path: path.slice(0, 500),
        visitorId,
        referrer: req.headers.get("referer")?.slice(0, 500) ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureError(e, { where: "track" });
    return NextResponse.json({ ok: false });
  }
}
