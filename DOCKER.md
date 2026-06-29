# Deploy MayWeb ke VPS dengan Docker

Panduan lengkap menjalankan MayWeb di VPS (dioptimalkan untuk **VPS kecil: 1 GB RAM**).
Stack yang dijalankan: **Caddy** (HTTPS) → **app** (Next.js) → **db** (MariaDB), plus
**migrate** (sekali jalan).

```
Internet ──HTTPS──► Caddy (:443) ──► app (:3000) ──► db (MariaDB)
   *.domain & custom domain                 ▲
   sertifikat otomatis (on-demand)          └── volume db-data (di-backup)
```

---

## Prasyarat

- VPS (Ubuntu 22.04/24.04 LTS) + akses SSH.
- Domain + akses panel DNS-nya.
- Kode MayWeb (lewat `git` atau registry — lihat di bawah).

---

## Langkah 1 — Siapkan VPS

Login ke VPS: `ssh root@IP-VPS`

**1a. Update sistem**
```bash
sudo apt update && sudo apt upgrade -y
```

**1b. Buat swap 2 GB (WAJIB untuk RAM 1 GB)**
Mencegah build/aplikasi mati saat RAM penuh.
```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf && sudo sysctl vm.swappiness=10
free -h     # pastikan baris "Swap" muncul ~2.0Gi
```

**1c. Install Docker + Compose**
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER     # agar `docker` tanpa sudo (logout-login setelah ini)
docker --version && docker compose version
```

**1d. Firewall (buka SSH + web)**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## Langkah 2 — Arahkan DNS

Di panel DNS domain Anda, buat record ke **IP VPS** (ganti `domainanda.com`):

| Tipe | Nama | Nilai |
|---|---|---|
| A | `@`   | `IP-VPS` |
| A | `*`   | `IP-VPS` |  ← wildcard, agar **semua subdomain toko** hidup

> **Custom domain merchant** (mis. `tokosaya.com`): merchant mengarahkan **CNAME**
> domain mereka ke `domainanda.com`. Caddy otomatis membuatkan sertifikatnya.

Tunggu DNS menyebar (cek: `ping domainanda.com` menunjuk ke IP VPS).

---

## Langkah 3 — Ambil kode & buat `.env`

```bash
git clone <URL-REPO-ANDA> mayweb && cd mayweb
cp .env.production.example .env
nano .env
```

Isi minimal **4 baris** ini:
```env
NEXT_PUBLIC_ROOT_DOMAIN="domainanda.com"
AUTH_SECRET="<hasil: npx auth secret, atau: openssl rand -base64 32>"
DB_PASSWORD="<password-kuat>"
ACME_EMAIL="email-anda@contoh.com"
```
Buat AUTH_SECRET cepat di VPS: `openssl rand -base64 32`

---

## Langkah 4 — Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Yang terjadi otomatis: build image → tunggu DB siap → **jalankan migrasi** → start app + Caddy.

> ⏳ Di 1 GB RAM, build bisa **5–15 menit** (memakai swap). Sabar — ini sekali per deploy.
> Pantau: `docker compose -f docker-compose.prod.yml logs -f`

**Isi data awal (sekali saja):**
```bash
docker compose -f docker-compose.prod.yml run --rm migrate npm run db:seed
```

---

## Langkah 5 — Verifikasi

Buka `https://domainanda.com` (sertifikat HTTPS muncul otomatis dalam beberapa detik
saat pertama diakses). Toko: `https://toko-demo.domainanda.com`.

Login awal (dari seed) — **segera ganti password** setelah masuk:
- Super Admin: `admin@tokopintar.id` / `superadmin123`
- Merchant: `owner@tokodemo.id` / `merchant123`

---

## Operasional sehari-hari

```bash
# Lihat status & log
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app

# Update setelah ada perubahan kode
git pull
docker compose -f docker-compose.prod.yml up -d --build   # migrasi ikut jalan otomatis

# Stop / start
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

**Backup database (termasuk semua gambar — karena tersimpan di DB):**
```bash
docker compose -f docker-compose.prod.yml exec db \
  sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" tokopintar' > backup-$(date +%F).sql
```

**Restore:**
```bash
cat backup-2026-06-30.sql | docker compose -f docker-compose.prod.yml exec -T db \
  sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" tokopintar'
```

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| Build mati / "killed" / OOM | RAM habis. Pastikan swap aktif (`free -h`). Bila tetap, naikkan swap ke 3–4 GB, atau pakai **Cara B (registry)** di bawah. |
| HTTPS belum muncul / error sertifikat | DNS belum mengarah ke VPS, atau port 80/443 ketutup firewall. Cek `dig domainanda.com` & `ufw status`. |
| Toko subdomain "not found" | Wildcard DNS `*` belum dibuat, atau tenant belum ada di DB. |
| `app` restart terus | Cek `logs app`. Biasanya `.env` salah (AUTH_SECRET kosong / DATABASE_URL). |
| DB tidak mau start | Disk penuh (`df -h`) atau volume korup. |

---

## (Opsional) Cara B — Build via registry (server tak ikut build)

Cocok bila VPS terlalu kecil untuk build. Build di laptop Anda (lebih kuat), lalu server
tinggal menarik image.

**Di laptop:**
```bash
docker build -t ghcr.io/USER/mayweb:latest --build-arg NEXT_PUBLIC_ROOT_DOMAIN=domainanda.com .
docker push ghcr.io/USER/mayweb:latest
```

**Di VPS:** ganti blok `build:` pada service `app` (dan `migrate`) di
`docker-compose.prod.yml` menjadi:
```yaml
    image: ghcr.io/USER/mayweb:latest
```
lalu:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```
