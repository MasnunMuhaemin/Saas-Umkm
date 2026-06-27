import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { assertTenantOwns } from "@/lib/helpers/ownership";
import type { StoreVariantInput } from "@/lib/validations/variant.schema";

/** Pastikan varian milik produk milik tenant ini. */
async function assertVariantOwned(variantId: string, tenantId: string) {
  const v = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { tenantId: true } } },
  });
  if (!v || v.product.tenantId !== tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Varian tidak ditemukan atau bukan milik Anda.",
    });
  }
}

export const variantService = {
  list: async (tenantId: string, productId: string) => {
    await assertTenantOwns("product", productId, tenantId);
    return prisma.productVariant.findMany({
      where: { productId },
      select: { id: true, name: true, sku: true, price: true, stock: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async add(tenantId: string, productId: string, data: StoreVariantInput) {
    await assertTenantOwns("product", productId, tenantId);
    await prisma.productVariant.create({ data: { ...data, productId } });
    return { ok: true };
  },

  async update(tenantId: string, id: string, data: StoreVariantInput) {
    await assertVariantOwned(id, tenantId);
    await prisma.productVariant.update({ where: { id }, data });
    return { ok: true };
  },

  async remove(tenantId: string, id: string) {
    await assertVariantOwned(id, tenantId);
    await prisma.productVariant.delete({ where: { id } });
    return { ok: true };
  },
};
