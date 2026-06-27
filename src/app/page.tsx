import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";

const FEATURES = [
  {
    icon: Globe,
    title: "Website Toko Instan",
    desc: "Toko online profesional dengan subdomain sendiri — tampil rapi tanpa coding.",
  },
  {
    icon: LayoutDashboard,
    title: "Kasir Pintar (POS)",
    desc: "Catat penjualan, hitung kembalian, dan kurangi stok otomatis dalam satu layar.",
  },
  {
    icon: ShoppingBag,
    title: "Manajemen Produk",
    desc: "Kelola produk, kategori, varian harga, dan galeri foto dengan mudah.",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp",
    desc: "Pelanggan pesan langsung ke WhatsApp Anda — tanpa ribet checkout online.",
  },
  {
    icon: CreditCard,
    title: "Invoice & Riwayat",
    desc: "Struk rapi, riwayat transaksi tersimpan, dan siap dicetak kapan saja.",
  },
  {
    icon: Users,
    title: "Basis Data Pelanggan",
    desc: "Simpan data pelanggan setia dan pahami siapa pembeli terbaik Anda.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Daftar & atur toko",
    desc: "Buat akun, isi nama toko, logo, dan nomor WhatsApp dalam hitungan menit.",
  },
  {
    n: "02",
    title: "Tambah produk",
    desc: "Unggah produk lengkap dengan foto, harga, dan varian. Langsung tampil di toko.",
  },
  {
    n: "03",
    title: "Mulai berjualan",
    desc: "Bagikan link toko, terima pesanan via WhatsApp, dan kelola lewat kasir.",
  },
];

const PLANS = [
  {
    slug: "basic",
    name: "Basic",
    features: [
      "Website toko + subdomain",
      "Manajemen produk & kategori",
      "Order via WhatsApp",
      "Halaman tentang & kontak",
    ],
    highlighted: false,
  },
  {
    slug: "plus",
    name: "Plus",
    features: [
      "Semua fitur Basic",
      "Kasir Pintar (POS)",
      "Invoice & riwayat transaksi",
      "Basis data pelanggan",
      "Kuota produk lebih besar",
    ],
    highlighted: true,
  },
];

const STATS = [
  { value: "5 menit", label: "Toko siap online" },
  { value: "0", label: "Baris kode" },
  { value: "100%", label: "Order via WhatsApp" },
  { value: "24/7", label: "Toko selalu buka" },
];

export default async function LandingPage() {
  const api = await getServerTrpc();
  const plans = await api.plans();
  const priceBySlug: Record<string, number> = Object.fromEntries(
    plans.map((p) => [p.slug, p.price]),
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              MayWeb
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="pt-36 pb-20 px-6 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-5">
            Platform toko online UMKM Indonesia
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6">
            Jualan online jadi{" "}
            <span className="text-brand-600">rapi &amp; profesional</span>.
          </h1>
          <p className="text-lg text-slate-600 mb-9 max-w-xl mx-auto leading-relaxed">
            Satu platform untuk produk, kasir, invoice, dan website toko Anda.
            Pesanan pelanggan langsung masuk ke WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={17} />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-6 py-3 bg-white text-slate-800 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Lihat Fitur
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Harga transparan · Toko langsung aktif
          </p>
        </div>

        {/* App preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="ml-3 text-xs text-slate-400 font-mono">
                toko-anda.tokopintar.id
              </span>
            </div>
            <div className="grid grid-cols-12 gap-4 p-5">
              <div className="col-span-3 hidden sm:flex flex-col gap-1.5">
                {[Package, ShoppingBag, CreditCard, Users].map((Ic, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      i === 0
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-400"
                    }`}
                  >
                    <Ic size={15} />
                    <span className="h-2 w-14 bg-current opacity-20 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="col-span-12 sm:col-span-9 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["Rp4,8jt", "128", "96%"].map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="w-8 h-8 rounded-md bg-brand-100 mb-3" />
                      <p className="font-display font-bold text-slate-900">
                        {v}
                      </p>
                      <span className="block h-2 w-12 bg-slate-100 rounded-full mt-2" />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-end gap-2 h-28">
                    {[40, 65, 50, 80, 60, 92, 72].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="flex-1 rounded-t bg-brand-500"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="px-6 py-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4">
              <p className="font-display text-3xl font-extrabold text-slate-900">
                {s.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Semua yang UMKM butuhkan
            </h2>
            <p className="text-slate-600 text-lg">
              Dari etalase online sampai kasir — dalam satu dashboard yang rapi.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-200 p-6 hover:border-brand-300 transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                    <Icon size={21} className="text-brand-600" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-12">
            Online hanya 3 langkah
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-slate-200 bg-white p-7"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-600 text-white font-display font-bold mb-4">
                  {s.n}
                </span>
                <h3 className="font-display text-lg font-bold mb-1.5">
                  {s.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Harga terjangkau, upgrade saat tumbuh
            </h2>
            <p className="text-slate-600 text-lg">
              Tanpa biaya tersembunyi. Naik ke Plus kapan saja.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-xl p-7 ${
                  p.highlighted
                    ? "border-2 border-brand-600"
                    : "border border-slate-200"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-7 text-xs font-bold bg-brand-600 text-white px-3 py-1 rounded-full">
                    Populer
                  </span>
                )}
                <h3 className="font-display text-base font-bold text-slate-500 mb-1">
                  {p.name}
                </h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-display text-4xl font-extrabold text-slate-900">
                    {formatRupiah(priceBySlug[p.slug] ?? 0)}
                  </span>
                  <span className="text-sm text-slate-400 mb-1.5">/ bulan</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-sm text-slate-600"
                    >
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="text-brand-600 flex-none"
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${p.name.toLowerCase()}`}
                  className={`mt-auto block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    p.highlighted
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Pilih {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto rounded-2xl bg-brand-600 px-8 py-14 text-center">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">
            Siap kembangkan bisnis Anda?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Bergabung dengan UMKM yang berjualan lebih cerdas bersama MayWeb.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-brand-700 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
          >
            Buat Toko Sekarang <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Store size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-700">MayWeb</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/syarat-ketentuan"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Syarat &amp; Ketentuan
            </Link>
            <Link
              href="/kebijakan-privasi"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Kebijakan Privasi
            </Link>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} MayWeb · Untuk UMKM Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
