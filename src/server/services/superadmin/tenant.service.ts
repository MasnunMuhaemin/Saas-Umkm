import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { logAudit } from "@/lib/helpers/audit";
import { sendEmail } from "@/lib/email/client";
import { welcomeEmail } from "@/lib/email/templates";
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from "@/lib/validations/superadmin.schema";
import type { Prisma } from "@/generated/prisma/client";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

const tenantListSelect = {
  id: true,
  name: true,
  slug: true,
  customDomain: true,
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

  /** Buat tenant baru: User + Tenant + Subscription + welcome email + audit. */
  async createTenant(input: CreateTenantInput, adminUserId: string) {
    const plan = await prisma.plan.findUnique({
      where: { slug: input.planSlug },
    });
    if (!plan)
      throw new TRPCError({ code: "BAD_REQUEST", message: "Paket tidak ditemukan." });

    // Cek bentrok email / slug lebih dulu (pesan ramah).
    const [emailUsed, slugUsed] = await Promise.all([
      prisma.user.findUnique({ where: { email: input.ownerEmail } }),
      prisma.tenant.findUnique({ where: { slug: input.slug } }),
    ]);
    if (emailUsed)
      throw new TRPCError({ code: "CONFLICT", message: "Email sudah terpakai." });
    if (slugUsed)
      throw new TRPCError({ code: "CONFLICT", message: "Subdomain sudah terpakai." });

    const hash = await bcrypt.hash(input.password, 10);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const tenant = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.ownerName,
          email: input.ownerEmail,
          password: hash,
          role: "MERCHANT",
        },
      });
      const t = await tx.tenant.create({
        data: {
          userId: user.id,
          planId: plan.id,
          name: input.name,
          slug: input.slug,
          status: "TRIAL",
          trialEndsAt,
        },
      });
      await tx.tenantUser.create({
        data: { tenantId: t.id, userId: user.id, role: "OWNER" },
      });
      await tx.subscription.create({
        data: { tenantId: t.id, planId: plan.id, status: "PENDING" },
      });
      return t;
    });

    await logAudit({
      userId: adminUserId,
      tenantId: tenant.id,
      action: "tenant.create",
      metadata: { slug: input.slug, plan: input.planSlug },
    });

    try {
      await sendEmail({
        to: input.ownerEmail,
        ...welcomeEmail({
          name: input.ownerName,
          storeUrl: `${input.slug}.${ROOT_DOMAIN}`,
        }),
      });
    } catch (e) {
      console.error("Gagal kirim welcome email:", e);
    }

    return { ok: true, tenantId: tenant.id };
  },

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

  /** Edit tenant: nama, subdomain, paket, status. Sinkron ke subscription + audit. */
  async updateTenant(input: UpdateTenantInput, adminUserId: string) {
    const plan = await prisma.plan.findUnique({
      where: { slug: input.planSlug },
      select: { id: true },
    });
    if (!plan)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Paket tidak ditemukan.",
      });

    const slugUsed = await prisma.tenant.findFirst({
      where: { slug: input.slug, NOT: { id: input.id } },
      select: { id: true },
    });
    if (slugUsed)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Subdomain sudah terpakai.",
      });

    await prisma.tenant.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug: input.slug,
        planId: plan.id,
        status: input.status,
      },
    });
    // Sinkronkan paket di subscription juga.
    await prisma.subscription.updateMany({
      where: { tenantId: input.id },
      data: { planId: plan.id },
    });

    await logAudit({
      userId: adminUserId,
      tenantId: input.id,
      action: "tenant.update",
      metadata: { slug: input.slug, plan: input.planSlug, status: input.status },
    });
    return { ok: true };
  },

  /** Hapus tenant + seluruh datanya (cascade) + akun pemilik. Dicatat audit. */
  async deleteTenant(tenantId: string, adminUserId: string) {
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { userId: true, slug: true, name: true },
    });
    if (!t)
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant tidak ada." });

    // Catat audit dulu (tanpa tenantId — tenant akan dihapus). AuditLog tak ber-FK.
    await logAudit({
      userId: adminUserId,
      action: "tenant.delete",
      metadata: { tenantId, slug: t.slug, name: t.name },
    });

    // Hapus tenant (cascade: produk, order, kategori, pelanggan, langganan, dll)
    // + akun pemilik.
    await prisma.$transaction([
      prisma.tenant.delete({ where: { id: tenantId } }),
      prisma.user.delete({ where: { id: t.userId } }),
    ]);
    return { ok: true };
  },
};
