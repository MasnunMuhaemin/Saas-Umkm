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

  /** Statistik global lintas semua tenant. */
  async getGlobalStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalProducts, totalOrders, revenueAgg, pageviews7d, topTenants] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.visitorEvent.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.tenant.findMany({
          select: {
            name: true,
            slug: true,
            _count: { select: { products: true, orders: true } },
          },
          orderBy: { products: { _count: "desc" } },
          take: 5,
        }),
      ]);
    return {
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg._sum.total ?? 0,
      pageviews7d,
      topTenants: topTenants.map((t) => ({
        name: t.name,
        slug: t.slug,
        products: t._count.products,
        orders: t._count.orders,
      })),
    };
  },
};
