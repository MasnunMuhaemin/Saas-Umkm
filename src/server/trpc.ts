import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "./auth";
import { prisma } from "./db";
import { assertPlanFeature, type PlanFeature } from "@/lib/helpers/plan-guard";

/** Context tiap request: sesi Auth.js + Prisma. auth() membaca cookie via next/headers. */
export async function createContext() {
  const session = await auth();
  return { session, prisma };
}

const t = initTRPC.context<typeof createContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

// ─── Guards (pengganti middleware role Laravel) ──────────────────────────────

/** Wajib login. */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { user: ctx.session.user } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

/** Area merchant — auto inject tenantId. */
export const merchantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "MERCHANT" || !ctx.user.tenantId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { tenantId: ctx.user.tenantId } });
});

/** Area super admin. */
export const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "SUPERADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

/** Merchant + gate fitur paket (mis. hasCustomerDb, hasPos). Enforce di server. */
export function planProcedure(feature: PlanFeature) {
  return merchantProcedure.use(async ({ ctx, next }) => {
    await assertPlanFeature(ctx.tenantId, feature);
    return next();
  });
}
