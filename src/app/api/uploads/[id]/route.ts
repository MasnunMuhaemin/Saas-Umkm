import { prisma } from "@/server/db";

/** Sajikan gambar dari tabel Asset. URL bersifat immutable (id unik) → cache lama. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    select: { mime: true, data: true },
  });
  if (!asset) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
