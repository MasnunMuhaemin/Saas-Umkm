# syntax=docker/dockerfile:1

# ============================================================================
# TokoPintar / MayWeb — image produksi Next.js 16 + Prisma 7 (adapter MariaDB)
# Multi-stage: deps → builder → runner (output standalone, image ramping)
# ============================================================================

# ---- 1) Base: Node 22 Alpine + lib kompat & openssl ----
# libc6-compat: dibutuhkan binari native (sharp). openssl: dibutuhkan Prisma
# schema engine saat `prisma migrate deploy` (kalau tidak ada → migrasi gagal).
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- 2) Deps: install semua dependency (layer cache terpisah dari source) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- 3) Builder: generate Prisma client + build Next ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# sharp: dibutuhkan optimasi next/image di production. Diinstall di sini agar
# ikut ter-trace ke output standalone (runner tidak perlu npm install lagi).
RUN npm install sharp

# DATABASE_URL dummy: HANYA agar `new URL()` di src/server/db.ts lolos saat build.
# Tidak ada koneksi DB nyata — semua halaman jadi dinamis karena auth() baca cookie.
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
ENV AUTH_SECRET="build-time-placeholder"
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* dibekukan saat build → harus diset di sini bila ingin override.
ARG NEXT_PUBLIC_ROOT_DOMAIN="tokopintar.id"
ENV NEXT_PUBLIC_ROOT_DOMAIN=${NEXT_PUBLIC_ROOT_DOMAIN}

RUN npx prisma generate
RUN npm run build

# ---- 3b) Migrator: khusus `prisma migrate deploy` — TANPA `next build` ----
# migrate hanya butuh Prisma CLI + schema + migrations, tidak perlu app ter-build.
# Memisahkan ini mencegah `next build` jalan 2x (hemat RAM besar di VPS kecil).
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ---- 4) Runner: hanya server standalone + aset statis (image kecil) ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Jalankan sebagai user non-root.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Output standalone berisi server.js + node_modules minimal (sudah termasuk sharp).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
