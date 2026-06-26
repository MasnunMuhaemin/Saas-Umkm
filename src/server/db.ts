import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Bangun adapter mariadb dari DATABASE_URL.
 * Driver mariadb menolak skema `mysql://`, jadi URL di-parse jadi PoolConfig.
 * (Prisma CLI/migrate tetap pakai DATABASE_URL mentah via prisma.config.ts.)
 */
function buildAdapter() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1).split("?")[0],
    connectionLimit: 5,
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: buildAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Tenant Isolation (pengganti Global Scope Laravel) ───────────────────────

/**
 * Inject filter tenantId otomatis ke setiap operasi model tenant-scoped.
 * Tipe callback $allOperations Prisma bersifat generic-union yang tak bisa
 * di-narrow; pakai any terbatas (sesuai pola resmi Prisma extension).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scopeTenant(tenantId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ args, query }: { args: any; query: (args: any) => Promise<any> }) => {
    args.where = { ...args.where, tenantId };
    return query(args);
  };
}

/**
 * Prisma client yang otomatis scope ke 1 tenant — mencegah kebocoran data
 * antar tenant. Pakai di service layer area merchant.
 */
export function tenantDb(tenantId: string) {
  return prisma.$extends({
    query: {
      product: { $allOperations: scopeTenant(tenantId) },
      category: { $allOperations: scopeTenant(tenantId) },
      order: { $allOperations: scopeTenant(tenantId) },
      customer: { $allOperations: scopeTenant(tenantId) },
    },
  });
}
