import { prisma } from "@/server/db";
import { createBaseService } from "@/server/services/shared/base.service";
import { generateUniqueSlug } from "@/lib/helpers/slug";
import { assertTenantOwns } from "@/lib/helpers/ownership";
import { assertProductQuota } from "@/lib/helpers/plan-guard";
import { revalidateStorefront } from "@/server/services/public/storefront.service";
import type {
  StoreProductInput,
  ListProductInput,
} from "@/lib/validations/product.schema";
import type { Paginated } from "@/lib/helpers/paginate";
import type { Prisma, $Enums } from "@/generated/prisma/client";

const base = createBaseService("product");

/** Field yang dipakai tabel daftar produk — sempit agar tipe ringan & tak over-fetch. */
const productListSelect = {
  id: true,
  name: true,
  sku: true,
  price: true,
  stock: true,
  status: true,
  category: { select: { name: true } },
} satisfies Prisma.ProductSelect;

export type ProductRow = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

export const productService = {
  /** List produk ter-paginasi + filter (reuse base.list + paginate helper). */
  getPaginated(
    tenantId: string,
    filters: ListProductInput,
  ): Promise<Paginated<ProductRow>> {
    const where: Prisma.ProductWhereInput = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          { sku: { contains: filters.search } },
        ],
      }),
      ...(filters.category && { categoryId: filters.category }),
      ...(filters.status && { status: filters.status as $Enums.ProductStatus }),
    };
    return base.list(tenantId, {
      where: where as Record<string, unknown>,
      select: productListSelect,
      page: filters.page,
    }) as unknown as Promise<Paginated<ProductRow>>;
  },

  /** Ambil 1 produk milik tenant (untuk form edit). Lempar jika bukan miliknya.
   *  Select field form saja → payload plain & serializable ke Client Component. */
  async getById(tenantId: string, id: string) {
    const p = await prisma.product.findFirstOrThrow({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        categoryId: true,
        sku: true,
        description: true,
        price: true,
        originalPrice: true,
        stock: true,
        weight: true,
        mainImage: true,
        images: true,
        status: true,
        metaTitle: true,
        metaDescription: true,
      },
    });
    // Json → string[] eksplisit (hindari tipe Json yang dalam di tRPC)
    return {
      ...p,
      images: Array.isArray(p.images) ? p.images.map(String) : [],
    };
  },

  /** Buat produk — cek kuota paket dulu, lalu slug via helper reusable. */
  async store(tenantId: string, data: StoreProductInput) {
    await assertProductQuota(tenantId);
    const slug = await generateUniqueSlug("product", tenantId, data.name);
    const p = await prisma.product.create({ data: { ...data, tenantId, slug } });
    await revalidateStorefront(tenantId);
    return p;
  },

  /** Update produk — ownership via helper, slug regen jika nama berubah. */
  async update(
    tenantId: string,
    id: string,
    data: Partial<StoreProductInput>,
  ) {
    const existing = (await assertTenantOwns(
      "product",
      id,
      tenantId,
    )) as { name: string };
    const patch: Prisma.ProductUncheckedUpdateInput = { ...data };
    if (data.name && data.name !== existing.name) {
      patch.slug = await generateUniqueSlug("product", tenantId, data.name, id);
    }
    const p = await prisma.product.update({ where: { id }, data: patch });
    await revalidateStorefront(tenantId);
    return p;
  },

  /** Hapus — reuse base.delete (sudah cek ownership). */
  async destroy(tenantId: string, id: string) {
    const r = await base.delete(tenantId, id);
    await revalidateStorefront(tenantId);
    return r;
  },

  /** Hapus banyak — filter tenantId memastikan hanya milik sendiri. */
  async bulkDelete(tenantId: string, ids: string[]) {
    const r = await prisma.product.deleteMany({
      where: { tenantId, id: { in: ids } },
    });
    await revalidateStorefront(tenantId);
    return r;
  },

  /** Ubah status banyak produk sekaligus. */
  async bulkSetStatus(
    tenantId: string,
    ids: string[],
    status: $Enums.ProductStatus,
  ) {
    const r = await prisma.product.updateMany({
      where: { tenantId, id: { in: ids } },
      data: { status },
    });
    await revalidateStorefront(tenantId);
    return r;
  },

  /** Baris untuk export CSV (semua produk tenant). */
  exportRows: (tenantId: string) =>
    prisma.product.findMany({
      where: { tenantId },
      select: {
        name: true,
        sku: true,
        price: true,
        stock: true,
        status: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),

  /** Import produk massal dari CSV. Slug di-generate per baris. */
  async bulkImport(
    tenantId: string,
    rows: {
      name: string;
      sku?: string | null;
      price?: number;
      stock?: number;
      description?: string | null;
    }[],
  ) {
    let created = 0;
    for (const r of rows) {
      if (!r.name?.trim()) continue;
      const slug = await generateUniqueSlug("product", tenantId, r.name);
      await prisma.product.create({
        data: {
          tenantId,
          name: r.name,
          slug,
          sku: r.sku || null,
          price: r.price ?? 0,
          stock: r.stock ?? 0,
          description: r.description || null,
          status: "ACTIVE",
        },
      });
      created++;
    }
    await revalidateStorefront(tenantId);
    return { created };
  },
};
