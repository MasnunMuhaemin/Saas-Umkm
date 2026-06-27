import { router, protectedProcedure } from "@/server/trpc";
import { dashboardRouter } from "./tenant/dashboard";
import { productRouter } from "./tenant/product";
import { categoryRouter } from "./tenant/category";

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
});

export type AppRouter = typeof appRouter;
