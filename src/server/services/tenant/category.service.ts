import { prisma } from "@/server/db";

export const categoryService = {
  /** Daftar kategori aktif (untuk dropdown filter & form produk). */
  listForSelect: (tenantId: string) =>
    prisma.category.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
};
