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

  /** Statistik penjualan merchant (halaman /dashboard/stats). */
  async getStats(tenantId: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueAgg, txCount, itemsAgg, monthOrders, topItems, payments] =
      await Promise.all([
        prisma.order.aggregate({ where: { tenantId }, _sum: { total: true } }),
        prisma.order.count({ where: { tenantId } }),
        prisma.orderItem.aggregate({
          where: { order: { tenantId } },
          _sum: { quantity: true },
        }),
        prisma.order.findMany({
          where: { tenantId, createdAt: { gte: sixMonthsAgo } },
          select: { total: true, createdAt: true },
        }),
        prisma.orderItem.groupBy({
          by: ["productName"],
          where: { order: { tenantId } },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        prisma.order.groupBy({
          by: ["paymentMethod"],
          where: { tenantId },
          _count: { _all: true },
          _sum: { total: true },
        }),
      ]);

    const revenue = revenueAgg._sum.total ?? 0;
    const itemsSold = itemsAgg._sum.quantity ?? 0;
    const avg = txCount > 0 ? Math.round(revenue / txCount) : 0;

    const series = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const pendapatan = monthOrders
        .filter((o) => {
          const od = new Date(o.createdAt);
          return (
            od.getMonth() === d.getMonth() &&
            od.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, o) => s + o.total, 0);
      return { label: d.toLocaleDateString("id-ID", { month: "short" }), pendapatan };
    });

    return {
      revenue,
      txCount,
      itemsSold,
      avg,
      series,
      topProducts: topItems.map((t) => ({
        name: t.productName,
        sold: t._sum.quantity ?? 0,
      })),
      payments: payments.map((p) => ({
        method: p.paymentMethod ?? "lainnya",
        count: p._count._all,
        total: p._sum.total ?? 0,
      })),
    };
  },
};
