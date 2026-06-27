import { prisma } from "@/server/db";
import { createBaseService } from "@/server/services/shared/base.service";
import { generateUniqueSlug } from "@/lib/helpers/slug";
import { assertTenantOwns } from "@/lib/helpers/ownership";
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
  getById: (tenantId: string, id: string) =>
    prisma.product.findFirstOrThrow({
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
        status: true,
        metaTitle: true,
        metaDescription: true,
      },
    }),

  /** Buat produk — slug via helper reusable. */
  async store(tenantId: string, data: StoreProductInput) {
    const slug = await generateUniqueSlug("product", tenantId, data.name);
    return prisma.product.create({ data: { ...data, tenantId, slug } });
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
    return prisma.product.update({ where: { id }, data: patch });
  },

  /** Hapus — reuse base.delete (sudah cek ownership). */
  destroy: (tenantId: string, id: string) => base.delete(tenantId, id),
};
