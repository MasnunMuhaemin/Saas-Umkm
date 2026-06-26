import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";

type TenantScopedModel = "product" | "category" | "order" | "customer";

/**
 * Pastikan sebuah record milik tenant tertentu (guard keamanan multi-tenant).
 * Reusable untuk update/delete di semua modul. Lempar error kalau bukan miliknya.
 */
export async function assertTenantOwns(
  model: TenantScopedModel,
  id: string,
  tenantId: string,
) {
  // akses dinamis ke delegate Prisma
  const delegate = prisma[model] as unknown as {
    findFirst: (args: unknown) => Promise<unknown | null>;
  };
  const record = await delegate.findFirst({ where: { id, tenantId } });
  if (!record) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Data tidak ditemukan atau bukan milik Anda.",
    });
  }
  return record;
}
