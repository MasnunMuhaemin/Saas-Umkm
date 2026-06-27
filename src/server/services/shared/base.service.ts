import { prisma } from "@/server/db";
import { paginate } from "@/lib/helpers/paginate";
import { assertTenantOwns } from "@/lib/helpers/ownership";

type ModelName = "product" | "category" | "order" | "customer";

/**
 * Factory base service: operasi umum (list, findOne, delete) untuk model
 * tenant-scoped apa pun. Service spesifik fokus ke logika uniknya saja (DRY).
 */
export function createBaseService(model: ModelName) {
  const delegate = prisma[model] as unknown as {
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: unknown) => Promise<number>;
    delete: (args: unknown) => Promise<unknown>;
  };

  return {
    list: (
      tenantId: string,
      opts: {
        where?: Record<string, unknown>;
        include?: unknown;
        select?: unknown;
        orderBy?: unknown;
        page?: number;
      } = {},
    ) =>
      paginate(delegate, {
        ...opts,
        where: { ...opts.where, tenantId },
      }),

    findOne: (tenantId: string, id: string) =>
      assertTenantOwns(model, id, tenantId),

    async delete(tenantId: string, id: string) {
      await assertTenantOwns(model, id, tenantId);
      return delegate.delete({ where: { id } });
    },
  };
}
