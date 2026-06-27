import { prisma } from "@/server/db";

export const superAdminDashboardService = {
  /** Statistik platform: total tenant, status, MRR, distribusi paket. */
  async getStats() {
    const [tenants, totalProducts] = await Promise.all([
      prisma.tenant.findMany({
        select: { status: true, plan: { select: { price: true, name: true } } },
      }),
      prisma.product.count(),
    ]);

    const count = (s: string) => tenants.filter((t) => t.status === s).length;
    const mrr = tenants.reduce((sum, t) => sum + (t.plan?.price ?? 0), 0);

    const dist = tenants.reduce<Record<string, number>>((acc, t) => {
      const k = t.plan?.name ?? "Unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalTenants: tenants.length,
      active: count("ACTIVE"),
      trial: count("TRIAL"),
      suspended: count("SUSPENDED"),
      expired: count("EXPIRED"),
      totalProducts,
      mrr,
      planDist: Object.entries(dist).map(([name, count]) => ({ name, count })),
    };
  },
};
