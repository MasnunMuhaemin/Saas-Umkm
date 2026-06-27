# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Panduan konteks AI untuk **TokoPintar** (nama codebase). **Brand publik = "MayWeb"** (bukan TokoPintar). Baca file ini sebelum mengerjakan task. Konvensi lengkap ada di bawah; bagian berikut adalah **realita as-built** yang sering menjebak.

---

## ⚡ Perintah & Realita Implementasi (As-Built — baca dulu)

### Perintah
```bash
npm run dev                  # Next dev (localhost:3000)
npm run build                # build + TypeScript check (gate utama; jalankan setiap selesai edit)
npm run lint                 # eslint
npm run db:seed              # seed via tsx (plans, super admin, merchant demo "Toko Demo")
npx prisma migrate dev --name x   # buat+apply migration
npx prisma generate          # WAJIB setelah migrate (Prisma 7 tidak auto-generate)
```
**Belum ada test runner** (Vitest belum dipasang). Verifikasi = `npm run build` + jalankan dev server + curl endpoint tRPC/HTTP + cek DB pakai driver `mariadb` langsung.

**Kredensial dev (dari seed):** Super Admin `admin@tokopintar.id`/`superadmin123` (→ `/super-admin`) · Merchant `owner@tokodemo.id`/`merchant123` (→ `/dashboard`) · Toko publik dev: `http://toko-demo.localhost:3000`.

### Gotcha penting (tidak terlihat dari membaca 1 file)
1. **Prisma 7 — generator baru**: client di-generate ke `src/generated/prisma` (BUKAN `@prisma/client`). Import: `@/generated/prisma/client`. Client **WAJIB** diinstansiasi dengan adapter `PrismaMariaDb` (lihat `src/server/db.ts`) — `DATABASE_URL` di-parse jadi PoolConfig karena driver mariadb menolak skema `mysql://`. Jangan `new PrismaClient()` polos.
2. **Auth split (edge vs node)**: `server/auth.config.ts` = edge-safe (tanpa Prisma, dipakai `middleware.ts` untuk baca sesi JWT) · `server/auth.ts` = lengkap (Credentials + bcrypt + Prisma, dipakai route handler). Sesi memuat `id`, `role`, `tenantId`.
3. **tRPC layering**: context = `{ session, prisma }`. Procedure: `public/protected/merchant/superAdmin` + `planProcedure(feature)` untuk gating paket Plus (`hasPos`/`hasInvoice`/`hasCustomerDb`). Router tipis → service → Prisma. Server caller untuk RSC: `await getServerTrpc()`.
4. **Routing storefront**: `src/middleware.ts` me-*rewrite* `slug.ROOT_DOMAIN`, `slug.localhost` (dev), dan **custom domain** → `/s/[domain]/...`. `getStorefront(domain)` mencocokkan `slug` ATAU `customDomain`. Di-cache `unstable_cache` (tag `storefront-<domain>`, revalidate 300s); panggil `revalidateStorefront(tenantId)` di service setelah edit yang mengubah toko.
5. **Pola mock/fallback** (production-ready saat env key diisi): Pakasir `lib/pakasir/client.ts`, email `lib/email/client.ts`, rate-limit `lib/auth/rate-limit.ts`, reset-token `lib/auth/reset-token.ts` (HMAC stateless). Tanpa key → mock/log/in-memory. Upload gambar = tempel URL sampai storage dikonfigurasi.
6. **Tipe tRPC "excessively deep"**: untuk list/byId pakai Prisma `select` **sempit** (jangan full model); mutasi yang hasilnya tak dipakai klien kembalikan `{ ok: true }`. Model penuh (apalagi Tenant/Plan/Order dgn Json) memicu error instantiasi tipe.
7. **Serialisasi RSC→client**: JANGAN lewatkan `Decimal`/`Date`/`Json` Prisma ke Client Component. Coerce di service (`Number(rating)`, `formatDate(...)`, `Array.isArray(json) ? json : []`).
8. **Next 16**: `revalidateTag(tag, profile)` butuh arg ke-2 (mis. `"max"`); `params` adalah `Promise` (await dulu); warning `middleware.ts` deprecated → `proxy` aman diabaikan.
9. **Saat verifikasi via shell**: `grep -oP` bisa gagal (locale non-UTF-8) → pakai `sed`. SSR memisah teks `{a}{b}` dengan `<!-- -->`, jadi grep gabungan (mis. `slug.domain`, "Paket Basic") sering meleset walau ter-render.

---

## Gambaran Project

**TokoPintar** adalah SaaS multi-tenant website builder untuk UMKM Indonesia.
Stack: **Next.js 15 (App Router) + tRPC + Prisma + MySQL + React 18 + TypeScript + Tailwind CSS v4**

- Setiap tenant (merchant) mendapat subdomain: `slug.tokopintar.id`
- Ada 2 peran user: `SUPERADMIN` (platform) dan `MERCHANT` (pemilik toko)
- Website publik tenant diakses via subdomain, tanpa login

> Dokumen pendamping: `prd.md` (Product Requirements) & `backend.md` (arsitektur detail). Baca keduanya untuk konteks lengkap.

---

## Struktur Folder

```
saas-umkm/
├── src/
│   ├── app/                          # Next.js App Router (routing + halaman)
│   │   ├── (auth)/                   # Login, forgot/reset password
│   │   ├── (superadmin)/super-admin/ # Halaman super admin (guard SUPERADMIN)
│   │   ├── (tenant)/dashboard/       # Halaman merchant (guard MERCHANT)
│   │   ├── (public)/                 # Website publik tenant (via subdomain)
│   │   └── api/
│   │       ├── trpc/[trpc]/route.ts  # Handler tRPC
│   │       └── auth/[...nextauth]/route.ts
│   │
│   ├── server/
│   │   ├── trpc.ts                   # Init tRPC, context, procedures (guard role)
│   │   ├── auth.ts                   # Konfigurasi Auth.js (NextAuth v5)
│   │   ├── db.ts                     # Prisma client singleton + tenant extension
│   │   ├── routers/                  # tRPC routers (pengganti Controller)
│   │   │   ├── _app.ts               # Root router
│   │   │   ├── superadmin/
│   │   │   └── tenant/
│   │   └── services/                 # Logika bisnis + query DB
│   │       ├── shared/               # Base service reusable (CRUD generik)
│   │       ├── superadmin/
│   │       └── tenant/
│   │
│   ├── lib/
│   │   ├── validations/              # Skema Zod (pengganti Form Request)
│   │   ├── helpers/                  # Fungsi reusable (slug, paginate, format, dll)
│   │   ├── constants/                # Konstanta (status, config) — no magic string
│   │   ├── trpc/                     # Client & server caller tRPC
│   │   └── utils.ts                  # cn() & helper kecil
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn primitives
│   │   └── shared/                   # Komponen reusable lintas halaman
│   │
│   ├── types/                        # TypeScript types global
│   └── middleware.ts                 # Subdomain routing + auth + role guard
│
├── prisma/
│   ├── schema.prisma                 # Definisi schema (pengganti Model + Migration)
│   ├── migrations/                   # Auto-generate via prisma migrate
│   └── seed.ts                       # Seeder (plans + super admin)
│
├── prd.md                            # Product Requirements Document
├── claude.md                         # File ini
└── backend.md                        # Panduan backend & arsitektur
```

---

## Aturan Penting — WAJIB DIIKUTI

### Backend (tRPC / Prisma / TypeScript)

1. **Service Layer Wajib**: Semua logika query database & bisnis HARUS di `server/services/`, bukan di router. Router hanya validasi input (Zod) lalu memanggil service.

   ```ts
   // ✅ BENAR — router tipis
   list: merchantProcedure
     .input(listProductSchema)
     .query(({ ctx, input }) => productService.getPaginated(ctx.tenantId, input)),

   // ❌ SALAH — query Prisma langsung di router
   list: merchantProcedure.query(({ ctx }) =>
     ctx.prisma.product.findMany({ where: { tenantId: ctx.tenantId } })
   ),
   ```

2. **Multi-tenancy Isolation**: Setiap query pada model tenant-scoped (`category`, `product`, `order`, `customer`) HARUS difilter `tenantId`. Untuk update/delete, WAJIB cek kepemilikan via `assertTenantOwns()`.

   ```ts
   // ✅ BENAR
   prisma.product.findMany({ where: { tenantId } });
   await assertTenantOwns("product", id, tenantId);

   // ❌ SALAH — bocor data antar tenant
   prisma.product.findMany();
   ```

3. **Reusable First (DRY)**: Sebelum menulis fungsi baru, cek `lib/helpers/`. Fungsi yang dipakai >1 tempat (slug, paginate, format rupiah, validasi upload, dll) HARUS dipisah ke helper, bukan di-copy.

4. **Base Service**: Untuk CRUD standar tenant-scoped, extend `createBaseService()` dari `server/services/shared/`. Jangan tulis ulang `list`/`findOne`/`delete`.

5. **Validasi**: Setiap tRPC procedure HARUS punya `.input(zodSchema)`. Skema disimpan di `lib/validations/`, jangan validasi inline.

6. **Konstanta**: Jangan hardcode magic string/number (status, per-page, limit upload). Pakai `lib/constants/`.

7. **Guard Role**: Gunakan procedure yang tepat:
   - `merchantProcedure` → area merchant (auto inject `tenantId`)
   - `superAdminProcedure` → area super admin
   - `protectedProcedure` → wajib login (role bebas)
   - `publicProcedure` → publik

8. **Prisma Schema**: Jangan edit file migration yang sudah ter-generate. Ubah `schema.prisma`, lalu jalankan `prisma migrate dev --name xxx`.

9. **Raw Query**: Dilarang `$queryRawUnsafe`. Jika perlu raw, pakai `prisma.$queryRaw` (tagged template, auto-escape).

10. **Halaman Publik = SSR + SEO**: Halaman toko publik (`app/(public)/`) WAJIB Server Component + metadata via `buildTenantMetadata()` dari `lib/seo/metadata.ts` (jangan tulis metadata manual berulang). JSON-LD WAJIB pakai komponen `<JsonLd>` dari `lib/seo/json-ld.tsx` (sudah escape anti-XSS) — JANGAN `dangerouslySetInnerHTML` mentah. Production WAJIB `robots: index`; staging `noindex`. Detail di `backend.md §23.1`.

11. **Plan Enforcement**: Sebelum aksi yang dibatasi paket (create produk, fitur Plus), panggil `assertProductQuota()` / `assertPlanFeature()` dari `lib/helpers/plan-guard.ts`. Jangan andalkan UI saja.

12. **Audit Log**: Aksi sensitif (suspend, impersonate, hapus tenant, ubah billing) WAJIB dicatat via `logAudit()`.

13. **Owner vs Staff**: Aksi billing & kelola user pakai `ownerProcedure`, bukan `merchantProcedure`.

---

### Frontend (React / TypeScript)

1. **Struktur Folder**: Ikuti struktur `src/` yang sudah didefinisikan. Jangan buat folder baru di luar struktur tanpa diskusi.

2. **TypeScript Strict**: Semua komponen & fungsi harus typed. Hindari `any` kecuali sangat terpaksa.

3. **Server vs Client Component**: Default pakai **Server Component** (RSC). Tambah `"use client"` HANYA jika butuh interaktivitas (state, event, hooks).

4. **Data Fetching**:
   ```tsx
   // ✅ Server Component → server caller
   const products = await serverTrpc.product.list({ page: 1 });

   // ✅ Client Component → React hook
   const { data } = trpc.product.list.useQuery({ page: 1 });
   ```

5. **Mutasi**: Pakai `trpc.x.useMutation()` (pengganti `useForm` Inertia). Selalu handle `onSuccess`/`onError` + invalidate query terkait.
   ```tsx
   const create = trpc.product.create.useMutation({
     onSuccess: () => { toast.success("Tersimpan"); utils.product.list.invalidate(); },
     onError: (e) => toast.error(e.message),
   });
   ```

6. **Komponen Reusable**: UI yang dipakai di >1 halaman HARUS di `components/shared/` (mis. `DataTable`, `StatusBadge`, `StatCard`, `ConfirmDialog`, `FormField`). Jangan duplikasi UI antar halaman.

7. **Data Table**: Selalu pakai `<DataTable>` dari `components/shared/data-table.tsx` untuk tabel dengan search, filter, paginasi.

8. **UI Primitives**: Pakai shadcn/ui dari `components/ui/`. Jangan buat ulang button, input, dialog, dll.

9. **Tailwind & Warna**: Pakai Tailwind v4 + design token (CSS variables). Warna status pakai custom class `badge-*` (dari `app.css`), warna brand pakai `bg-primary`/`text-primary`. JANGAN hardcode warna status berulang (`bg-green-100`, `text-yellow-800`) di banyak komponen. Warna dinamis per tenant (`primaryColor`) di-inject sebagai `--color-primary` di layout publik. Detail di `backend.md §11`.

10. **Helper Frontend**: Format rupiah, tanggal, link WA, dll ambil dari `lib/helpers/` — jangan tulis ulang di komponen.

11. **Error Handling**: Setiap form handle & tampilkan error dari Zod/tRPC. Pakai `error.tsx` (App Router) untuk error boundary per route.

---

## Pola Umum yang Digunakan

### Pola Fetch Data (Server Component)
```tsx
// app/(tenant)/dashboard/products/page.tsx
import { serverTrpc } from "@/lib/trpc/server";
import { ProductTable } from "./_components/product-table";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const products = await serverTrpc.product.list({
    search: searchParams.search,
    page: Number(searchParams.page ?? 1),
  });
  return <ProductTable initialData={products} />;
}
```

### Pola Mutasi (Client Component)
```tsx
"use client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function CreateProductForm() {
  const utils = trpc.useUtils();
  const create = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil disimpan");
      utils.product.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return <button onClick={() => create.mutate({ name: "Kue", price: 65000, stock: 10 })}>Simpan</button>;
}
```

### Pola Multi-tenancy (Service)
```ts
import { createBaseService } from "@/server/services/shared/base.service";

const base = createBaseService("product");

export const productService = {
  getPaginated: (tenantId: string, filters) =>
    base.list(tenantId, { where: buildWhere(filters), include: { category: true } }),
  // tenantId selalu di-inject, tidak bisa bocor antar tenant
};
```

---

## Variabel Lingkungan (`.env`)

```env
# Database MySQL
DATABASE_URL="mysql://root:@127.0.0.1:3306/tokopintar"

# Auth.js
AUTH_SECRET="generate: npx auth secret"
AUTH_URL="http://localhost:3000"

# Domain
NEXT_PUBLIC_ROOT_DOMAIN="tokopintar.id"

# Pembayaran langganan (Pakasir) — RAHASIA, server only
PAKASIR_BASE_URL="https://app.pakasir.com"
PAKASIR_PROJECT="umkm-saas"
PAKASIR_API_KEY="<api-key-dari-dashboard>"
CRON_SECRET="rahasia-untuk-cron"

# Email transaksional (Resend / SMTP)
RESEND_API_KEY=

# Storage (UploadThing / S3 / Cloudinary)
UPLOADTHING_TOKEN=

# Email (Resend / SMTP)
RESEND_API_KEY=
```

---

## Perintah Umum

```bash
# Setup awal
npm install
npx auth secret                 # generate AUTH_SECRET
npx prisma migrate dev          # buat tabel dari schema (mirip artisan migrate)
npx prisma db seed              # isi data awal (plans + super admin)

# Development
npm run dev                     # Next.js dev server (localhost:3000)

# Database (Prisma — pengganti artisan)
npx prisma migrate dev --name nama_perubahan  # buat + apply migration baru
npx prisma migrate deploy                      # apply migration di production
npx prisma migrate reset                       # reset + seed ulang (mirip migrate:fresh --seed)
npx prisma studio                              # GUI lihat data (mirip tinker)
npx prisma generate                            # regenerate Prisma Client

# Build & Test
npm run build                   # build production + cek TypeScript
npm run test                    # vitest
```

---

## Padanan Laravel → Next.js (untuk yang familiar Laravel)

| Konsep Laravel | Padanan Next.js |
|---|---|
| `php artisan migrate` | `prisma migrate dev` |
| `php artisan db:seed` | `prisma db seed` |
| `php artisan tinker` | `prisma studio` |
| Eloquent Model | Prisma model (`schema.prisma`) |
| Controller | tRPC router (`server/routers/`) |
| `App\Services\` | `server/services/` |
| Form Request | Zod schema (`lib/validations/`) |
| Middleware `CheckRole` | `merchantProcedure` / `superAdminProcedure` |
| Global Scope `TenantScope` | filter `tenantId` + `assertTenantOwns()` |
| `Inertia::render()` | RSC `page.tsx` + tRPC |
| `useForm` (Inertia) | `trpc.x.useMutation()` |
| Helper / Trait | `lib/helpers/*` |
| Blade partial | `components/shared/*` |
| Laravel Policy | cek `tenantId` di service/procedure |

---

## Hal yang TIDAK Boleh Dilakukan

- ❌ Jangan taruh query Prisma langsung di router (pakai Service)
- ❌ Jangan query model tenant-scoped tanpa filter `tenantId`
- ❌ Jangan update/delete tanpa `assertTenantOwns()`
- ❌ Jangan copy-paste fungsi yang sama (pakai `lib/helpers/`)
- ❌ Jangan duplikasi komponen UI antar halaman (pakai `components/shared/`)
- ❌ Jangan hardcode magic string/number (pakai `lib/constants/`)
- ❌ Jangan hardcode warna status berulang (`bg-green-100`) — pakai custom class `badge-*` / token
- ❌ Jangan tRPC procedure tanpa `.input()` Zod
- ❌ Jangan pakai `$queryRawUnsafe`
- ❌ Jangan pakai `id` integer auto-increment (pakai `cuid()` — anti enumerasi)
- ❌ Jangan tambah `"use client"` kalau tidak perlu interaktivitas
- ❌ Jangan pakai `dangerouslySetInnerHTML` tanpa sanitasi (DOMPurify)
- ❌ Jangan commit `.env` atau secret apapun
- ❌ Jangan pakai `any` kecuali sangat terpaksa

---

## Keamanan (ringkas — detail di PRD §10)

- **Auth**: password di-hash (bcrypt/argon2), sesi JWT cookie `httpOnly`, login di-rate-limit.
- **Otorisasi**: cek role di server (procedure), bukan cuma sembunyikan tombol UI.
- **Isolasi tenant**: filter `tenantId` + `assertTenantOwns()` di setiap akses data.
- **Validasi**: semua input lewat Zod; whitelist field, jangan spread input mentah.
- **Upload**: whitelist tipe gambar + batas ukuran via `validateImage()`.
- **Secret**: hanya `NEXT_PUBLIC_*` yang boleh ke browser.
- **Billing (Pakasir)**: webhook hanya pemicu — status pembayaran WAJIB diverifikasi ulang ke API Pakasir (`transactiondetail`) + cek `amount`/`order_id`. `confirmPayment` harus idempotent. API key & cron secret hanya di server. Detail di `backend.md §22`.
- **SEO/JSON-LD**: render JSON-LD WAJIB lewat `<JsonLd>` (escape anti-XSS). Validasi URL gambar OG (harus dari storage sendiri). Service publik hanya expose field publik tenant (jangan email/billing).

---

## Referensi Dokumentasi

- [Next.js 15 Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js (NextAuth v5)](https://authjs.dev)
- [Zod](https://zod.dev)
- [React 18 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide React Icons](https://lucide.dev)
- [Recharts](https://recharts.org)
