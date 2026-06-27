import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

// Adapter mariadb (Prisma 7) — parse DATABASE_URL jadi PoolConfig.
const url = new URL(process.env.DATABASE_URL ?? "");
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1).split("?")[0],
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Plans ─────────────────────────────────────────────────────────────────
  await prisma.plan.upsert({
    where: { slug: "basic" },
    update: {},
    create: {
      name: "Basic",
      slug: "basic",
      price: 100000,
      maxProducts: 50,
      hasSeo: false,
      hasPos: false,
      hasInvoice: false,
      hasCustomerDb: false,
      isPopular: true,
      sortOrder: 1,
      features: [
        "Website Landing Page",
        "Profil Bisnis",
        "Katalog Produk",
        "WhatsApp Order",
        "Website Builder",
        "Dashboard Admin",
      ],
    },
  });

  const plus = await prisma.plan.upsert({
    where: { slug: "plus" },
    update: {},
    create: {
      name: "Plus",
      slug: "plus",
      price: 150000,
      maxProducts: null, // unlimited
      hasSeo: true,
      hasPos: true,
      hasInvoice: true,
      hasCustomerDb: true,
      sortOrder: 2,
      features: [
        "Semua fitur Basic",
        "Optimasi SEO",
        "Sistem Kasir (POS)",
        "Invoice PDF & Riwayat",
        "Manajemen Data Pelanggan",
      ],
    },
  });

  // ─── Super Admin ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@tokopintar.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@tokopintar.id",
      password: await bcrypt.hash("superadmin123", 10),
      role: "SUPERADMIN",
    },
  });

  // ─── Merchant demo (User + Tenant + Subscription + isi toko) ─────────────────
  const merchant = await prisma.user.upsert({
    where: { email: "owner@tokodemo.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "owner@tokodemo.id",
      password: await bcrypt.hash("merchant123", 10),
      role: "MERCHANT",
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "toko-demo" },
    update: {},
    create: {
      userId: merchant.id,
      planId: plus.id, // paket Plus agar fitur POS/Invoice/Pelanggan terbuka
      name: "Toko Demo",
      slug: "toko-demo",
      status: "ACTIVE",
      whatsapp: "081234567890",
      city: "Bandung",
      province: "Jawa Barat",
      tagline: "Kue & jajanan rumahan enak",
      description: "Toko demo untuk pengembangan MayWeb.",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // OWNER membership (multi-user per toko)
  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: merchant.id } },
    update: {},
    create: { tenantId: tenant.id, userId: merchant.id, role: "OWNER" },
  });

  // Subscription aktif
  await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planId: plus.id,
      status: "ACTIVE",
      startedAt: new Date(),
      currentEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Pelanggan contoh (idempotent — hanya jika belum ada)
  if ((await prisma.customer.count({ where: { tenantId: tenant.id } })) === 0) {
    await prisma.customer.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: "Ibu Sari Dewi",
          phone: "081234567890",
          city: "Bandung",
          province: "Jawa Barat",
        },
        {
          tenantId: tenant.id,
          name: "Pak Budi Santoso",
          phone: "081987654321",
          city: "Jakarta",
        },
      ],
    });
  }

  // Kategori + produk contoh (biar dashboard ada isinya)
  const kategori = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "kue-kering" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Kue Kering",
      slug: "kue-kering",
      sortOrder: 1,
    },
  });

  const produkContoh = [
    { name: "Nastar Premium", slug: "nastar-premium", price: 85000, stock: 40, isBest: true },
    { name: "Kastengel Keju", slug: "kastengel-keju", price: 95000, stock: 25, isNew: true },
    { name: "Putri Salju", slug: "putri-salju", price: 70000, stock: 60 },
  ];

  for (const p of produkContoh) {
    await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: p.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        categoryId: kategori.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        status: "ACTIVE",
        isBest: p.isBest ?? false,
        isNew: p.isNew ?? false,
      },
    });
  }

  console.log("✅ Seed selesai:");
  console.log("   Super Admin : admin@tokopintar.id / superadmin123");
  console.log("   Merchant    : owner@tokodemo.id   / merchant123  (Toko Demo)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed gagal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
