# Backend Architecture Guide
## TokoPintar — Next.js 15 + tRPC + Prisma + MySQL

---

## 1. Arsitektur Umum

```
HTTP Request
    │
    ▼
middleware.ts (Edge)
    ├── Deteksi subdomain → resolve tenant (slug.tokopintar.id)
    ├── Cek sesi Auth.js (cookie)
    └── Guard role (redirect jika tidak berizin)
    │
    ▼
Routing (App Router)
    ├── app/(public)/[domain]/*   → Website publik tenant (SSR/ISR)
    ├── app/(auth)/login          → Halaman auth
    ├── app/(superadmin)/*        → Halaman Super Admin
    └── app/(tenant)/dashboard/*  → Halaman Merchant
    │
    ▼
tRPC Router (type-safe API layer)
    │
    ├── protectedProcedure (cek auth + role)
    ├── input validation pakai Zod
    └── panggil Service
    │
    ▼
Service Layer (logika bisnis + DB queries)
    │
    ▼
Prisma Client (+ tenant extension) → MySQL
```

---

## 2. Struktur Folder

```
src/
├── app/                                  # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   │
│   ├── (superadmin)/super-admin/
│   │   ├── layout.tsx                     # Guard role SUPERADMIN
│   │   ├── page.tsx                       # Dashboard
│   │   ├── tenants/page.tsx
│   │   ├── plans/page.tsx
│   │   ├── domains/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (tenant)/dashboard/
│   │   ├── layout.tsx                     # Guard role MERCHANT
│   │   ├── page.tsx                       # Dashboard merchant
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── store-builder/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (public)/                          # Website publik (via subdomain)
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Beranda toko
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   │
│   └── api/
│       ├── trpc/[trpc]/route.ts           # Handler tRPC
│       └── auth/[...nextauth]/route.ts    # Handler Auth.js
│
├── server/
│   ├── trpc.ts                            # Init tRPC, context, procedures
│   ├── routers/
│   │   ├── _app.ts                        # Root router (gabung semua)
│   │   ├── superadmin/
│   │   │   ├── tenant.ts
│   │   │   ├── dashboard.ts
│   │   │   └── notification.ts
│   │   └── tenant/
│   │       ├── product.ts
│   │       ├── category.ts
│   │       ├── order.ts
│   │       ├── customer.ts
│   │       ├── dashboard.ts
│   │       └── store-builder.ts
│   │
│   ├── services/                          # Logika bisnis + query DB
│   │   ├── superadmin/
│   │   │   ├── tenant.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── notification.service.ts
│   │   └── tenant/
│   │       ├── product.service.ts
│   │       ├── category.service.ts
│   │       ├── order.service.ts
│   │       ├── customer.service.ts
│   │       ├── dashboard.service.ts
│   │       └── store-builder.service.ts
│   │
│   ├── auth.ts                            # Konfigurasi Auth.js (NextAuth v5)
│   └── db.ts                              # Prisma client singleton + extension
│
├── lib/
│   ├── validations/                       # Skema Zod (pengganti Form Request)
│   │   ├── tenant.schema.ts
│   │   ├── product.schema.ts
│   │   └── order.schema.ts
│   ├── helpers/                           # ← Fungsi reusable (dipakai di mana saja)
│   │   ├── slug.ts                        # generateSlug, slugify
│   │   ├── paginate.ts                    # paginate() generik untuk semua model
│   │   ├── format.ts                      # formatRupiah, formatDate, formatPhone
│   │   ├── whatsapp.ts                    # buildWaLink (pesan WA pre-filled)
│   │   ├── ownership.ts                   # assertTenantOwns (guard kepemilikan)
│   │   └── upload.ts                      # validateImage (tipe + ukuran)
│   ├── constants/                         # ← Konstanta reusable (no magic string)
│   │   ├── status.ts                      # label & warna status order/produk
│   │   └── config.ts                      # PER_PAGE, MAX_UPLOAD_MB, dll
│   ├── seo/                               # ← Helper SEO reusable
│   │   ├── metadata.ts                    # buildTenantMetadata, tenantBaseUrl
│   │   └── json-ld.tsx                    # JsonLd (aman XSS), productSchema, dll
│   ├── email/                            # ← Email transaksional reusable
│   │   ├── client.ts                      # sendEmail (Resend/SMTP)
│   │   └── templates.ts                   # template email (welcome, invoice, dll)
│   ├── trpc/
│   │   ├── client.ts                      # tRPC client (React)
│   │   └── server.ts                      # tRPC server-caller (RSC)
│   └── utils.ts                           # cn() & helper kecil lain
│
├── components/
│   ├── ui/                                # shadcn primitives
│   ├── shared/                            # ← Komponen reusable lintas halaman
│   │   ├── data-table.tsx                 # Tabel + search + filter + paginasi
│   │   ├── page-header.tsx                # Header halaman (judul + aksi)
│   │   ├── confirm-dialog.tsx             # Dialog konfirmasi hapus
│   │   ├── form-field.tsx                 # Wrapper input + label + error
│   │   ├── stat-card.tsx                  # KPI card dashboard
│   │   ├── status-badge.tsx               # Badge status (warna dari constants)
│   │   ├── empty-state.tsx                # Tampilan data kosong
│   │   └── image-upload.tsx               # Upload gambar + preview
│   └── ...                                # Komponen spesifik fitur
│
├── server/services/shared/               # ← Logika service reusable
│   ├── base.service.ts                    # CRUD generik tenant-scoped
│   └── notification.service.ts            # Notifikasi dipakai banyak modul
│
├── types/
│   └── index.ts
│
└── middleware.ts                          # Subdomain + auth + role guard

prisma/
├── schema.prisma                          # Definisi schema (pengganti migration manual)
├── migrations/                            # Auto-generate via prisma migrate
└── seed.ts                                # Seeder (plans + super admin)
```

---

## 3. Prisma Schema (`prisma/schema.prisma`)

> Pengganti Model + Migration Laravel. Cukup edit file ini, lalu jalankan `prisma migrate dev`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPERADMIN
  MERCHANT
}

enum TenantStatus {
  ACTIVE
  TRIAL
  SUSPENDED
  EXPIRED
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(MERCHANT)
  emailVerified DateTime?
  tenant        Tenant?
  tenantUsers   TenantUser[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Plan {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  price         Int
  maxProducts   Int?
  storageGb     Int?
  customDomain  Boolean  @default(false)
  hasSeo        Boolean  @default(false)
  hasPos        Boolean  @default(false)
  hasInvoice    Boolean  @default(false)
  hasCustomerDb Boolean  @default(false)
  features      Json
  isPopular     Boolean  @default(false)
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  tenants       Tenant[]
  subscriptions Subscription[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Tenant {
  id                 String       @id @default(cuid())
  userId             String       @unique
  planId             String
  name               String
  slug               String       @unique
  customDomain       String?      @unique
  status             TenantStatus @default(TRIAL)
  trialEndsAt        DateTime?
  // Kontak
  phone              String?
  whatsapp           String?
  email              String?
  address            String?      @db.Text
  city               String?
  province           String?
  // Branding
  logo               String?
  favicon            String?
  primaryColor       String       @default("#2563EB")
  theme              String       @default("modern-store")
  // Visibilitas elemen
  showBusinessName   Boolean      @default(true)
  showTagline        Boolean      @default(true)
  showPrice          Boolean      @default(true)
  showStock          Boolean      @default(true)
  showRating         Boolean      @default(true)
  showWhatsappButton Boolean      @default(true)
  showCategory       Boolean      @default(true)
  showDiscount       Boolean      @default(true)
  // Konten website
  tagline            String?
  description        String?      @db.Text
  bannerTitle        String?
  bannerSubtitle     String?      @db.Text
  bannerImage        String?
  aboutHeadline      String?
  aboutBody          String?      @db.Text
  aboutImage         String?
  aboutChecklist     Json?
  yearsExperience    Int          @default(0)
  heroCtaText        String?
  heroStats          Json?
  testimonials       Json?
  faqs               Json?
  advantages         Json?
  // Promo
  promoEnabled       Boolean      @default(false)
  promoTitle         String?
  promoSubtitle      String?      @db.Text
  promoCode          String?
  promoImage         String?
  // Social & SEO
  socialLinks        Json?
  seoSettings        Json?
  googleMapsUrl      String?      @db.Text
  openingHours       String?
  // Langganan
  subscriptionStart  DateTime?
  subscriptionEnd    DateTime?
  // Relasi
  user               User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan               Plan          @relation(fields: [planId], references: [id])
  categories         Category[]
  products           Product[]
  orders             Order[]
  customers          Customer[]
  subscription       Subscription?
  tenantUsers        TenantUser[]
  visitorEvents      VisitorEvent[]
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  @@index([status])
}

model Category {
  id          String    @id @default(cuid())
  tenantId    String
  name        String
  slug        String
  icon        String?
  color       String?
  description String?   @db.Text
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([tenantId, slug])
  @@index([tenantId])
}

model Product {
  id              String        @id @default(cuid())
  tenantId        String
  categoryId      String?
  name            String
  slug            String
  sku             String?
  description     String?       @db.Text
  price           Int
  originalPrice   Int?
  stock           Int           @default(0)
  weight          Int?
  images          Json?
  mainImage       String?
  status          ProductStatus @default(ACTIVE)
  isFeatured      Boolean       @default(false)
  isBest          Boolean       @default(false)
  isNew           Boolean       @default(false)
  rating          Decimal       @default(0) @db.Decimal(2, 1)
  reviewsCount    Int           @default(0)
  soldCount       Int           @default(0)
  viewCount       Int           @default(0)
  metaTitle       String?
  metaDescription String?       @db.Text
  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category        Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orderItems      OrderItem[]
  variants        ProductVariant[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([tenantId, slug])
  @@index([tenantId, status])
}

model Customer {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  email       String?
  phone       String?
  address     String?  @db.Text
  city        String?
  province    String?
  postalCode  String?
  totalOrders Int      @default(0)
  totalSpent  Int      @default(0)
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders      Order[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId])
}

model Order {
  id              String        @id @default(cuid())
  tenantId        String
  customerId      String?
  orderNumber     String        @unique
  subtotal        Int
  shippingCost    Int           @default(0)
  discount        Int           @default(0)
  tax             Int           @default(0)
  total           Int
  status          OrderStatus   @default(PENDING)
  paymentMethod   String?
  paymentStatus   PaymentStatus @default(UNPAID)
  shippingName    String?
  shippingAddress String?       @db.Text
  notes           String?       @db.Text
  paidAt          DateTime?
  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer?     @relation(fields: [customerId], references: [id], onDelete: SetNull)
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([tenantId, status])
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String?
  productName String
  price       Int
  quantity    Int
  subtotal    Int
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([orderId])
}

model AdminNotification {
  id        String   @id @default(cuid())
  title     String
  message   String   @db.Text
  type      String   @default("info")
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── Billing / Langganan (Pakasir) ───────────────────────────────────────────

enum SubscriptionStatus {
  PENDING   // menunggu pembayaran pertama
  ACTIVE    // langganan berjalan
  PAST_DUE  // lewat jatuh tempo, dalam grace period
  EXPIRED   // kedaluwarsa / disuspend
  CANCELLED // dibatalkan
}

enum PaymentStatusBilling {
  PENDING   // invoice dibuat, belum dibayar
  COMPLETED // lunas (dikonfirmasi via API Pakasir)
  FAILED    // gagal / kedaluwarsa
  CANCELLED // dibatalkan
}

model Subscription {
  id         String             @id @default(cuid())
  tenantId   String             @unique
  planId     String
  status     SubscriptionStatus @default(PENDING)
  startedAt  DateTime?
  currentEnd DateTime?          // tanggal langganan berakhir (periode berjalan)
  graceUntil DateTime?          // batas grace period sebelum suspend
  autoRenew  Boolean            @default(true)
  tenant     Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  plan       Plan               @relation(fields: [planId], references: [id])
  payments   Payment[]
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt

  @@index([status, currentEnd])
}

model Payment {
  id              String               @id @default(cuid())
  subscriptionId  String
  orderId         String               @unique // dikirim ke Pakasir (order_id)
  amount          Int
  status          PaymentStatusBilling @default(PENDING)
  paymentMethod   String?              // qris, va, dll (dari Pakasir)
  paymentNumber   String?              @db.Text // payload QR / nomor VA
  periodStart     DateTime             // periode langganan yang dibayar
  periodEnd       DateTime
  expiredAt       DateTime?            // kedaluwarsa pembayaran (dari Pakasir)
  paidAt          DateTime?
  rawWebhook      Json?                // simpan payload webhook mentah (audit)
  subscription    Subscription         @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@index([subscriptionId, status])
}

// ─── Multi-User per Toko (§7.4) ──────────────────────────────────────────────

enum TenantRole {
  OWNER
  STAFF
}

model TenantUser {
  id        String     @id @default(cuid())
  tenantId  String
  userId    String
  role      TenantRole @default(STAFF)
  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@unique([tenantId, userId])
  @@index([userId])
}

// ─── Varian Produk (§7.5) ────────────────────────────────────────────────────

model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  name      String   // "Merah / XL"
  sku       String?
  price     Int
  stock     Int      @default(0)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
}

// ─── Kupon Langganan (§7.9) ──────────────────────────────────────────────────

enum CouponType {
  PERCENT
  FIXED
}

model Coupon {
  id             String     @id @default(cuid())
  code           String     @unique
  type           CouponType
  value          Int
  maxRedemptions Int?
  redeemedCount  Int        @default(0)
  expiresAt      DateTime?
  isActive       Boolean    @default(true)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}

// ─── Audit Log (§7.10) ───────────────────────────────────────────────────────

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  tenantId  String?
  action    String   // "tenant.suspend", "auth.impersonate", dll
  metadata  Json?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([action, createdAt])
  @@index([tenantId])
}

// ─── Analytics Pengunjung (§7.8) ─────────────────────────────────────────────

model VisitorEvent {
  id        String   @id @default(cuid())
  tenantId  String
  path      String
  visitorId String   // hash anonim
  referrer  String?
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([tenantId, createdAt])
}
```

---

## 4. Prisma Client + Tenant Isolation (`server/db.ts`)

> Pengganti middleware `TenantScope` Laravel. Filter `tenantId` otomatis di service layer.

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Helper: Prisma client yang otomatis scope ke 1 tenant.
 * Mencegah kebocoran data antar tenant (pengganti Global Scope Laravel).
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

function scopeTenant(tenantId: string) {
  return ({ args, query }: any) => {
    if (args.where) args.where = { ...args.where, tenantId };
    else args.where = { tenantId };
    return query(args);
  };
}
```

---

## 5. tRPC Setup (`server/trpc.ts`)

> Pengganti Controller + middleware role + Form Request. Type-safe end-to-end.

```ts
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "./auth";
import { prisma } from "./db";

export async function createContext() {
  const session = await auth(); // ambil sesi dari Auth.js
  return { session, prisma };
}

const t = initTRPC.context<typeof createContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Wajib login
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

// Guard role MERCHANT (pengganti role:merchant)
const isMerchant = isAuthed.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== "MERCHANT" || !ctx.user.tenantId)
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, tenantId: ctx.user.tenantId } });
});

// Guard role SUPERADMIN (pengganti role:superadmin)
const isSuperAdmin = isAuthed.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== "SUPERADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const merchantProcedure = t.procedure.use(isMerchant);
export const superAdminProcedure = t.procedure.use(isSuperAdmin);
```

---

## 6. Validasi dengan Zod (`lib/validations/product.schema.ts`)

> Pengganti Form Request Laravel.

```ts
import { z } from "zod";

export const storeProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  categoryId: z.string().cuid().nullable().optional(),
  sku: z.string().max(100).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  originalPrice: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().int().min(0).nullable().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  isBest: z.boolean().default(false),
  isNew: z.boolean().default(false),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
});

export type StoreProductInput = z.infer<typeof storeProductSchema>;
```

---

## 7. Helper Reusable (`lib/helpers/`)

> Prinsip DRY: fungsi yang dipakai berulang dipisah ke file sendiri, di-import di mana saja.

### `lib/helpers/slug.ts`
```ts
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

/** Ubah teks jadi slug: "Kue Nastar" → "kue-nastar". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate slug unik per tenant untuk model APA PUN (product, category, dll).
 * Reusable — tinggal pass nama model Prisma.
 */
export async function generateUniqueSlug(
  model: "product" | "category",
  tenantId: string,
  name: string,
  exceptId?: string
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  // @ts-expect-error akses dinamis ke delegate Prisma
  const delegate = prisma[model];

  while (
    await delegate.findFirst({
      where: { tenantId, slug, ...(exceptId && { id: { not: exceptId } }) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
```

### `lib/helpers/paginate.ts`
```ts
import { PER_PAGE } from "@/lib/constants/config";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

/**
 * Paginasi generik — pakai untuk SEMUA model (product, order, customer, tenant).
 * Pass delegate Prisma + where + opsi. Hapus duplikasi findMany+count di tiap service.
 */
export async function paginate<T>(
  delegate: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  options: {
    where?: any;
    include?: any;
    orderBy?: any;
    page?: number;
    perPage?: number;
  }
): Promise<Paginated<T>> {
  const { where, include, orderBy = { createdAt: "desc" }, page = 1, perPage = PER_PAGE } = options;

  const [data, total] = await Promise.all([
    delegate.findMany({ where, include, orderBy, skip: (page - 1) * perPage, take: perPage }),
    delegate.count({ where }),
  ]);

  return { data, total, page, perPage, lastPage: Math.ceil(total / perPage) };
}
```

### `lib/helpers/ownership.ts`
```ts
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";

/**
 * Pastikan sebuah record milik tenant tertentu (guard keamanan multi-tenant).
 * Reusable untuk update/delete di semua modul. Lempar error kalau bukan miliknya.
 */
export async function assertTenantOwns(
  model: "product" | "category" | "order" | "customer",
  id: string,
  tenantId: string
) {
  // @ts-expect-error akses dinamis ke delegate Prisma
  const record = await prisma[model].findFirst({ where: { id, tenantId } });
  if (!record) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Data tidak ditemukan atau bukan milik Anda." });
  }
  return record;
}
```

### `lib/helpers/format.ts`
```ts
/** Format angka jadi Rupiah: 65000 → "Rp 65.000". */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/** Format tanggal: → "26 Jun 2026". */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Normalisasi nomor HP Indonesia: "08123" → "628123". */
export function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  return p;
}
```

### `lib/helpers/whatsapp.ts`
```ts
import { formatPhone } from "./format";

/** Bangun link wa.me dengan pesan pre-filled — dipakai di card produk & detail. */
export function buildWaLink(phone: string, message: string): string {
  return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;
}
```

### `lib/helpers/upload.ts`
```ts
import { MAX_UPLOAD_MB, ALLOWED_IMAGE_TYPES } from "@/lib/constants/config";

/** Validasi gambar sebelum upload (tipe + ukuran). Reusable di semua form upload. */
export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Format harus JPG, PNG, atau WebP." };
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return { ok: false, error: `Ukuran maksimal ${MAX_UPLOAD_MB}MB.` };
  }
  return { ok: true };
}
```

### `lib/constants/config.ts`
```ts
export const PER_PAGE = 20;
export const MAX_UPLOAD_MB = 2;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LOGIN_RATE_LIMIT = { attempts: 5, window: "1 m" } as const;
```

### `lib/constants/status.ts`
```ts
/**
 * Label & warna status. Pakai SEMANTIC class (bukan bg-green-100 hardcode),
 * supaya warna konsisten & bisa diubah dari satu tempat (design token di app.css).
 */
export const ORDER_STATUS = {
  PENDING:    { label: "Menunggu",  className: "badge-warning" },
  PROCESSING: { label: "Diproses",  className: "badge-info" },
  SHIPPED:    { label: "Dikirim",   className: "badge-accent" },
  COMPLETED:  { label: "Selesai",   className: "badge-success" },
  CANCELLED:  { label: "Dibatalkan",className: "badge-danger" },
} as const;

export const PRODUCT_STATUS = {
  ACTIVE:       { label: "Aktif",    className: "badge-success" },
  INACTIVE:     { label: "Nonaktif", className: "badge-muted" },
  OUT_OF_STOCK: { label: "Habis",    className: "badge-danger" },
} as const;
```

---

## 8. Base Service Reusable (`server/services/shared/base.service.ts`)

> CRUD generik tenant-scoped. Service spesifik tinggal extend, tidak menulis ulang logika dasar.

```ts
import { prisma } from "@/server/db";
import { paginate } from "@/lib/helpers/paginate";
import { assertTenantOwns } from "@/lib/helpers/ownership";

type ModelName = "product" | "category" | "order" | "customer";

/**
 * Factory base service: bekalkan operasi umum (list, findOne, delete) untuk model
 * tenant-scoped apa pun. Service spesifik fokus ke logika uniknya saja.
 */
export function createBaseService(model: ModelName) {
  // @ts-expect-error akses dinamis ke delegate Prisma
  const delegate = prisma[model];

  return {
    list: (tenantId: string, opts: { where?: any; include?: any; page?: number } = {}) =>
      paginate(delegate, { ...opts, where: { ...opts.where, tenantId } }),

    findOne: (tenantId: string, id: string) =>
      assertTenantOwns(model, id, tenantId),

    async delete(tenantId: string, id: string) {
      await assertTenantOwns(model, id, tenantId);
      return delegate.delete({ where: { id } });
    },
  };
}
```

---

## 9. Service Layer (`server/services/tenant/product.service.ts`)

> Sekarang ramping — pakai helper & base service. Tidak ada lagi duplikasi paginate/slug/ownership.

```ts
import { prisma } from "@/server/db";
import { createBaseService } from "@/server/services/shared/base.service";
import { generateUniqueSlug } from "@/lib/helpers/slug";
import { assertTenantOwns } from "@/lib/helpers/ownership";
import type { StoreProductInput } from "@/lib/validations/product.schema";
import type { Prisma } from "@prisma/client";

const base = createBaseService("product");

export const productService = {
  /** List produk ter-paginasi + filter (reuse base.list + paginate helper). */
  getPaginated(
    tenantId: string,
    filters: { search?: string; category?: string; status?: string; page?: number }
  ) {
    const where: Prisma.ProductWhereInput = {
      ...(filters.search && {
        OR: [{ name: { contains: filters.search } }, { sku: { contains: filters.search } }],
      }),
      ...(filters.category && { categoryId: filters.category }),
      ...(filters.status && { status: filters.status as any }),
    };
    return base.list(tenantId, { where, include: { category: true }, page: filters.page });
  },

  /** Buat produk — slug via helper reusable. */
  async store(tenantId: string, data: StoreProductInput) {
    const slug = await generateUniqueSlug("product", tenantId, data.name);
    return prisma.product.create({ data: { ...data, tenantId, slug } });
  },

  /** Update produk — ownership via helper, slug via helper. */
  async update(tenantId: string, id: string, data: Partial<StoreProductInput>) {
    const existing = await assertTenantOwns("product", id, tenantId);
    const patch: Prisma.ProductUpdateInput = { ...data };
    if (data.name && data.name !== (existing as any).name) {
      patch.slug = await generateUniqueSlug("product", tenantId, data.name, id);
    }
    return prisma.product.update({ where: { id }, data: patch });
  },

  /** Hapus — reuse base.delete (sudah cek ownership). */
  destroy: (tenantId: string, id: string) => base.delete(tenantId, id),
};
```

### DashboardService (SuperAdmin) — `server/services/superadmin/dashboard.service.ts`

```ts
import { prisma } from "@/server/db";

export const superAdminDashboardService = {
  async getStats() {
    const [tenants, totalProducts] = await Promise.all([
      prisma.tenant.findMany({ include: { plan: true } }),
      prisma.product.count(),
    ]);

    const mrr = tenants.reduce((sum, t) => sum + (t.plan?.price ?? 0), 0);

    const planStats = tenants.reduce<Record<string, number>>((acc, t) => {
      const key = t.plan?.name ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t) => t.status === "ACTIVE").length,
      trialTenants: tenants.filter((t) => t.status === "TRIAL").length,
      suspendedTenants: tenants.filter((t) => t.status === "SUSPENDED").length,
      totalProducts,
      mrr,
      planStats,
    };
  },

  async getGrowthData(months = 6) {
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.tenant.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      result.push({
        month: date.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        tenants: count,
      });
    }
    return result;
  },

  async getExpiringSoon(days = 7) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + days);

    return prisma.tenant.findMany({
      where: { subscriptionEnd: { gte: now, lte: limit } },
      include: { user: true },
    });
  },
};
```

---

## 10. Komponen Frontend Reusable (`components/shared/`)

> Tampilan yang dipakai berulang dipisah jadi komponen sendiri. Dipakai di semua halaman.

### `components/shared/status-badge.tsx`
```tsx
import { ORDER_STATUS, PRODUCT_STATUS } from "@/lib/constants/status";
import { cn } from "@/lib/utils";

type Variant = "order" | "product";

/** Badge status reusable — warna & label diambil dari constants (satu sumber). */
export function StatusBadge({ status, variant }: { status: string; variant: Variant }) {
  const map = variant === "order" ? ORDER_STATUS : PRODUCT_STATUS;
  const item = (map as any)[status] ?? { label: status, className: "badge-muted" };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", item.className)}>
      {item.label}
    </span>
  );
}
```

### `components/shared/page-header.tsx`
```tsx
/** Header halaman reusable: judul + deskripsi + slot aksi (tombol). */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
```

### `components/shared/stat-card.tsx`
```tsx
import { formatRupiah } from "@/lib/helpers/format";

/** KPI card reusable untuk dashboard (merchant & super admin). */
export function StatCard({
  label,
  value,
  isCurrency = false,
  icon,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold">
        {isCurrency ? formatRupiah(value) : value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
```

### `components/shared/confirm-dialog.tsx`
```tsx
"use client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Dialog konfirmasi reusable — dipakai untuk semua aksi hapus. */
export function ConfirmDialog({
  open, onOpenChange, onConfirm,
  title = "Yakin hapus?",
  description = "Tindakan ini tidak bisa dibatalkan.",
  loading = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### `components/shared/form-field.tsx`
```tsx
/** Wrapper field reusable: label + input + pesan error konsisten di semua form. */
export function FormField({
  label, error, required, children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

### Komponen shared lain (pola sama)
| Komponen | Fungsi | Dipakai di |
|---|---|---|
| `data-table.tsx` | Tabel + search + filter + paginasi (generik via `columns` props) | Produk, pesanan, pelanggan, tenant |
| `empty-state.tsx` | Tampilan saat data kosong | Semua list/tabel |
| `image-upload.tsx` | Upload + preview, pakai `validateImage()` helper | Produk, store-builder |
| `product-card.tsx` | Kartu produk (pakai `buildWaLink`, `formatRupiah`) | Website publik (beranda & list) |

---

## 11. Design Tokens & Theming (Warna)

> Prinsip: **jangan hardcode warna Tailwind** (`bg-green-100`, `text-yellow-800`) tersebar di komponen.
> Definisikan token semantik di satu tempat (`app.css`), pakai via custom class. Untuk warna
> per-tenant yang dinamis (`primaryColor`), pakai CSS variable yang di-inject runtime.

### 11.1 Definisi Token (`resources/css/app.css` / `src/app/globals.css`)

Tailwind v4 pakai `@theme` untuk mendaftarkan token jadi utility class.

```css
@import "tailwindcss";

@theme {
  /* Warna brand platform (statis) */
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;

  /* Warna semantik status (satu sumber kebenaran) */
  --color-success: #15803d;
  --color-success-soft: #dcfce7;
  --color-warning: #a16207;
  --color-warning-soft: #fef9c3;
  --color-danger: #b91c1c;
  --color-danger-soft: #fee2e2;
  --color-info: #1d4ed8;
  --color-info-soft: #dbeafe;
  --color-accent: #7e22ce;
  --color-accent-soft: #f3e8ff;
  --color-muted: #4b5563;
  --color-muted-soft: #f3f4f6;
}

/* Custom class badge — dipakai StatusBadge & di mana saja */
@layer components {
  .badge-success { background: var(--color-success-soft); color: var(--color-success); }
  .badge-warning { background: var(--color-warning-soft); color: var(--color-warning); }
  .badge-danger  { background: var(--color-danger-soft);  color: var(--color-danger); }
  .badge-info    { background: var(--color-info-soft);    color: var(--color-info); }
  .badge-accent  { background: var(--color-accent-soft);  color: var(--color-accent); }
  .badge-muted   { background: var(--color-muted-soft);   color: var(--color-muted); }
}
```

Hasilnya bisa dipakai sebagai utility: `bg-primary`, `text-primary`, `text-success`, dll — **tanpa** menyebut angka warna mentah. Kalau mau ganti palet, cukup ubah di `@theme`, semua ikut berubah.

### 11.2 Warna Dinamis per Tenant (`primaryColor`)

Tiap tenant punya `primaryColor` sendiri (disimpan di DB). Inject sebagai CSS variable di layout publik, lalu komponen tinggal pakai `var(--color-primary)`.

```tsx
// app/(public)/[domain]/layout.tsx
import { getTenantBySlug } from "@/server/services/public/tenant.service";

export default async function PublicLayout({
  params,
  children,
}: {
  params: { domain: string };
  children: React.ReactNode;
}) {
  const tenant = await getTenantBySlug(params.domain);

  return (
    // Inject warna tenant ke scope ini — semua child pakai var(--color-primary)
    <div style={{ "--color-primary": tenant?.primaryColor ?? "#2563eb" } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

Komponen di dalam toko publik:
```tsx
// ✅ BENAR — pakai variable, ikut warna tenant
<button className="bg-primary text-primary-foreground">Pesan via WhatsApp</button>

// ❌ SALAH — hardcode, warna tenant diabaikan
<button className="bg-blue-600 text-white">Pesan via WhatsApp</button>
```

> Catatan: untuk nilai yang benar-benar dinamis (warna dari DB), inject via `style` CSS variable
> seperti di atas. Hindari `style={{ background: tenant.primaryColor }}` langsung di tiap elemen —
> cukup set variable sekali di layout, elemen pakai `bg-primary`.

### 11.3 Aturan Warna (ringkas)

| Konteks | Cara |
|---|---|
| Warna status (order/produk) | Custom class `badge-*` dari `app.css` |
| Warna brand platform | Utility `bg-primary` / `text-primary` |
| Warna dinamis per tenant | CSS variable `--color-primary` di-inject di layout publik |
| Warna sekali pakai | Tetap boleh utility Tailwind biasa (mis. `text-gray-500` untuk teks sekunder) |
| **Dilarang** | Hardcode warna status berulang (`bg-green-100`) di banyak komponen |

---

## 12. tRPC Router (`server/routers/tenant/product.ts`)

> Pengganti Controller. Tipis — hanya validasi input + panggil service.

```ts
import { z } from "zod";
import { router, merchantProcedure } from "@/server/trpc";
import { productService } from "@/server/services/tenant/product.service";
import { storeProductSchema } from "@/lib/validations/product.schema";

export const productRouter = router({
  list: merchantProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
      })
    )
    .query(({ ctx, input }) =>
      productService.getPaginated(ctx.tenantId, input)
    ),

  create: merchantProcedure
    .input(storeProductSchema)
    .mutation(({ ctx, input }) => productService.store(ctx.tenantId, input)),

  update: merchantProcedure
    .input(z.object({ id: z.string().cuid(), data: storeProductSchema.partial() }))
    .mutation(({ ctx, input }) =>
      productService.update(ctx.tenantId, input.id, input.data)
    ),

  delete: merchantProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      productService.destroy(ctx.tenantId, input.id)
    ),
});
```

### Root Router (`server/routers/_app.ts`)

```ts
import { router } from "@/server/trpc";
import { productRouter } from "./tenant/product";
import { categoryRouter } from "./tenant/category";
import { orderRouter } from "./tenant/order";
import { tenantAdminRouter } from "./superadmin/tenant";
import { superDashboardRouter } from "./superadmin/dashboard";

export const appRouter = router({
  product: productRouter,
  category: categoryRouter,
  order: orderRouter,
  superadmin: router({
    tenant: tenantAdminRouter,
    dashboard: superDashboardRouter,
  }),
});

export type AppRouter = typeof appRouter;
```

---

## 13. Middleware Subdomain + Role Guard (`src/middleware.ts`)

> Pengganti `Route::domain()` + `CheckRole` + `TenantScope` Laravel.

```ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN!; // tokopintar.id

export default async function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl;

  // 1. Deteksi subdomain tenant → rewrite ke route publik
  const subdomain = host.replace(`.${ROOT_DOMAIN}`, "");
  const isTenantSite =
    host.endsWith(`.${ROOT_DOMAIN}`) &&
    !["www", "app", "admin"].includes(subdomain);

  if (isTenantSite) {
    return NextResponse.rewrite(
      new URL(`/_sites/${subdomain}${url.pathname}`, req.url)
    );
  }

  // 2. Guard area login (role-based)
  const session = await auth();
  const path = url.pathname;

  if (path.startsWith("/super-admin")) {
    if (session?.user?.role !== "SUPERADMIN")
      return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/dashboard")) {
    if (session?.user?.role !== "MERCHANT")
      return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 14. Auth.js (`server/auth.ts`)

> Pengganti Laravel Session/Sanctum. Credentials provider + role di JWT.

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const user = await prisma.user.findUnique({
          where: { email: creds?.email as string },
          include: { tenant: { select: { id: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(creds?.password as string, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenant?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
      }
      return session;
    },
  },
});
```

---

## 15. Memanggil tRPC dari React (Client Component)

> Pengganti `useForm` Inertia. Type-safe, autocompletion penuh.

```tsx
"use client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function ProductList() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.product.list.useQuery({ page: 1 });

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil disimpan");
      utils.product.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    createProduct.mutate({ name: "Kue Nastar", price: 65000, stock: 50 });
  };

  if (isLoading) return <p>Memuat...</p>;
  return (
    <div>
      {data?.data.map((p) => <div key={p.id}>{p.name}</div>)}
      <button onClick={handleSubmit} disabled={createProduct.isPending}>
        Simpan
      </button>
    </div>
  );
}
```

### Memanggil di Server Component (RSC)

```tsx
import { serverTrpc } from "@/lib/trpc/server";

export default async function ProductsPage() {
  const products = await serverTrpc.product.list({ page: 1 });
  return <ProductTable initialData={products} />;
}
```

---

## 16. Seeder (`prisma/seed.ts`)

> Pengganti PlansSeeder + SuperAdminSeeder. Jalankan via `prisma db seed`.

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Plans
  await prisma.plan.upsert({
    where: { slug: "basic" },
    update: {},
    create: {
      name: "Basic",
      slug: "basic",
      price: 100000,
      hasSeo: false,
      hasPos: false,
      hasInvoice: false,
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

  await prisma.plan.upsert({
    where: { slug: "plus" },
    update: {},
    create: {
      name: "Plus",
      slug: "plus",
      price: 150000,
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

  // Super Admin
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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Daftarkan di `package.json`:
```json
{
  "prisma": { "seed": "tsx prisma/seed.ts" }
}
```

---

## 17. Variabel Lingkungan (`.env`)

```env
# Database MySQL
DATABASE_URL="mysql://root:@127.0.0.1:3306/tokopintar"

# Auth.js
AUTH_SECRET="generate-pakai: npx auth secret"
AUTH_URL="http://localhost:3000"

# Domain
NEXT_PUBLIC_ROOT_DOMAIN="tokopintar.id"

# Storage (pilih salah satu)
# UploadThing / S3 / Cloudinary
UPLOADTHING_TOKEN=
# atau S3:
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_BUCKET=

# Email (Resend / SMTP)
RESEND_API_KEY=

# Pembayaran langganan (Pakasir) — RAHASIA, server only
PAKASIR_BASE_URL="https://app.pakasir.com"
PAKASIR_PROJECT="umkm-saas"
PAKASIR_API_KEY="<api-key-dari-dashboard>"

# Cron (auto-suspend langganan)
CRON_SECRET="<random-secret>"
```

---

## 18. Perintah Umum

```bash
# Setup awal
npm install
npx auth secret                 # generate AUTH_SECRET
npx prisma migrate dev          # buat tabel dari schema (mirip migrate Laravel)
npx prisma db seed              # isi data awal (plans + super admin)

# Development
npm run dev                     # Next.js dev server (localhost:3000)

# Database (Prisma — pengganti artisan migrate)
npx prisma migrate dev --name nama_perubahan   # buat + apply migration baru
npx prisma migrate deploy                       # apply migration di production
npx prisma migrate reset                        # reset + seed ulang (mirip migrate:fresh --seed)
npx prisma studio                               # GUI lihat data (mirip tinker)
npx prisma generate                             # regenerate Prisma Client

# Build
npm run build                   # build production + cek TypeScript
npm start                       # jalankan hasil build
```

---

## 19. Tabel Padanan Laravel → Next.js

| Konsep Laravel | Padanan Next.js |
|---|---|
| `php artisan migrate` | `prisma migrate dev` |
| `php artisan migrate:fresh --seed` | `prisma migrate reset` |
| `php artisan db:seed` | `prisma db seed` |
| `php artisan tinker` | `prisma studio` |
| Eloquent Model | Prisma model (`schema.prisma`) |
| Controller | tRPC router (`server/routers/`) |
| `App\Services\` | `server/services/` |
| Form Request | Zod schema (`lib/validations/`) |
| Middleware `CheckRole` | `protectedProcedure` / `middleware.ts` |
| Global Scope `TenantScope` | `tenantDb()` extension / filter `tenantId` |
| `Inertia::render()` | RSC `page.tsx` + tRPC query |
| `useForm` (Inertia) | `trpc.x.useMutation()` |
| `route('tenant.products.index')` | path file App Router |
| Laravel Session/Sanctum | Auth.js (NextAuth v5) |
| `Route::domain('{slug}...')` | `middleware.ts` (rewrite subdomain) |
| Laravel Policy | cek `tenantId` di service / procedure |
| Helper global / Trait | `lib/helpers/*` (slug, paginate, format, dll) |
| Blade component / partial | `components/shared/*` (komponen reusable) |
| `config()` / konstanta | `lib/constants/*` |

---

## 20. Konvensi Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| tRPC router | camelCase + `Router` | `productRouter` |
| Service | camelCase + `Service` (object) | `productService` |
| Prisma model | PascalCase singular | `Product` |
| Zod schema | camelCase + `Schema` | `storeProductSchema` |
| React component | PascalCase | `ProductCard` |
| File page | `page.tsx` di folder kebab | `products/page.tsx` |
| TypeScript type | PascalCase | `Product`, `StoreProductInput` |
| Field DB | camelCase | `tenantId`, `isBest` |
| CSS class | kebab-case + token semantik | `bg-primary`, `badge-success` |

---

## 21. Keamanan

> Requirement keamanan lengkap ada di **PRD §10**. Bagian ini fokus ke implementasi teknisnya.

### CSRF
Auth.js menangani CSRF untuk flow auth. tRPC via HTTP POST + same-origin policy aman by default. Untuk mutasi sensitif, andalkan session cookie `httpOnly` + `sameSite=lax`.

### SQL Injection
Prisma memakai **parameterized query** otomatis. Jangan pakai `$queryRawUnsafe`. Kalau perlu raw query, pakai `prisma.$queryRaw` dengan tagged template (otomatis di-escape).

### Mass Assignment
Selalu validasi input dengan Zod sebelum masuk ke Prisma. Jangan spread `input` mentah tanpa schema. Whitelist field via `.pick()` jika perlu.

### Authorization
Cek kepemilikan resource di service: selalu sertakan `tenantId` di `where` (`findFirstOrThrow({ where: { id, tenantId } })`) supaya tenant tidak bisa akses data tenant lain.

### Rate Limiting
Pakai `@upstash/ratelimit` + Redis pada route login & endpoint tRPC sensitif:
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});
```

---

## 22. Integrasi Pembayaran — Pakasir (Billing Langganan)

> Pakasir = payment gateway lokal (QRIS + Virtual Account). Dipakai untuk menagih langganan
> bulanan tenant. Mode: **API + tampilkan QR code sendiri** di dashboard.
> Dua jalur didukung: **merchant bayar sendiri** & **super admin buat tagihan manual**.

### 21.1 Konsep & Alur

```
Buat invoice (merchant/admin)
  → Service panggil Pakasir API transactioncreate/qris
    → Dapat payment_number (payload QR) + expired_at
      → Tampilkan QR code di dashboard (render dari payment_number)
        → User scan & bayar (QRIS / VA)
          → Pakasir kirim WEBHOOK (status: completed)
            → Handler VERIFIKASI ULANG via API transactiondetail (jangan percaya webhook mentah)
              → Update Payment = COMPLETED + perpanjang Subscription.currentEnd
                → Tenant status = ACTIVE
```

> **Prinsip keamanan:** webhook hanya pemicu. Kebenaran status SELALU dikonfirmasi balik
> ke API Pakasir (`transactiondetail`) + cek `amount` & `order_id` cocok dengan DB.

### 21.2 Konstanta & Env

```env
# .env
PAKASIR_BASE_URL="https://app.pakasir.com"
PAKASIR_PROJECT="umkm-saas"                   # Slug proyek (boleh, bukan rahasia)
PAKASIR_API_KEY="<api-key-dari-dashboard>"    # RAHASIA — server only, jangan di-commit
```

### 21.3 Pakasir Client (`lib/pakasir/client.ts`)

> Wrapper API reusable. Semua endpoint Pakasir lewat sini.

```ts
const BASE = process.env.PAKASIR_BASE_URL!;
const PROJECT = process.env.PAKASIR_PROJECT!;
const API_KEY = process.env.PAKASIR_API_KEY!;

interface CreateResult {
  payment: {
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: string;
    payment_number: string; // payload QR (di-render jadi QR code)
    expired_at: string;
  };
}

interface DetailResult {
  transaction: {
    amount: number;
    order_id: string;
    project: string;
    status: "pending" | "completed" | "cancelled";
    payment_method: string;
    completed_at: string | null;
  };
}

export const pakasir = {
  /** Buat transaksi QRIS — dapat payload QR untuk ditampilkan di app. */
  async createQris(orderId: string, amount: number): Promise<CreateResult> {
    const res = await fetch(`${BASE}/api/transactioncreate/qris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: PROJECT, order_id: orderId, amount, api_key: API_KEY }),
    });
    if (!res.ok) throw new Error("Gagal membuat transaksi Pakasir");
    return res.json();
  },

  /** Cek status transaksi (sumber kebenaran — dipakai untuk verifikasi webhook). */
  async getDetail(orderId: string, amount: number): Promise<DetailResult> {
    const url = new URL(`${BASE}/api/transactiondetail`);
    url.searchParams.set("project", PROJECT);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("order_id", orderId);
    url.searchParams.set("api_key", API_KEY);
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("Gagal cek status Pakasir");
    return res.json();
  },

  /** Batalkan transaksi. */
  async cancel(orderId: string, amount: number) {
    const res = await fetch(`${BASE}/api/transactioncancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: PROJECT, order_id: orderId, amount, api_key: API_KEY }),
    });
    return res.json();
  },

  /** (Sandbox only) Simulasi pembayaran untuk testing webhook. */
  async simulatePayment(orderId: string, amount: number) {
    const res = await fetch(`${BASE}/api/paymentsimulation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: PROJECT, order_id: orderId, amount, api_key: API_KEY }),
    });
    return res.json();
  },
};
```

### 21.4 Billing Service (`server/services/shared/billing.service.ts`)

```ts
import { prisma } from "@/server/db";
import { pakasir } from "@/lib/pakasir/client";

/** Generate order_id unik untuk Pakasir. */
function makeOrderId() {
  return `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const billingService = {
  /**
   * Buat invoice langganan + transaksi QRIS Pakasir.
   * Dipakai baik oleh merchant (self-service) maupun super admin.
   */
  async createInvoice(tenantId: string) {
    const sub = await prisma.subscription.findUniqueOrThrow({
      where: { tenantId },
      include: { plan: true },
    });

    const amount = sub.plan.price;
    const orderId = makeOrderId();

    // Periode langganan yang dibayar (1 bulan ke depan dari currentEnd / sekarang)
    const base = sub.currentEnd && sub.currentEnd > new Date() ? sub.currentEnd : new Date();
    const periodStart = base;
    const periodEnd = new Date(base);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Panggil Pakasir
    const result = await pakasir.createQris(orderId, amount);

    // Simpan invoice
    return prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        orderId,
        amount,
        status: "PENDING",
        paymentNumber: result.payment.payment_number, // payload QR
        periodStart,
        periodEnd,
        expiredAt: new Date(result.payment.expired_at),
      },
    });
  },

  /**
   * Konfirmasi pembayaran — dipanggil dari webhook handler.
   * VERIFIKASI ULANG ke Pakasir sebelum aktivasi (anti-spoof webhook).
   */
  async confirmPayment(orderId: string, webhookPayload: unknown) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { subscription: true },
    });
    if (!payment) throw new Error("Payment tidak ditemukan");
    if (payment.status === "COMPLETED") return payment; // idempotent

    // 1. Verifikasi ke sumber kebenaran (API Pakasir)
    const detail = await pakasir.getDetail(orderId, payment.amount);

    // 2. Cocokkan amount & status
    if (detail.transaction.status !== "completed" || detail.transaction.amount !== payment.amount) {
      throw new Error("Verifikasi pembayaran gagal / tidak cocok");
    }

    // 3. Update payment + perpanjang langganan (transaction)
    return prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paymentMethod: detail.transaction.payment_method,
          paidAt: new Date(detail.transaction.completed_at ?? Date.now()),
          rawWebhook: webhookPayload as any,
        },
      });

      await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          startedAt: payment.subscription.startedAt ?? new Date(),
          currentEnd: payment.periodEnd,
          graceUntil: null,
        },
      });

      // Sinkronkan status tenant
      const sub = await tx.subscription.findUnique({ where: { id: payment.subscriptionId } });
      await tx.tenant.update({
        where: { id: sub!.tenantId },
        data: { status: "ACTIVE", subscriptionEnd: payment.periodEnd },
      });

      return updated;
    });
  },
};
```

### 21.5 Webhook Handler (`app/api/webhooks/pakasir/route.ts`)

> Endpoint publik penerima notifikasi Pakasir. Set URL ini di dashboard Pakasir (Edit Proyek).

```ts
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { billingService } from "@/server/services/shared/billing.service";

const webhookSchema = z.object({
  amount: z.number(),
  order_id: z.string(),
  project: z.string(),
  status: z.string(),
  payment_method: z.string().optional(),
  completed_at: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = webhookSchema.parse(await req.json());

    // Cek project cocok (pertahanan dasar)
    if (body.project !== process.env.PAKASIR_PROJECT) {
      return NextResponse.json({ error: "Invalid project" }, { status: 403 });
    }

    if (body.status === "completed") {
      // confirmPayment akan verifikasi ulang ke API Pakasir (tidak percaya webhook mentah)
      await billingService.confirmPayment(body.order_id, body);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Pakasir webhook error:", err);
    // Balas 200 agar Pakasir tidak retry tanpa henti; error sudah dicatat
    return NextResponse.json({ received: false }, { status: 200 });
  }
}
```

### 21.6 tRPC Router Billing (`server/routers/tenant/billing.ts`)

```ts
import { router, merchantProcedure, superAdminProcedure } from "@/server/trpc";
import { billingService } from "@/server/services/shared/billing.service";
import { z } from "zod";

export const billingRouter = router({
  // Merchant bayar sendiri
  createMyInvoice: merchantProcedure.mutation(({ ctx }) =>
    billingService.createInvoice(ctx.tenantId)
  ),

  // Super admin buat tagihan untuk tenant tertentu
  createInvoiceFor: superAdminProcedure
    .input(z.object({ tenantId: z.string().cuid() }))
    .mutation(({ input }) => billingService.createInvoice(input.tenantId)),
});
```

### 21.7 Render QR Code di Frontend

> `payment_number` dari Pakasir adalah payload QRIS mentah → render jadi QR code.

```tsx
"use client";
import { QRCodeSVG } from "qrcode.react"; // npm i qrcode.react
import { trpc } from "@/lib/trpc/client";

export function PaySubscription() {
  const createInvoice = trpc.billing.createMyInvoice.useMutation();

  return (
    <div className="space-y-4 text-center">
      <button onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending}>
        {createInvoice.isPending ? "Membuat tagihan..." : "Bayar Langganan"}
      </button>

      {createInvoice.data && (
        <div className="rounded-xl border p-6">
          <QRCodeSVG value={createInvoice.data.paymentNumber!} size={240} />
          <p className="mt-3 text-sm text-muted-foreground">
            Scan dengan aplikasi e-wallet / m-banking (QRIS)
          </p>
        </div>
      )}
    </div>
  );
}
```

### 21.8 Cron Auto-Suspend (`app/api/cron/check-subscriptions/route.ts`)

> Jalankan harian (Vercel Cron / cron eksternal). Tangani lifecycle langganan otomatis.

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

const GRACE_DAYS = 3; // grace period setelah jatuh tempo

export async function GET(req: Request) {
  // Proteksi: hanya cron resmi (header secret)
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Langganan lewat jatuh tempo → PAST_DUE + set grace
  const expiring = await prisma.subscription.findMany({
    where: { status: "ACTIVE", currentEnd: { lt: now } },
  });
  for (const sub of expiring) {
    const graceUntil = new Date(now);
    graceUntil.setDate(graceUntil.getDate() + GRACE_DAYS);
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAST_DUE", graceUntil },
    });
    // TODO: kirim email reminder bayar
  }

  // 2. Lewat grace period → suspend tenant
  const toSuspend = await prisma.subscription.findMany({
    where: { status: "PAST_DUE", graceUntil: { lt: now } },
  });
  for (const sub of toSuspend) {
    await prisma.$transaction([
      prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } }),
      prisma.tenant.update({ where: { id: sub.tenantId }, data: { status: "SUSPENDED" } }),
    ]);
    // TODO: kirim email "toko dinonaktifkan"
  }

  return NextResponse.json({ pastDue: expiring.length, suspended: toSuspend.length });
}
```

### 21.9 Catatan Keamanan Billing

| Risiko | Mitigasi |
|---|---|
| Webhook dipalsukan | Verifikasi ulang via `transactiondetail` + cek `amount`/`order_id` cocok DB |
| Webhook diproses 2x | `confirmPayment` idempotent (skip jika sudah `COMPLETED`) |
| API key bocor | Hanya di server (`.env`), tidak pernah ke klien |
| Cron di-trigger orang | Header `Bearer CRON_SECRET` |
| Race condition perpanjangan | Pakai `prisma.$transaction` saat update payment + subscription |
| Pencairan dana | Dana Pakasir cair H+1 setelah 12.00 WIB — bukan real-time, atur ekspektasi cashflow |

---

## 23. Testing

### Unit Test Service (Vitest)
```ts
import { describe, it, expect } from "vitest";
import { productService } from "@/server/services/tenant/product.service";

describe("productService", () => {
  it("membuat produk dengan slug unik", async () => {
    const product = await productService.store("tenant_123", {
      name: "Kue Nastar",
      price: 65000,
      stock: 50,
    } as any);

    expect(product.slug).toBe("kue-nastar");
  });
});
```

### Integration Test tRPC
```ts
import { describe, it, expect } from "vitest";
import { appRouter } from "@/server/routers/_app";

describe("product router", () => {
  it("merchant bisa lihat produknya", async () => {
    const caller = appRouter.createCaller({
      session: { user: { id: "u1", role: "MERCHANT", tenantId: "t1" } },
      prisma,
    } as any);

    const result = await caller.product.list({ page: 1 });
    expect(result).toHaveProperty("data");
  });
});
```

### Jalankan Tests
```bash
npm run test                 # vitest
npm run test -- product      # filter
npm run test -- --coverage
```

---

## 24. Implementasi Fitur Lanjutan

Panduan teknis untuk fitur di PRD §7. Tiap sub-bagian fokus ke pola implementasinya.

### 23.1 SEO Server-Side (Halaman Publik Tenant)

> Implementasi requirement PRD §7.1. Prinsip: helper SEO **reusable** (jangan tulis metadata
> berulang di tiap halaman) + JSON-LD **aman dari XSS** (data tenant tidak boleh bocor jadi script).

#### Helper SEO Reusable (`lib/seo/metadata.ts`)

```ts
import type { Metadata } from "next";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
const IS_PROD = process.env.NODE_ENV === "production";

interface TenantSeoInput {
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  logo?: string | null;
  customDomain?: string | null;
  seoSettings?: { metaTitle?: string; metaDescription?: string } | null;
}

/** Base URL kanonik tenant (custom domain > subdomain). */
export function tenantBaseUrl(t: Pick<TenantSeoInput, "slug" | "customDomain">) {
  return t.customDomain ? `https://${t.customDomain}` : `https://${t.slug}.${ROOT}`;
}

/**
 * Builder metadata reusable untuk SEMUA halaman publik tenant.
 * Dipakai di beranda, daftar produk, detail produk, about, kontak.
 */
export function buildTenantMetadata(
  tenant: TenantSeoInput,
  page?: {
    title?: string;
    description?: string;
    path?: string;        // mis. "/products/kue-nastar"
    image?: string | null;
    type?: "website" | "article";
  }
): Metadata {
  const seo = tenant.seoSettings ?? {};
  const base = tenantBaseUrl(tenant);
  const url = `${base}${page?.path ?? ""}`;

  const title = page?.title ?? seo.metaTitle ?? `${tenant.name}${tenant.tagline ? ` — ${tenant.tagline}` : ""}`;
  const description = page?.description ?? seo.metaDescription ?? tenant.description ?? undefined;
  const image = page?.image ?? tenant.logo ?? undefined;

  return {
    title,
    description,
    // Production wajib index; staging otomatis noindex
    robots: IS_PROD ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: page?.type ?? "website",
      siteName: tenant.name,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
```

Pemakaian di halaman (ramping, tidak ada duplikasi):
```tsx
// app/(public)/[domain]/page.tsx
import { buildTenantMetadata } from "@/lib/seo/metadata";
import { getTenantBySlug } from "@/server/services/public/tenant.service";

export async function generateMetadata({ params }: { params: { domain: string } }) {
  const tenant = await getTenantBySlug(params.domain);
  if (!tenant) return {};
  return buildTenantMetadata(tenant); // beranda
}

// detail produk:
// return buildTenantMetadata(tenant, {
//   title: `${product.name} — ${tenant.name}`,
//   description: product.metaDescription ?? product.description,
//   path: `/products/${product.slug}`,
//   image: product.mainImage,
//   type: "article",
// });

export const revalidate = 3600; // ISR
```

#### JSON-LD Reusable + Aman dari XSS (`lib/seo/json-ld.tsx`)

> ⚠️ **Celah keamanan utama SEO:** JSON-LD di-render via `dangerouslySetInnerHTML`. Kalau data
> tenant (nama, deskripsi) mengandung `</script>` atau karakter berbahaya, bisa jadi **XSS**.
> Helper ini meng-escape karakter berbahaya sebelum render.

```tsx
/** Escape karakter yang bisa memecah konteks <script>. Cegah XSS via JSON-LD. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Komponen JSON-LD reusable — pakai di halaman manapun. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // aman: sudah di-escape, bukan raw string
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

/** Schema builder reusable. */
export function productSchema(product: any, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.mainImage ? [product.mainImage] : [],
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IDR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${base}/products/${product.slug}`,
    },
  };
}

export function localBusinessSchema(tenant: any, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: tenant.name,
    description: tenant.description ?? undefined,
    image: tenant.logo ?? undefined,
    url: base,
    telephone: tenant.whatsapp ?? tenant.phone ?? undefined,
    address: tenant.address
      ? { "@type": "PostalAddress", streetAddress: tenant.address, addressLocality: tenant.city, addressRegion: tenant.province }
      : undefined,
  };
}
```

Pemakaian:
```tsx
import { JsonLd, productSchema } from "@/lib/seo/json-ld";
import { tenantBaseUrl } from "@/lib/seo/metadata";

<JsonLd data={productSchema(product, tenantBaseUrl(tenant))} />
```

#### Sitemap & Robots per Toko (`app/(public)/[domain]/sitemap.ts` & `robots.ts`)

```ts
// sitemap.ts — generate dari produk tenant
import type { MetadataRoute } from "next";
import { getTenantBySlug } from "@/server/services/public/tenant.service";
import { getPublicProducts } from "@/server/services/public/product.service";
import { tenantBaseUrl } from "@/lib/seo/metadata";

export default async function sitemap({ params }: { params: { domain: string } }): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantBySlug(params.domain);
  if (!tenant) return [];
  const base = tenantBaseUrl(tenant);
  const products = await getPublicProducts(tenant.id);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, priority: 0.5 },
    { url: `${base}/contact`, priority: 0.5 },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
```

```ts
// robots.ts — production index, staging tidak
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === "production";
  return {
    rules: isProd
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" }, // staging: blokir semua
  };
}
```

#### Catatan Keamanan SEO

| Celah | Mitigasi |
|---|---|
| **XSS via JSON-LD** | `safeJsonLd()` escape `<`, `>`, `&` sebelum render (di atas) |
| **XSS via meta tag** | Next.js `Metadata` API auto-escape — JANGAN render meta manual via `dangerouslySetInnerHTML` |
| **Konten user di OG image** | Validasi URL gambar (harus dari domain storage sendiri), jangan terima URL arbitrer |
| **SSRF via custom domain** | Saat verifikasi custom domain, validasi domain (bukan IP internal/localhost) |
| **Data tenant lain bocor** | Service publik tetap filter `tenantId` + hanya field publik (jangan expose email/billing) |
| **Index halaman privat** | `robots` block dashboard & API; hanya halaman publik tenant yang index |



### 23.2 Email Transaksional (`lib/email/`)

> Pakai Resend (atau SMTP via Nodemailer). Template dipisah biar reusable.

```ts
// lib/email/client.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  return resend.emails.send({ from: "TokoPintar <noreply@tokopintar.id>", to, subject, html });
}
```

```ts
// lib/email/templates.ts — kumpulan template (reusable)
import { formatRupiah, formatDate } from "@/lib/helpers/format";

export const emailTemplates = {
  welcome: (name: string, loginUrl: string) => ({
    subject: "Selamat datang di TokoPintar!",
    html: `<h2>Halo ${name}!</h2><p>Toko Anda sudah aktif. <a href="${loginUrl}">Login di sini</a>.</p>`,
  }),

  paymentReminder: (name: string, amount: number, dueDate: Date) => ({
    subject: "Pengingat: Langganan akan jatuh tempo",
    html: `<p>Halo ${name}, tagihan ${formatRupiah(amount)} jatuh tempo ${formatDate(dueDate)}.</p>`,
  }),

  paymentSuccess: (name: string, amount: number, until: Date) => ({
    subject: "Pembayaran berhasil",
    html: `<p>Terima kasih ${name}! Langganan aktif sampai ${formatDate(until)} (${formatRupiah(amount)}).</p>`,
  }),

  suspended: (name: string) => ({
    subject: "Toko Anda dinonaktifkan",
    html: `<p>Halo ${name}, toko dinonaktifkan karena langganan berakhir. Bayar untuk mengaktifkan kembali.</p>`,
  }),
};
```

Integrasi ke billing/cron: panggil `sendEmail()` di titik `TODO` pada cron auto-suspend (§22.8) dan di `confirmPayment` (§22.4).

### 23.3 Plan Enforcement (`lib/helpers/plan-guard.ts`)

> Pastikan batas paket dipaksakan di server. Reusable di procedure manapun.

```ts
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";

/** Cek apakah tenant boleh pakai fitur tertentu (berdasarkan plan). */
export async function assertPlanFeature(
  tenantId: string,
  feature: "hasSeo" | "hasPos" | "hasInvoice" | "hasCustomerDb"
) {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (!tenant.plan[feature]) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Fitur ini hanya untuk paket Plus. Silakan upgrade." });
  }
}

/** Cek batas jumlah produk sebelum create. */
export async function assertProductQuota(tenantId: string) {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (tenant.plan.maxProducts === null) return; // unlimited
  const count = await prisma.product.count({ where: { tenantId } });
  if (count >= tenant.plan.maxProducts) {
    throw new TRPCError({ code: "FORBIDDEN", message: `Batas ${tenant.plan.maxProducts} produk tercapai. Upgrade ke Plus.` });
  }
}
```

Pemakaian di procedure:
```ts
create: merchantProcedure.input(storeProductSchema).mutation(async ({ ctx, input }) => {
  await assertProductQuota(ctx.tenantId);       // enforce batas paket
  return productService.store(ctx.tenantId, input);
}),
```

### 23.4 Multi-User per Toko

Guard `merchantProcedure` di-extend untuk cek role di dalam tenant. Aksi sensitif (billing, hapus toko, kelola user) hanya untuk `OWNER`:

```ts
// di server/trpc.ts — tambahan procedure
const isTenantOwner = isMerchant.unstable_pipe(async ({ ctx, next }) => {
  const membership = await ctx.prisma.tenantUser.findFirst({
    where: { tenantId: ctx.tenantId, userId: ctx.user.id, role: "OWNER" },
  });
  if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Hanya pemilik toko." });
  return next({ ctx });
});

export const ownerProcedure = t.procedure.use(isTenantOwner);
```

### 23.5 Audit Log (`lib/helpers/audit.ts`)

```ts
import { prisma } from "@/server/db";

/** Catat aksi sensitif. Panggil di titik penting (suspend, impersonate, hapus). */
export async function logAudit(params: {
  userId?: string;
  tenantId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({ data: { ...params, metadata: params.metadata as any } });
}
```

Pemakaian: `await logAudit({ userId, action: "tenant.suspend", tenantId, metadata: { reason } });`

### 23.6 Analytics Pengunjung

Endpoint ringan untuk catat pageview dari halaman publik (fire-and-forget):

```ts
// app/api/track/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { tenantId, path, referrer } = await req.json();
  // visitorId anonim: hash IP+UA (tidak simpan data pribadi)
  const ip = req.headers.get("x-forwarded-for") ?? "";
  const ua = req.headers.get("user-agent") ?? "";
  const visitorId = crypto.createHash("sha256").update(ip + ua).digest("hex").slice(0, 16);

  await prisma.visitorEvent.create({ data: { tenantId, path, referrer, visitorId } });
  return NextResponse.json({ ok: true });
}
```

Agregasi untuk dashboard dilakukan di service (group by `path`, count distinct `visitorId`).

### 23.7 Import/Export Produk CSV

```ts
// Import: parse CSV → validasi Zod per baris → bulk create
import Papa from "papaparse";
// Export: ambil produk tenant → format CSV → return sebagai file download
```
Gunakan `papaparse` (parsing) + Zod (validasi tiap baris). Proses besar (>1000 baris) sebaiknya via background job, bukan request langsung.

### 23.8 Custom Domain (Verifikasi DNS)

Alur: simpan `customDomain` status `pending` → tampilkan target CNAME → cek berkala via DNS lookup → jika cocok set `active` + provisioning SSL (via platform hosting, mis. Vercel Domains API).

---

## 25. Referensi Dokumentasi

- [Next.js 15 Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js (NextAuth v5)](https://authjs.dev)
- [Zod](https://zod.dev)
- [React 18 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
