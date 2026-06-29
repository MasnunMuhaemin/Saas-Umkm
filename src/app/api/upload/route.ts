import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_MB } from "@/lib/constants/config";
import { captureError } from "@/lib/logger";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Upload 1 gambar → simpan ke public/uploads, balas { url }. (Login wajib.) */
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

    const ext = EXT[file.type] ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    captureError(e, { where: "upload" });
    return NextResponse.json({ error: "Gagal mengunggah." }, { status: 500 });
  }
}
