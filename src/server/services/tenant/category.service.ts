import { prisma } from "@/server/db";
import { createBaseService } from "@/server/services/shared/base.service";
import { generateUniqueSlug } from "@/lib/helpers/slug";
import { assertTenantOwns } from "@/lib/helpers/ownership";
import { revalidateStorefront } from "@/server/services/public/storefront.service";
import type { StoreCategoryInput } from "@/lib/validations/category.schema";
import type { Prisma } from "@/generated/prisma/client";

const base = createBaseService("category");

/** Field tabel kategori (+ jumlah produk) — sempit agar tipe ringan. */
const categoryListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  icon: true,
  isActive: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategorySelect;

export type CategoryRow = Prisma.CategoryGetPayload<{
  select: typeof categoryListSelect;
}>;

export const categoryService = {
  /** Daftar kategori (untuk dropdown filter & form produk). */
  listForSelect: (tenantId: string) =>
    prisma.category.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),

  /** Daftar kategori lengkap + jumlah produk (halaman manajemen). */
  getAll: (tenantId: string): Promise<CategoryRow[]> =>
    prisma.category.findMany({
      where: { tenantId },
      select: categoryListSelect,
      orderBy: { createdAt: "desc" },
    }),

  async store(tenantId: string, data: StoreCategoryInput) {
    const slug = await generateUniqueSlug("category", tenantId, data.name);
    const c = await prisma.category.create({ data: { ...data, tenantId, slug } });
    await revalidateStorefront(tenantId);
    return c;
  },

  async update(
    tenantId: string,
    id: string,
    data: Partial<StoreCategoryInput>,
  ) {
    const existing = (await assertTenantOwns(
      "category",
      id,
      tenantId,
    )) as { name: string };
    const patch: Prisma.CategoryUncheckedUpdateInput = { ...data };
    if (data.name && data.name !== existing.name) {
      patch.slug = await generateUniqueSlug("category", tenantId, data.name, id);
    }
    const c = await prisma.category.update({ where: { id }, data: patch });
    await revalidateStorefront(tenantId);
    return c;
  },

  async destroy(tenantId: string, id: string) {
    const r = await base.delete(tenantId, id);
    await revalidateStorefront(tenantId);
    return r;
  },
};

