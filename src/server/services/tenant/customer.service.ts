import { prisma } from "@/server/db";
import { createBaseService } from "@/server/services/shared/base.service";
import { assertTenantOwns } from "@/lib/helpers/ownership";
import type { StoreCustomerInput } from "@/lib/validations/customer.schema";
import type { Prisma } from "@/generated/prisma/client";

const base = createBaseService("customer");

const customerListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  province: true,
  postalCode: true,
  totalOrders: true,
  totalSpent: true,
} satisfies Prisma.CustomerSelect;

export type CustomerRow = Prisma.CustomerGetPayload<{
  select: typeof customerListSelect;
}>;

export const customerService = {
  getAll: (tenantId: string): Promise<CustomerRow[]> =>
    prisma.customer.findMany({
      where: { tenantId },
      select: customerListSelect,
      orderBy: { createdAt: "desc" },
    }),

  store: (tenantId: string, data: StoreCustomerInput) =>
    prisma.customer.create({ data: { ...data, tenantId } }),

  async update(
    tenantId: string,
    id: string,
    data: Partial<StoreCustomerInput>,
  ) {
    await assertTenantOwns("customer", id, tenantId);
    return prisma.customer.update({ where: { id }, data });
  },

  destroy: (tenantId: string, id: string) => base.delete(tenantId, id),
};
