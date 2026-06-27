import { prisma } from "@/server/db";
import { logAudit } from "@/lib/helpers/audit";
import type { Prisma } from "@/generated/prisma/client";

const tenantListSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  createdAt: true,
  plan: { select: { name: true } },
  user: { select: { name: true, email: true } },
} satisfies Prisma.TenantSelect;

export type AdminTenantRow = Prisma.TenantGetPayload<{
  select: typeof tenantListSelect;
}>;

export const superAdminTenantService = {
  list: (): Promise<AdminTenantRow[]> =>
    prisma.tenant.findMany({
      select: tenantListSelect,
      orderBy: { createdAt: "desc" },
    }),

  /** Suspend / aktifkan tenant — dicatat ke audit log. */
  async setStatus(
    tenantId: string,
    status: "ACTIVE" | "SUSPENDED",
    adminUserId: string,
  ) {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status } });
    await logAudit({
      userId: adminUserId,
      tenantId,
      action: status === "SUSPENDED" ? "tenant.suspend" : "tenant.activate",
      metadata: { status },
    });
    return { ok: true };
  },
};
