import { router, protectedProcedure, publicProcedure } from "@/server/trpc";
import { billingService } from "@/server/services/shared/billing.service";
import { authRouter } from "./auth";
import { dashboardRouter } from "./tenant/dashboard";
import { productRouter } from "./tenant/product";
import { variantRouter } from "./tenant/variant";
import { categoryRouter } from "./tenant/category";
import { settingsRouter } from "./tenant/settings";
import { websiteRouter } from "./tenant/website";
import { customerRouter } from "./tenant/customer";
import { orderRouter } from "./tenant/order";
import { billingRouter } from "./tenant/billing";
import { onboardingRouter } from "./tenant/onboarding";
import { superDashboardRouter } from "./superadmin/dashboard";
import { tenantAdminRouter } from "./superadmin/tenant";
import { planAdminRouter } from "./superadmin/plan";
import { notificationAdminRouter } from "./superadmin/notification";
import { couponAdminRouter } from "./superadmin/coupon";

/**
 * Root router — gabungan semua feature router.
 * Feature router (product, category, order, superadmin, dll) ditambahkan di sini
 * seiring fitur dibangun. Router tetap TIPIS: validasi input lalu panggil service.
 */
export const appRouter = router({
  /** Echo sesi user saat ini — untuk smoke test client/server tRPC. */
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  /** Daftar paket publik (harga dari DB) — dipakai landing & form daftar. */
  plans: publicProcedure.query(() => billingService.listPlans()),

  auth: authRouter,
  dashboard: dashboardRouter,
  product: productRouter,
  variant: variantRouter,
  category: categoryRouter,
  settings: settingsRouter,
  website: websiteRouter,
  customer: customerRouter,
  order: orderRouter,
  billing: billingRouter,
  onboarding: onboardingRouter,

  superadmin: router({
    dashboard: superDashboardRouter,
    tenant: tenantAdminRouter,
    plan: planAdminRouter,
    notification: notificationAdminRouter,
    coupon: couponAdminRouter,
  }),
});

export type AppRouter = typeof appRouter;
