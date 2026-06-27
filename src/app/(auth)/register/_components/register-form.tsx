"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Store,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

const PLANS = [
  {
    slug: "basic" as const,
    name: "Basic",
    price: "Rp100.000",
    features: [
      "Website toko + subdomain",
      "Produk, kategori & varian",
      "Order via WhatsApp",
    ],
  },
  {
    slug: "plus" as const,
    name: "Plus",
    price: "Rp150.000",
    features: [
      "Semua fitur Basic",
      "Kasir (POS) & Invoice",
      "Basis data pelanggan",
      "Kuota produk lebih besar",
    ],
    popular: true,
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type Invoice = {
  orderId: string;
  amount: number;
  paymentNumber: string | null;
  mock: boolean;
  planName: string;
};

export function RegisterForm({
  defaultPlan,
}: {
  defaultPlan: "basic" | "plus";
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [planSlug, setPlanSlug] = useState<"basic" | "plus">(defaultPlan);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const register = trpc.auth.register.useMutation({
    onSuccess: async (res) => {
      // Auto login agar bisa langsung masuk dashboard.
      await signIn("credentials", { email, password, redirect: false });
      setInvoice({
        orderId: res.orderId,
        amount: res.amount,
        paymentNumber: res.paymentNumber,
        mock: res.mock,
        planName: res.planName,
      });
    },
    onError: (e) => toast.error(e.message),
  });

  const onName = (v: string) => {
    setName(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Nama toko wajib diisi";
    if (slug.length < 2) next.slug = "Subdomain minimal 2 karakter";
    else if (!/^[a-z0-9-]+$/.test(slug)) next.slug = "Hanya huruf kecil, angka, strip";
    if (!ownerName.trim()) next.ownerName = "Nama pemilik wajib diisi";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Email tidak valid";
    if (password.length < 6) next.password = "Password minimal 6 karakter";
    setErrs(next);
    if (Object.keys(next).length) return;

    register.mutate({
      name: name.trim(),
      slug,
      ownerName: ownerName.trim(),
      ownerEmail: email.trim(),
      password,
      planSlug,
    });
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all";
  const field = (k: string) =>
    `${inputCls} ${errs[k] ? "border-red-300 focus:ring-red-100" : ""}`;
  const err = (k: string) =>
    errs[k] ? <p className="text-xs text-red-500 mt-1">{errs[k]}</p> : null;

  // ===== Layar pembayaran (setelah daftar) =====
  if (invoice) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
            Akun berhasil dibuat
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Selesaikan pembayaran paket{" "}
            <span className="font-semibold text-slate-700">
              {invoice.planName}
            </span>{" "}
            untuk mengaktifkan toko.
          </p>

          {invoice.mock ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-4 rounded-xl mb-6 text-left">
              Mode demo: pembayaran belum dikonfigurasi (set{" "}
              <code className="font-mono">PAKASIR_API_KEY</code>). Tagihan{" "}
              <b>{formatRupiah(invoice.amount)}</b> dibuat dan menunggu
              pembayaran.
            </div>
          ) : (
            invoice.paymentNumber && (
              <div className="mb-6">
                <div className="inline-block bg-white p-4 rounded-xl border border-slate-200">
                  <QRCodeSVG value={invoice.paymentNumber} size={200} />
                </div>
                <p className="text-2xl font-display font-extrabold text-slate-900 mt-4">
                  {formatRupiah(invoice.amount)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Scan QRIS · Order {invoice.orderId}
                </p>
              </div>
            )
          )}

          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Masuk ke Dashboard <ArrowRight size={16} />
          </button>
          <p className="text-xs text-slate-400 mt-3">
            QR pembayaran juga tersedia di menu <b>Langganan</b>.
          </p>
        </div>
      </div>
    );
  }

  // ===== Form registrasi =====
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ---- Brand panel ---- */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-brand-600 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <Store size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            MayWeb
          </span>
        </Link>
        <div className="relative">
          <p className="text-brand-200 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Daftar sekarang
          </p>
          <h2 className="font-display text-3xl font-extrabold text-white leading-tight mb-6">
            Mulai jualan online
            <br /> hari ini.
          </h2>
          <ul className="space-y-3">
            {[
              "Toko online aktif dalam hitungan menit",
              "Pilih paket Basic atau Plus",
              "Order pelanggan langsung ke WhatsApp",
            ].map((h) => (
              <li key={h} className="flex items-center gap-3 text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-none">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-sm">{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-white/60 text-xs">
          &copy; {new Date().getFullYear()} MayWeb · Untuk UMKM Indonesia
        </p>
      </div>

      {/* ---- Form ---- */}
      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
              Buat Toko Anda
            </h1>
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                Masuk
              </Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Data toko & akun */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nama Toko
                </label>
                <input
                  value={name}
                  onChange={(e) => onName(e.target.value)}
                  placeholder="Toko Kue Bunda"
                  className={field("name")}
                />
                {err("name")}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Subdomain
                </label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="toko-kue-bunda"
                  className={field("slug")}
                />
                {err("slug") ?? (
                  <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                    {slug || "toko-anda"}.{ROOT}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nama Pemilik
                </label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama lengkap"
                  className={field("ownerName")}
                />
                {err("ownerName")}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={field("email")}
                />
                {err("email")}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={field("password")}
                />
                {err("password")}
              </div>
            </div>

            {/* Pilih paket */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Pilih Paket
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                  const active = planSlug === p.slug;
                  return (
                    <button
                      type="button"
                      key={p.slug}
                      onClick={() => setPlanSlug(p.slug)}
                      className={`relative text-left rounded-xl border p-4 transition-all ${
                        active
                          ? "border-brand-600 ring-2 ring-brand-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                          Populer
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            active
                              ? "border-brand-600 bg-brand-600"
                              : "border-slate-300"
                          }`}
                        >
                          {active && (
                            <Check
                              size={10}
                              strokeWidth={4}
                              className="text-white"
                            />
                          )}
                        </span>
                        <span className="font-display font-bold text-slate-900">
                          {p.name}
                        </span>
                      </div>
                      <p className="font-display text-xl font-extrabold text-slate-900 mb-2">
                        {p.price}
                        <span className="text-xs font-normal text-slate-400">
                          {" "}
                          / bulan
                        </span>
                      </p>
                      <ul className="space-y-1">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-1.5 text-xs text-slate-600"
                          >
                            <Check
                              size={13}
                              className="text-brand-600 flex-none"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {register.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {register.isPending
                ? "Membuat akun..."
                : "Daftar & Lanjut ke Pembayaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
