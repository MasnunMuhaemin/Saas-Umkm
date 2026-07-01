import { prisma } from "@/server/db";

const PAGE_SIZE = 30;

const dtFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export type AuditRow = {
  id: string;
  action: string;
  createdAt: string;
  actor: string;
  actorEmail: string | null;
  tenant: string | null;
  detail: string | null;
};

/** Daftar audit log (aksi sensitif) — paginasi, nama pelaku & tenant di-resolve. */
export const auditService = {
  async list(page = 1) {
    const skip = (Math.max(1, page) - 1) * PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.auditLog.count(),
    ]);

    const userIds = [
      ...new Set(rows.map((r) => r.userId).filter(Boolean) as string[]),
    ];
    const tenantIds = [
      ...new Set(rows.map((r) => r.tenantId).filter(Boolean) as string[]),
    ];
    const [users, tenants] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      }),
      prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, name: true },
      }),
    ]);
    const userMap = new Map(users.map((u) => [u.id, u]));
    const tenantMap = new Map(tenants.map((t) => [t.id, t.name]));

    const list: AuditRow[] = rows.map((r) => {
      const meta =
        r.metadata && typeof r.metadata === "object"
          ? Object.entries(r.metadata as Record<string, unknown>)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(" · ")
          : null;
      const u = r.userId ? userMap.get(r.userId) : null;
      // tenant: dari relasi userId? tidak — pakai tenantId; jika sudah dihapus, cek metadata.
      const tenantName = r.tenantId
        ? (tenantMap.get(r.tenantId) ?? "(dihapus)")
        : null;
      return {
        id: r.id,
        action: r.action,
        createdAt: dtFmt.format(r.createdAt),
        actor: u ? u.name : "Sistem",
        actorEmail: u ? u.email : null,
        tenant: tenantName,
        detail: meta,
      };
    });

    return {
      rows: list,
      total,
      page: Math.max(1, page),
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  },
};
