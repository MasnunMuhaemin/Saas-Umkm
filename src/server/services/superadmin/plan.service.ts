import { prisma } from "@/server/db";
import type { PlanUpdateInput } from "@/lib/validations/superadmin.schema";

export const superAdminPlanService = {
  list: async () => {
    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        maxProducts: true,
        hasSeo: true,
        hasPos: true,
        hasInvoice: true,
        hasCustomerDb: true,
        isActive: true,
        features: true,
        _count: { select: { tenants: true } },
      },
    });
    return plans.map((p) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features.map(String) : [],
    }));
  },

  async update(id: string, data: PlanUpdateInput) {
    await prisma.plan.update({ where: { id }, data });
    return { ok: true };
  },
};
