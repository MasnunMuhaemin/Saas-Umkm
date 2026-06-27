import { router, protectedProcedure } from "@/server/trpc";
import { dashboardRouter } from "./tenant/dashboard";
import { productRouter } from "./tenant/product";
import { categoryRouter } from "./tenant/category";
import { settingsRouter } from "./tenant/settings";
import { websiteRouter } from "./tenant/website";
import { customerRouter } from "./tenant/customer";

/**
 * Root router — gabungan semua feature router.
 * Feature router (product, category, order, superadmin, dll) ditambahkan di sini
 * seiring fitur dibangun. Router tetap TIPIS: validasi input lalu panggil service.
 */
export const appRouter = router({
  /** Echo sesi user saat ini — untuk smoke test client/server tRPC. */
  me: protectedProcedure.query(({ ctx }) => ctx.user),

  dashboard: dashboardRouter,
  product: productRouter,
  category: categoryRouter,
  settings: settingsRouter,
  website: websiteRouter,
  customer: customerRouter,
});

export type AppRouter = typeof appRouter;
