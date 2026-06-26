import { prisma } from "@/server/db";

/** Ubah teks jadi slug: "Kue Nastar" → "kue-nastar". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate slug unik per tenant untuk model apa pun (product, category, dll).
 * Reusable — tinggal pass nama model Prisma.
 */
export async function generateUniqueSlug(
  model: "product" | "category",
  tenantId: string,
  name: string,
  exceptId?: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  // akses dinamis ke delegate Prisma
  const delegate = prisma[model] as unknown as {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
  };

  while (
    await delegate.findFirst({
      where: { tenantId, slug, ...(exceptId && { id: { not: exceptId } }) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
