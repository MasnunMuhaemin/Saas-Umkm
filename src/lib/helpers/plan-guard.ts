import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";

export type PlanFeature = "hasSeo" | "hasPos" | "hasInvoice" | "hasCustomerDb";

/**
 * Pastikan paket tenant punya fitur tertentu. Lempar FORBIDDEN jika tidak.
 * Enforcement di SERVER (bukan hanya lock UI).
 */
export async function assertPlanFeature(tenantId: string, feature: PlanFeature) {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      plan: {
        select: {
          hasSeo: true,
          hasPos: true,
          hasInvoice: true,
          hasCustomerDb: true,
        },
      },
    },
  });
  if (!tenant.plan[feature]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Fitur ini hanya tersedia untuk paket Plus. Silakan upgrade.",
    });
  }
}

/**
 * Pastikan tenant belum melewati batas jumlah produk paketnya (null = unlimited).
 */
export async function assertProductQuota(tenantId: string) {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { plan: { select: { maxProducts: true } } },
  });
  const max = tenant.plan.maxProducts;
  if (max === null) return; // unlimited
  const count = await prisma.product.count({ where: { tenantId } });
  if (count >= max) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Batas ${max} produk untuk paket Anda sudah tercapai. Upgrade untuk menambah lagi.`,
    });
  }
}
