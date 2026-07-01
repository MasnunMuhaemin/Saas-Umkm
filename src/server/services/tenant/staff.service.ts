import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";
import type { AddStaffInput } from "@/lib/validations/staff.schema";

/**
 * Kelola staff/kasir toko. Owner = User pemilik (Tenant.userId); staff =
 * TenantUser role STAFF. Aksi tambah/hapus hanya untuk owner (ownerProcedure).
 */
export const staffService = {
  async list(tenantId: string) {
    const [tenant, staff] = await Promise.all([
      prisma.tenant.findUniqueOrThrow({
        where: { id: tenantId },
        select: { user: { select: { name: true, email: true } } },
      }),
      prisma.tenantUser.findMany({
        where: { tenantId, role: "STAFF" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      owner: { name: tenant.user.name, email: tenant.user.email },
      staff: staff.map((s) => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        joinedAt: formatDate(s.createdAt),
      })),
    };
  },

  /** Tambah staff: buat User (MERCHANT) + TenantUser (STAFF). */
  async add(tenantId: string, input: AddStaffInput) {
    const exists = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });
    if (exists)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email sudah terdaftar.",
      });

    const hash = await bcrypt.hash(input.password, 10);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.toLowerCase(),
          password: hash,
          role: "MERCHANT",
        },
      });
      await tx.tenantUser.create({
        data: { tenantId, userId: user.id, role: "STAFF" },
      });
    });
    return { ok: true };
  },

  /** Hapus staff (TenantUser + akun User-nya). Cek kepemilikan tenant. */
  async remove(tenantId: string, tenantUserId: string) {
    const tu = await prisma.tenantUser.findUnique({
      where: { id: tenantUserId },
      select: { tenantId: true, userId: true, role: true },
    });
    if (!tu || tu.tenantId !== tenantId || tu.role !== "STAFF")
      throw new TRPCError({ code: "NOT_FOUND", message: "Staff tidak ada." });

    await prisma.$transaction([
      prisma.tenantUser.delete({ where: { id: tenantUserId } }),
      prisma.user.delete({ where: { id: tu.userId } }),
    ]);
    return { ok: true };
  },
};
