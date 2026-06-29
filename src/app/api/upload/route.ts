import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_MB } from "@/lib/constants/config";
import { captureError } from "@/lib/logger";

/** Upload 1 gambar → simpan binary ke tabel Asset (DB), balas { url }. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ada." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format harus JPG, PNG, atau WebP." },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Ukuran maksimal ${MAX_UPLOAD_MB}MB.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await prisma.asset.create({
      data: {
        mime: file.type,
        data: buffer,
        tenantId: session.user.tenantId ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json({ url: `/api/uploads/${asset.id}` });
  } catch (e) {
    captureError(e, { where: "upload" });
    return NextResponse.json({ error: "Gagal mengunggah." }, { status: 500 });
  }
}
