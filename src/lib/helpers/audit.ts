import { prisma } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Catat aksi sensitif (suspend, impersonate, hapus tenant, ubah billing).
 * Dipakai di area super admin & aksi sensitif lain (CLAUDE.md §12).
 */
export async function logAudit(input: {
  userId?: string | null;
  tenantId?: string | null;
  action: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      tenantId: input.tenantId ?? null,
      action: input.action,
      metadata: input.metadata,
      ipAddress: input.ipAddress ?? null,
    },
  });
}
