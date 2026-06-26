import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export const dashboardService = {
  /** Data untuk shell dashboard (header sidebar): nama toko, paket, slug, url. */
  async getShellData(tenantId: string) {
    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        name: true,
        slug: true,
        customDomain: true,
        plan: { select: { name: true } },
      },
    });
    return {
      businessName: tenant.name,
      planName: tenant.plan.name,
      slug: tenant.slug,
      storeUrl:
        tenant.customDomain ?? `${tenant.slug}.${ROOT_DOMAIN}`,
    };
  },

  /** KPI + grafik + ringkasan untuk halaman utama dashboard. */
  async getOverview(tenantId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    const [tenant, activeProducts, ordersThisMonth, revenueAgg, recentOrders, topProducts, weekOrders] =
      await Promise.all([
        prisma.tenant.findUniqueOrThrow({
          where: { id: tenantId },
          select: { slug: true, customDomain: true },
        }),
        prisma.product.count({ where: { tenantId, status: "ACTIVE" } }),
        prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
        prisma.order.aggregate({
          where: { tenantId, createdAt: { gte: monthStart } },
          _sum: { total: true },
        }),
        prisma.order.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentStatus: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        }),
        prisma.product.findMany({
          where: { tenantId },
          orderBy: { soldCount: "desc" },
          take: 5,
          select: { id: true, name: true, soldCount: true },
        }),
        prisma.order.findMany({
          where: { tenantId, createdAt: { gte: weekAgo } },
          select: { total: true, createdAt: true },
        }),
      ]);

    const revenueThisMonth = revenueAgg._sum.total ?? 0;
    const avgTransaction =
      ordersThisMonth > 0 ? Math.round(revenueThisMonth / ordersThisMonth) : 0;

    // Seri pendapatan 7 hari terakhir (bucket per hari)
    const salesSeries = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const pendapatan = weekOrders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return (
            od.getDate() === d.getDate() &&
            od.getMonth() === d.getMonth() &&
            od.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, o) => sum + o.total, 0);
      return {
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        pendapatan,
      };
    });

    return {
      storeUrl: tenant.customDomain ?? `${tenant.slug}.${ROOT_DOMAIN}`,
      stats: { activeProducts, ordersThisMonth, revenueThisMonth, avgTransaction },
      salesSeries,
      topProducts: topProducts.map((p) => ({ name: p.name, sold: p.soldCount })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        paid: o.paymentStatus === "PAID",
        date: formatDate(o.createdAt),
        customerName: o.customer?.name ?? "Walk-in",
      })),
    };
  },
};
