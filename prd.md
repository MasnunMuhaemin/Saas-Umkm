# Product Requirements Document (PRD)
## TokoPintar — SaaS UMKM Website Builder
**Versi:** 3.0
**Terakhir Diperbarui:** Juni 2026
**Pemilik Produk:** Maydigital
**Stack Target:** Next.js 15 (App Router) · tRPC · Prisma · MySQL · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui

---

## 1. Ringkasan Produk

TokoPintar adalah platform **SaaS multi-tenant** yang memungkinkan pelaku UMKM memiliki website toko online profesional tanpa keahlian teknis. Setiap merchant (tenant) mendapatkan subdomain sendiri (`slug.tokopintar.id`) dengan kemampuan kustomisasi penuh melalui dashboard admin.

**Tagline:** *"Toko Online Profesional untuk Semua UMKM Indonesia"*

---

## 2. Target Pengguna

| Segmen | Deskripsi |
|---|---|
| **Super Admin** | Tim Maydigital — mengelola seluruh platform, tenant, dan konfigurasi sistem |
| **Merchant (Tenant)** | Pemilik UMKM — mengelola toko, produk, pesanan, dan tampilan website mereka |
| **Pelanggan Publik** | Pengunjung website toko yang melihat produk dan memesan via WhatsApp |

---

## 3. Masalah yang Dipecahkan

1. UMKM kesulitan memiliki toko online yang profesional karena biaya dan kerumitan teknis
2. Platform marketplace (Tokopedia, Shopee) memiliki kompetisi internal yang tinggi
3. Tidak ada identitas brand sendiri ketika berjualan di marketplace
4. Pengelolaan pesanan WhatsApp tidak terorganisir
5. Tidak ada analitik untuk memahami performa produk

---

## 4. Fitur Utama

### 4.1 Untuk Merchant (Tenant Admin)

#### Dashboard & Analitik
- KPI cards: total produk, total pesanan, total pelanggan, estimasi revenue
- Grafik pertumbuhan penjualan (recharts)
- Daftar pesanan terbaru & aktivitas terkini

#### Manajemen Produk
- CRUD produk: nama, deskripsi, harga, harga coret, stok, berat, SKU
- Multi-gambar per produk (upload ke storage)
- Kategori produk dengan icon
- Status: aktif / nonaktif / habis stok
- Tandai produk: Terlaris (`isBest`), Baru (`isNew`), Unggulan (`isFeatured`)
- SEO per produk: meta title, meta description
- Filter & pencarian di tabel produk

#### Manajemen Pesanan
- Daftar pesanan masuk dengan status: pending → processing → shipped → completed / cancelled
- Detail pesanan: item, subtotal, ongkir, diskon, total
- Update status pesanan
- Data pelanggan terintegrasi
- Ekspor/cetak invoice PDF

#### Manajemen Pelanggan
- Database pelanggan per toko
- Riwayat pembelian per pelanggan
- Total pesanan & total pengeluaran pelanggan

#### Website Builder (Kustomisasi Toko)
- **Identitas Bisnis:** nama toko, tagline, logo, favicon, deskripsi
- **Hero Section:** judul, subjudul, gambar banner, posisi teks (kiri/tengah/kanan), CTA text, hero stats
- **Warna Tema:** primary color picker
- **Halaman About:** foto, judul, body teks, checklist keunggulan, tahun pengalaman
- **Seksi Keunggulan:** 4 keunggulan custom
- **Testimonial:** hingga N testimonial pelanggan
- **FAQ:** accordion pertanyaan & jawaban
- **Promo Banner:** judul, subjudul, gambar, kode promo
- **Sosial Media:** Instagram, Facebook, TikTok, YouTube, Twitter
- **Kontak:** nomor WhatsApp, telepon, email, alamat, jam buka, Google Maps embed
- **SEO Global:** meta title, meta description per toko
- **Visibilitas Elemen:** toggle tampil/sembunyikan harga, stok, rating, tombol WA, kategori, diskon

#### Pengaturan Akun
- Ubah profil (nama, email)
- Ubah password
- Info paket aktif & tanggal berakhir

#### Sistem Kasir (Plan Plus)
- POS sederhana: pilih produk, atur jumlah, hitung total
- Metode bayar: tunai, transfer, e-wallet
- Cetak/unduh invoice PDF
- Riwayat transaksi kasir

---

### 4.2 Untuk Super Admin

#### Dashboard Platform
- Total tenant (real-time dari DB)
- Tenant aktif / trial / suspended
- Total produk seluruh platform
- Estimasi MRR (Monthly Recurring Revenue)
- Distribusi paket (Basic vs Plus) — Pie chart
- Grafik pertumbuhan tenant & MRR (Area chart — 6 bulan)
- Aktivitas platform terbaru
- Status layanan (API, Database, CDN, Email)

#### Manajemen Tenant
- Daftar semua tenant + filter (status, paket) + pencarian
- **Buat Tenant Baru:** nama usaha, subdomain, WhatsApp, nama pemilik, email login, password, paket, tanggal berakhir
- **Edit Tenant:** nama usaha, WA, paket, status langganan, tanggal berakhir, status akun, kredensial login
- **Suspend / Aktifkan** tenant
- **Reset Password:** kirim link reset ke email tenant
- **Hapus Tenant** (permanen, dengan konfirmasi)
- Login sebagai tenant (impersonate)

#### Manajemen Paket Langganan
- Lihat paket aktif: Basic & Plus
- Tenant & MRR per paket
- Bar chart perbandingan revenue antar paket
- Edit harga & fitur paket (UI tersedia, belum terhubung ke DB)

#### Statistik Global
- Traffic seluruh website 7 hari (Area chart)
- Pertumbuhan produk aktif (Line chart)
- Total pageviews, unique visitors, produk aktif, avg. session
- Top 5 tenant berdasarkan traffic (progress bar)

#### Manajemen Domain Pool
- Daftar subdomain tenant
- Konfigurasi custom domain per tenant
- Status: Bawaan / Terhubung

#### Pusat Notifikasi Admin
- Notifikasi persisten dari DB (`adminNotifications`)
- Notifikasi dinamis: langganan akan berakhir dalam 7 hari
- Tandai dibaca / tandai semua dibaca
- Badge jumlah notifikasi belum dibaca di header

#### Pengaturan Sistem
- Konfigurasi global platform
- (UI in progress)

---

### 4.3 Website Publik Tenant (Tanpa Login)

#### Halaman Beranda
- Hero section dinamis (dari settings tenant)
- Kategori produk
- Produk terlaris
- Produk baru
- Promo banner (jika diaktifkan)
- Seksi About
- Keunggulan
- Testimonial pelanggan
- FAQ
- Lokasi (Google Maps embed)
- Footer dengan sosial media & kontak

#### Halaman Produk
- Filter kategori (sidebar)
- Pencarian produk
- Sorting: populer, harga naik, harga turun
- Toggle tampilan grid / list
- Product cards: foto, nama, kategori, rating, harga, stok, tombol WA

#### Halaman Detail Produk
- Galeri foto
- Nama, kategori, harga, harga coret, badge diskon
- Stok tersedia
- Rating & jumlah ulasan
- Deskripsi lengkap
- Tombol "Pesan via WhatsApp"

#### Halaman About
- Foto usaha + tahun pengalaman
- Deskripsi panjang
- Checklist keunggulan

#### Halaman Kontak
- Info kontak lengkap
- Google Maps embed
- Tombol WhatsApp

---

## 5. Paket Langganan

| Fitur | Basic (Rp 100.000/bln) | Plus (Rp 150.000/bln) |
|---|:---:|:---:|
| Website Landing Page | ✅ | ✅ |
| Profil Bisnis | ✅ | ✅ |
| Katalog Produk | ✅ | ✅ |
| WhatsApp Order | ✅ | ✅ |
| Website Builder | ✅ | ✅ |
| Dashboard Admin | ✅ | ✅ |
| Optimasi SEO | — | ✅ |
| Sistem Kasir (POS) | — | ✅ |
| Invoice PDF & Riwayat | — | ✅ |
| Manajemen Data Pelanggan | — | ✅ |

---

## 6. Billing & Langganan (Pakasir)

Pembayaran langganan diproses lewat **Pakasir** (payment gateway lokal: QRIS + Virtual Account). Mode integrasi: **API + QR code ditampilkan di dashboard sendiri** (bukan redirect). Dua jalur pembayaran didukung: **merchant bayar sendiri (self-service)** dan **super admin membuat tagihan manual**.

### 6.1 Lifecycle Langganan

| Status | Arti | Akses Toko |
|---|---|---|
| **TRIAL** | Masa coba (tenant baru) | Aktif penuh |
| **PENDING** | Menunggu pembayaran pertama | Belum aktif |
| **ACTIVE** | Langganan berjalan, sudah dibayar | Aktif penuh |
| **PAST_DUE** | Lewat jatuh tempo, dalam grace period (3 hari) | Masih aktif (diberi peringatan) |
| **EXPIRED** | Lewat grace period → toko disuspend | Nonaktif |
| **CANCELLED** | Dibatalkan tenant/admin | Nonaktif |

```
TRIAL ──bayar──► ACTIVE ──jatuh tempo──► PAST_DUE ──lewat grace──► EXPIRED (SUSPEND)
                   ▲                                                    │
                   └──────────────── bayar ulang ───────────────────────┘
```

### 6.2 Flow Pembayaran (Self-Service Merchant)

```
Merchant buka menu "Langganan" di dashboard
  → Klik "Bayar Langganan"
    → Sistem buat invoice + panggil Pakasir API (transactioncreate/qris)
      → QR code QRIS tampil di dashboard
        → Merchant scan via e-wallet / m-banking
          → Pakasir kirim webhook "completed"
            → Sistem VERIFIKASI ULANG ke Pakasir (transactiondetail)
              → Langganan diperpanjang 1 bulan + status ACTIVE
                → Notifikasi "pembayaran berhasil"
```

### 6.3 Flow Tagihan Manual (Super Admin)

```
Super Admin → Manajemen Tenant → pilih tenant
  → "Buat Tagihan" → sistem generate invoice + QR (sama seperti di atas)
    → Admin kirim QR/link ke merchant via WhatsApp
      → Pembayaran & aktivasi otomatis (via webhook + verifikasi)
```

### 6.4 Aturan Penting Billing

- **Verifikasi ganda:** webhook hanya pemicu; status final selalu dikonfirmasi balik ke API Pakasir + cek `amount` & `order_id` cocok dengan DB (anti-spoof).
- **Idempotent:** pembayaran yang sama tidak diproses dua kali.
- **Grace period:** 3 hari setelah jatuh tempo sebelum suspend (bisa dikonfigurasi).
- **Auto-suspend:** cron harian memindahkan ACTIVE→PAST_DUE→EXPIRED otomatis.
- **Pencairan dana:** dana Pakasir cair H+1 (setelah 12.00 WIB), bukan real-time.
- **API key Pakasir:** rahasia, hanya di server, tidak pernah dikirim ke browser.

### 6.5 Plan Enforcement

Batas paket WAJIB dipaksakan di server (bukan hanya UI):

| Batasan | Basic | Plus | Cara enforce |
|---|---|---|---|
| `maxProducts` | (mis. 50) | unlimited | Cek jumlah produk sebelum create |
| Fitur SEO | ❌ | ✅ | Guard `hasSeo` di procedure |
| Sistem Kasir (POS) | ❌ | ✅ | Guard `hasPos` di procedure |
| Invoice PDF | ❌ | ✅ | Guard `hasInvoice` |
| Data Pelanggan | ❌ | ✅ | Guard `hasCustomerDb` |

---

## 7. Fitur Lanjutan (Roadmap Lengkap)

Bagian ini merinci fitur tambahan agar TokoPintar matang sebagai SaaS. Dikelompokkan per prioritas.

### 7.1 SEO Server-Side (PRIORITAS — kritikal untuk value SaaS)

Landing page tenant WAJIB **server-rendered (SSR/SSG/ISR)**, bukan client-side. Alasannya: toko UMKM tujuannya ditemukan di Google & preview-able saat di-share di WhatsApp/sosmed. Crawler & bot WA/Facebook tidak mengeksekusi JavaScript, jadi konten harus sudah ada di HTML awal.

#### 7.1.1 Technical SEO

| Requirement | Implementasi |
|---|---|
| Render server-side | Halaman publik pakai React Server Component + `generateMetadata()` |
| `sitemap.xml` per toko | Generate otomatis dari produk & halaman tenant |
| `robots.txt` per toko | **Production: `index, follow`**; staging: `noindex` |
| Canonical URL | Satu URL kanonik per halaman (hindari duplicate subdomain vs custom domain) |
| ISR / cache | Regenerate berkala (mis. 1 jam) → cepat & hemat resource |
| Clean URL & slug | Slug produk SEO-friendly (`/products/kue-nastar`, bukan `?id=123`) |
| 404 & redirect benar | Produk dihapus → 404 / 301 redirect (jangan soft-404) |
| `hreflang` (jika multi-bahasa) | Disiapkan untuk fase multi-bahasa |

#### 7.1.2 On-Page SEO

| Requirement | Implementasi |
|---|---|
| Title dinamis per toko/produk | Dari `seoSettings.metaTitle` atau fallback nama toko/produk (bukan "Memuat...") |
| Meta description | Dari data tenant/produk, panjang optimal (~150–160 karakter) |
| Heading hierarki benar | Satu `<h1>` per halaman, `<h2>`/`<h3>` terstruktur |
| Alt text gambar | Semua gambar produk punya `alt` deskriptif |
| Internal linking | Produk ↔ kategori ↔ beranda saling terhubung |
| Semantic HTML | `<main>`, `<article>`, `<nav>`, `<footer>` — bukan `<div>` semua |

#### 7.1.3 Social / Open Graph

| Requirement | Implementasi |
|---|---|
| Open Graph tags | `og:title`, `og:description`, `og:image`, `og:url`, `og:type` |
| Twitter Card | `summary_large_image` untuk preview kaya |
| OG image fallback | Pakai logo toko jika produk tak punya gambar |
| Preview WhatsApp | Pastikan `og:image` absolute URL + ukuran memadai (min 1200×630) |

#### 7.1.4 Structured Data (JSON-LD)

| Tipe Schema | Dipakai di |
|---|---|
| `LocalBusiness` / `Store` | Beranda toko (nama, alamat, jam buka, kontak) |
| `Product` + `Offer` | Halaman detail produk (harga, ketersediaan) |
| `BreadcrumbList` | Navigasi breadcrumb |
| `Organization` | Info brand toko |

#### 7.1.5 Performance (Core Web Vitals — faktor ranking)

| Metrik | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| Optimasi gambar | `next/image` (lazy load, WebP, ukuran responsif) |
| Font | `next/font` (hindari layout shift) |

#### 7.1.6 SEO yang Bisa Diatur Merchant (di Website Builder)

Merchant bisa atur sendiri lewat dashboard (sudah ada di fitur §4.1):
- Meta title & description per toko **dan** per produk
- Slug produk custom
- OG image (banner/logo)
- Toggle visibilitas elemen yang memengaruhi tampilan

> ⚠️ Catatan environment: staging (`*.mayltemp.xyz`) boleh `noindex, nofollow`. Production WAJIB index-able, kalau tidak toko tenant tak akan muncul di Google sama sekali.

> Implementasi teknis (helper reusable, contoh kode) ada di **backend.md §23.1**.

### 7.2 Email Transaksional

Sistem email otomatis (Resend/SMTP) untuk komunikasi penting:

| Email | Pemicu | Penerima |
|---|---|---|
| Welcome / aktivasi | Tenant baru dibuat | Merchant |
| Reset password | Request lupa password | User |
| Invoice / tagihan | Langganan jatuh tempo | Merchant |
| Pembayaran berhasil | Webhook Pakasir completed | Merchant |
| Reminder bayar (H-3) | Mendekati jatuh tempo | Merchant |
| Toko disuspend | Lewat grace period | Merchant |
| Notifikasi pesanan baru (opsional) | Order masuk | Merchant |

### 7.3 Onboarding Wizard

Tenant baru dipandu setup, bukan dilempar ke dashboard kosong:
```
Login pertama → Wizard:
  1. Lengkapi info toko (nama, logo, WA)
  2. Pilih warna tema
  3. Tambah produk pertama
  4. Preview toko → Selesai → toko live
```
Progress disimpan; bisa di-skip & dilanjut nanti. Ada indikator "kelengkapan setup toko" (%).

### 7.4 Multi-User per Toko

Pemilik UMKM bisa kasih akses ke karyawan (mis. admin input produk). Butuh konsep **role di dalam tenant**:

| Role Tenant | Akses |
|---|---|
| `OWNER` | Penuh (termasuk billing & hapus toko) |
| `STAFF` | Kelola produk/pesanan, TIDAK bisa billing & setting sensitif |

> Catatan: ini level role **di dalam tenant**, berbeda dari role platform (SUPERADMIN/MERCHANT).

### 7.5 Manajemen Produk Lanjutan

| Fitur | Deskripsi |
|---|---|
| **Varian produk** | Ukuran/warna/dll dengan harga & stok berbeda per varian |
| **Import/Export CSV/Excel** | Tambah/update produk massal — penting buat UMKM produk banyak |
| **Bulk action** | Aktif/nonaktif/hapus banyak produk sekaligus |

### 7.6 Custom Domain (flow lengkap)

| Tahap | Detail |
|---|---|
| Input domain | Merchant masukkan domain sendiri (`tokosaya.com`) |
| Verifikasi DNS | Tampilkan record CNAME/A yang harus di-set, cek otomatis |
| SSL otomatis | Provisioning sertifikat (via platform hosting) |
| Status | `pending` → `verified` → `active` |

### 7.7 Tema/Template Toko

Lebih dari 1 pilihan tampilan (`theme` di DB sudah ada, tinggal isi varian): mis. `modern-store`, `minimal`, `bold`. Merchant pilih saat setup / ganti kapan saja.

### 7.8 Analytics Pengunjung (real)

Dashboard sudah nampilin traffic, tapi butuh **pengumpulan data**:
- Tracking pageview & visitor unik per toko (first-party, ringan)
- Produk paling dilihat, sumber traffic
- Opsi integrasi Google Analytics / Plausible per tenant

### 7.9 Marketing & Pertumbuhan (Super Admin)

| Fitur | Deskripsi |
|---|---|
| **Kupon langganan** | Kode diskon (mis. "diskon 50% bulan pertama") saat bayar |
| **Referral/affiliate** | Merchant ajak merchant lain → dapat komisi/kredit |
| **Trial otomatis** | Tenant baru dapat masa trial X hari tanpa bayar |

### 7.10 Audit Log

Catat aksi sensitif untuk keamanan & troubleshooting: login, impersonate, suspend tenant, hapus data, perubahan billing. Disimpan di model `AuditLog`.

### 7.11 Fitur Fase Lanjut (Nice to Have)

Ongkir otomatis (RajaOngkir/Biteship), payment gateway untuk pembeli toko (bukan cuma WA), blog per toko, multi-bahasa, program loyalti, WhatsApp Business API, laporan penjualan PDF/Excel.

---

## 8. Flow Pengguna

### 6.1 Onboarding Merchant Baru
```
Super Admin Login
  → Manajemen Tenant
    → Buat Tenant Baru (isi form: nama usaha, subdomain, email, password, paket)
      → Sistem buat akun + record bisnis (Prisma transaction)
        → Tenant menerima email/info login
          → Tenant Login ke Dashboard
            → Setup Toko (kustomisasi website)
              → Website Publik Aktif di subdomain
```

### 6.2 Alur Pesanan
```
Pengunjung buka website publik (slug.tokopintar.id)
  → Browse produk
    → Klik "Pesan via WhatsApp"
      → Redirect ke wa.me dengan pesan pre-filled
        → Negosiasi & konfirmasi via WhatsApp
          → Merchant input pesanan di Dashboard
            → Update status pesanan
              → Cetak invoice (Plus)
```

### 6.3 Super Admin Monitoring
```
Login Super Admin
  → Dashboard: lihat KPI real-time
    → Kelola tenant (suspend/aktifkan/edit)
      → Cek notifikasi (langganan hampir habis)
        → Aksi manual (perpanjang / hubungi tenant)
```

---

## 9. Model Domain

```
Platform (Super Admin)
├── Tenants (businesses)
│   ├── has one: User (owner)
│   ├── has one: Plan
│   ├── has many: Categories
│   ├── has many: Products
│   │   └── has many: OrderItems
│   ├── has many: Orders
│   │   └── belongs to: Customer
│   └── has many: Customers
└── Plans
    └── has many: Tenants
```

---

## 10. Skema Database (Prisma + MySQL)

> Definisi schema ada di `prisma/schema.prisma`. Tabel di-generate otomatis via `prisma migrate`.
> Konvensi: nama field di Prisma pakai **camelCase** (`tenantId`), kolom MySQL otomatis di-map ke camelCase juga kecuali di-override dengan `@map`.

### Model `User`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| name | String | Nama lengkap |
| email | String @unique | |
| password | String | hash (bcrypt/argon2) |
| role | Role (enum) | `SUPERADMIN`, `MERCHANT` |
| emailVerified | DateTime? | |
| createdAt / updatedAt | DateTime | |

### Model `Plan`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| name | String | Basic, Plus |
| slug | String @unique | basic, plus |
| price | Int | Harga per bulan (Rupiah) |
| maxProducts | Int? | null = unlimited |
| storageGb | Int? | |
| customDomain | Boolean @default(false) | |
| hasSeo | Boolean @default(false) | |
| hasPos | Boolean @default(false) | Sistem kasir |
| hasInvoice | Boolean @default(false) | |
| hasCustomerDb | Boolean @default(false) | |
| features | Json | Array string fitur |
| isPopular | Boolean @default(false) | |
| isActive | Boolean @default(true) | |
| sortOrder | Int @default(0) | |
| createdAt / updatedAt | DateTime | |

### Model `Tenant`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| userId | String @unique (FK → User) | Pemilik |
| planId | String (FK → Plan) | |
| name | String | Nama bisnis |
| slug | String @unique | Subdomain |
| customDomain | String? @unique | |
| status | TenantStatus (enum) | `ACTIVE`, `TRIAL`, `SUSPENDED`, `EXPIRED` |
| trialEndsAt | DateTime? | |
| phone | String? | |
| whatsapp | String? | |
| email | String? | |
| address | String? @db.Text | |
| city | String? | |
| province | String? | |
| logo | String? | URL |
| favicon | String? | URL |
| primaryColor | String @default("#2563EB") | |
| theme | String @default("modern-store") | |
| showBusinessName | Boolean @default(true) | |
| showTagline | Boolean @default(true) | |
| showPrice | Boolean @default(true) | |
| showStock | Boolean @default(true) | |
| showRating | Boolean @default(true) | |
| showWhatsappButton | Boolean @default(true) | |
| showCategory | Boolean @default(true) | |
| showDiscount | Boolean @default(true) | |
| bannerTitle | String? | |
| bannerSubtitle | String? @db.Text | |
| bannerImage | String? | |
| aboutHeadline | String? | |
| aboutBody | String? @db.Text | |
| aboutImage | String? | |
| aboutChecklist | Json? | |
| yearsExperience | Int @default(0) | |
| heroCtaText | String? | |
| heroStats | Json? | |
| testimonials | Json? | |
| faqs | Json? | |
| advantages | Json? | |
| promoEnabled | Boolean @default(false) | |
| promoTitle | String? | |
| promoSubtitle | String? @db.Text | |
| promoCode | String? | |
| promoImage | String? | |
| socialLinks | Json? | instagram, facebook, tiktok, youtube, twitter |
| seoSettings | Json? | metaTitle, metaDescription |
| googleMapsUrl | String? @db.Text | |
| openingHours | String? | |
| description | String? @db.Text | |
| tagline | String? | |
| subscriptionStart | DateTime? | |
| subscriptionEnd | DateTime? | |
| createdAt / updatedAt | DateTime | |

### Model `Category`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| name | String | |
| slug | String | unique per tenant (`@@unique([tenantId, slug])`) |
| icon | String? | Nama icon Lucide |
| color | String? | Gradient class |
| description | String? @db.Text | |
| sortOrder | Int @default(0) | |
| isActive | Boolean @default(true) | |
| createdAt / updatedAt | DateTime | |

### Model `Product`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| categoryId | String? (FK → Category) | |
| name | String | |
| slug | String | unique per tenant (`@@unique([tenantId, slug])`) |
| sku | String? | |
| description | String? @db.Text | |
| price | Int | |
| originalPrice | Int? | Harga sebelum diskon |
| stock | Int @default(0) | |
| weight | Int? | Gram |
| images | Json? | Array URL |
| mainImage | String? | |
| status | ProductStatus (enum) | `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK` |
| isFeatured | Boolean @default(false) | |
| isBest | Boolean @default(false) | Terlaris |
| isNew | Boolean @default(false) | Produk baru |
| rating | Decimal @db.Decimal(2,1) | 0.0–5.0 |
| reviewsCount | Int @default(0) | |
| soldCount | Int @default(0) | |
| viewCount | Int @default(0) | |
| metaTitle | String? | |
| metaDescription | String? @db.Text | |
| createdAt / updatedAt | DateTime | |

### Model `Customer`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| name | String | |
| email | String? | |
| phone | String? | |
| address | String? @db.Text | |
| city | String? | |
| province | String? | |
| postalCode | String? | |
| totalOrders | Int @default(0) | |
| totalSpent | Int @default(0) | |
| createdAt / updatedAt | DateTime | |

### Model `Order`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| customerId | String? (FK → Customer) | |
| orderNumber | String @unique | |
| subtotal | Int | |
| shippingCost | Int @default(0) | |
| discount | Int @default(0) | |
| tax | Int @default(0) | |
| total | Int | |
| status | OrderStatus (enum) | `PENDING`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| paymentMethod | String? | |
| paymentStatus | PaymentStatus (enum) | `UNPAID`, `PAID`, `FAILED`, `REFUNDED` |
| shippingName | String? | |
| shippingAddress | String? @db.Text | |
| notes | String? @db.Text | |
| paidAt | DateTime? | |
| createdAt / updatedAt | DateTime | |

### Model `OrderItem`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| orderId | String (FK → Order) | |
| productId | String? (FK → Product) | |
| productName | String | Snapshot nama produk |
| price | Int | Snapshot harga saat beli |
| quantity | Int | |
| subtotal | Int | |
| createdAt / updatedAt | DateTime | |

### Model `AdminNotification`
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| title | String | |
| message | String @db.Text | |
| type | String | `info`, `warning`, `success`, `error` |
| isRead | Boolean @default(false) | |
| createdAt / updatedAt | DateTime | |

### Model `Subscription` (Billing)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String @unique (FK → Tenant) | 1 langganan per tenant |
| planId | String (FK → Plan) | |
| status | SubscriptionStatus (enum) | `PENDING`, `ACTIVE`, `PAST_DUE`, `EXPIRED`, `CANCELLED` |
| startedAt | DateTime? | |
| currentEnd | DateTime? | Tanggal periode berjalan berakhir |
| graceUntil | DateTime? | Batas grace period sebelum suspend |
| autoRenew | Boolean @default(true) | |
| createdAt / updatedAt | DateTime | |

### Model `Payment` (Invoice Langganan)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| subscriptionId | String (FK → Subscription) | |
| orderId | String @unique | Dikirim ke Pakasir (`order_id`) |
| amount | Int | |
| status | PaymentStatusBilling (enum) | `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED` |
| paymentMethod | String? | qris, va, dll (dari Pakasir) |
| paymentNumber | String? @db.Text | Payload QR / nomor VA |
| periodStart / periodEnd | DateTime | Periode langganan yang dibayar |
| expiredAt | DateTime? | Kedaluwarsa pembayaran (dari Pakasir) |
| paidAt | DateTime? | |
| rawWebhook | Json? | Payload webhook mentah (audit) |
| createdAt / updatedAt | DateTime | |

> Detail integrasi Pakasir (API client, webhook, cron auto-suspend) ada di **backend.md §22**.

### Model `TenantUser` (Multi-User per Toko — §7.4)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| userId | String (FK → User) | |
| role | TenantRole (enum) | `OWNER`, `STAFF` |
| createdAt / updatedAt | DateTime | unique `[tenantId, userId]` |

### Model `ProductVariant` (Varian Produk — §7.5)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| productId | String (FK → Product) | |
| name | String | mis. "Merah / XL" |
| sku | String? | |
| price | Int | harga varian |
| stock | Int @default(0) | |
| createdAt / updatedAt | DateTime | |

### Model `Coupon` (Kupon Langganan — §7.9)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| code | String @unique | kode kupon |
| type | CouponType (enum) | `PERCENT`, `FIXED` |
| value | Int | nilai diskon (% atau Rupiah) |
| maxRedemptions | Int? | batas pakai (null = unlimited) |
| redeemedCount | Int @default(0) | |
| expiresAt | DateTime? | |
| isActive | Boolean @default(true) | |
| createdAt / updatedAt | DateTime | |

### Model `AuditLog` (§7.10)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| userId | String? | pelaku aksi |
| tenantId | String? | konteks tenant (jika ada) |
| action | String | mis. `tenant.suspend`, `auth.impersonate` |
| metadata | Json? | detail tambahan |
| ipAddress | String? | |
| createdAt | DateTime | |

### Model `VisitorEvent` (Analytics — §7.8)
| Field | Tipe Prisma | Keterangan |
|---|---|---|
| id | String @id @default(cuid()) | |
| tenantId | String (FK → Tenant) | |
| path | String | halaman yang dilihat |
| visitorId | String | ID anonim (hash) |
| referrer | String? | sumber traffic |
| createdAt | DateTime | |

> Definisi Prisma lengkap (enum, relasi, index) ada di **backend.md §3** & detail tiap fitur di **backend.md §24**.

---

## 11. Non-Functional Requirements

| Aspek | Target |
|---|---|
| **Performance** | Halaman publik < 2s LCP pada koneksi 4G (manfaatkan SSR/ISR Next.js) |
| **Keamanan** | Lihat detail di §10 (Keamanan) |
| **Multi-tenancy** | Isolasi data 100% per tenant (semua query difilter `tenantId` via Prisma extension) |
| **Responsif** | Mobile-first, breakpoint: sm (640px), md (768px), lg (1024px) |
| **SEO** | Metadata dinamis per toko via `generateMetadata()`, semantic HTML, canonical URL |
| **Skalabilitas** | Siap untuk 1000+ tenant (connection pooling, caching) |
| **Uptime** | 99.9% target |

---

## 12. Keamanan (Security Requirements)

Keamanan wajib diterapkan berlapis (defense in depth). Berikut requirement per area.

### 10.1 Autentikasi & Sesi
| Requirement | Implementasi |
|---|---|
| Password di-hash | bcrypt/argon2, **tidak pernah** simpan plaintext |
| Sesi via JWT | Auth.js, cookie `httpOnly` + `secure` + `sameSite=lax` |
| Login throttling | Maks 5 percobaan / menit / IP (rate limit) |
| Reset password | Token sekali pakai, kedaluwarsa 1 jam |
| Logout | Invalidasi sesi di sisi klien & server |
| Impersonate (super admin) | Dicatat di audit log, sesi terpisah & bertanda |

### 10.2 Otorisasi (Access Control)
| Requirement | Implementasi |
|---|---|
| Role-based access | `MERCHANT` & `SUPERADMIN` dicek di `middleware.ts` + tRPC procedure |
| Resource ownership | Setiap akses data dicek `tenantId` — tenant A tidak bisa baca/ubah data tenant B |
| Default deny | Procedure tanpa guard eksplisit = tertutup |
| Server-side enforcement | Validasi role **wajib di server**, bukan hanya sembunyikan tombol di UI |

### 10.3 Isolasi Multi-Tenant (paling kritikal)
| Requirement | Implementasi |
|---|---|
| Filter otomatis `tenantId` | Prisma extension `tenantDb()` inject `tenantId` ke semua query tenant-scoped |
| Double-check di service | Query sensitif pakai `findFirstOrThrow({ where: { id, tenantId } })` |
| Tidak ada query global | Dilarang `prisma.product.findMany()` tanpa filter tenant di area merchant |
| Slug & ID tidak enumerable | Pakai `cuid()` (bukan integer berurutan) agar ID tak bisa ditebak |

### 10.4 Validasi & Sanitasi Input
| Requirement | Implementasi |
|---|---|
| Validasi semua input | Zod schema di setiap tRPC procedure (pengganti Form Request) |
| Mass assignment protection | Whitelist field via Zod `.pick()` — jangan spread input mentah ke Prisma |
| SQL injection | Dicegah Prisma (parameterized query). Dilarang `$queryRawUnsafe` |
| XSS | React auto-escape; dilarang `dangerouslySetInnerHTML` tanpa sanitasi (DOMPurify) |
| Output encoding | Data user di website publik di-render aman (escape HTML) |

### 10.5 Keamanan Upload File
| Requirement | Implementasi |
|---|---|
| Whitelist tipe file | Hanya `image/jpeg`, `image/png`, `image/webp` |
| Batas ukuran | Maks 2 MB per gambar |
| Validasi konten | Cek MIME asli (magic bytes), bukan hanya ekstensi |
| Storage terpisah | Upload ke S3/UploadThing/Cloudinary, bukan di server aplikasi |
| Nama file di-randomize | Hindari path traversal & overwrite |

### 10.6 Proteksi Endpoint & Jaringan
| Requirement | Implementasi |
|---|---|
| Rate limiting | `@upstash/ratelimit` + Redis pada login, reset password, endpoint mutasi |
| CSRF | Auth.js menangani; cookie `sameSite` + same-origin tRPC |
| HTTPS only | Redirect HTTP→HTTPS, header `Strict-Transport-Security` (HSTS) |
| Security headers | CSP, `X-Frame-Options`, `X-Content-Type-Options` via `next.config` |
| CORS | Dibatasi ke domain platform & subdomain tenant |

### 10.7 Manajemen Secret & Konfigurasi
| Requirement | Implementasi |
|---|---|
| Secret di `.env` | `AUTH_SECRET`, `DATABASE_URL`, API key — **tidak** di-commit |
| Tidak ada secret di klien | Hanya var berprefix `NEXT_PUBLIC_` yang boleh ke browser |
| Rotasi kredensial | Reset `AUTH_SECRET` & DB password berkala |

### 10.8 Audit & Monitoring
| Requirement | Implementasi |
|---|---|
| Audit log aksi sensitif | Login, impersonate, suspend tenant, hapus data — dicatat |
| Error tidak bocorkan detail | Pesan error ke user generik; stack trace hanya di log server |
| Logging | Sentry/log terpusat untuk error & aktivitas mencurigakan |

---

## 13. Batasan & Asumsi

- Pembayaran tidak diproses di platform (order via WhatsApp)
- Tidak ada fitur ulasan pelanggan dari website (hanya data manual dari admin)
- Custom domain memerlukan konfigurasi DNS manual oleh tenant
- Storage gambar menggunakan storage eksternal (S3 / UploadThing / Cloudinary)
- Email notification menggunakan layanan email (Resend / Nodemailer SMTP)

---

## 14. Roadmap

| Fase | Fitur | Status |
|---|---|---|
| **MVP** | Auth, Manajemen Produk, Website Publik (SSR/SEO), Super Admin, Billing Pakasir | 🟡 In Progress |
| **v1.1** | Manajemen Pesanan, Data Pelanggan, Invoice PDF, Email Transaksional, Onboarding Wizard | 📋 Planned |
| **v1.2** | Sistem Kasir POS, Laporan Penjualan, Import/Export CSV, Varian Produk | 📋 Planned |
| **v1.3** | Multi-User per Toko, Audit Log, Kupon Langganan | 📋 Planned |
| **v2.0** | Custom Domain Otomatis, Analytics Real-time, Tema/Template Toko, Referral | 📋 Planned |
| **v2.5** | Blog per Toko, Multi-bahasa, Ongkir Otomatis, Payment Gateway Pembeli, WA Business API | 📋 Planned |
