import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Website Toko Instan",
    desc: "Toko online profesional dengan subdomain sendiri — tampil cantik tanpa coding.",
    tint: "from-blue-500 to-indigo-600",
  },
  {
    icon: LayoutDashboard,
    title: "Kasir Pintar (POS)",
    desc: "Catat penjualan, hitung kembalian, dan kurangi stok otomatis dalam satu layar.",
    tint: "from-violet-500 to-purple-600",
  },
  {
    icon: ShoppingBag,
    title: "Manajemen Produk",
    desc: "Kelola produk, kategori, varian harga, dan galeri foto dengan mudah.",
    tint: "from-pink-500 to-rose-600",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp",
    desc: "Pelanggan pesan langsung ke WhatsApp Anda — tanpa ribet checkout online.",
    tint: "from-emerald-500 to-green-600",
  },
  {
    icon: CreditCard,
    title: "Invoice & Riwayat",
    desc: "Struk rapi, riwayat transaksi tersimpan, dan siap dicetak kapan saja.",
    tint: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Basis Data Pelanggan",
    desc: "Simpan data pelanggan setia dan pahami siapa pembeli terbaik Anda.",
    tint: "from-cyan-500 to-blue-600",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Daftar & Atur Toko",
    desc: "Buat akun, isi nama toko, logo, dan nomor WhatsApp dalam hitungan menit.",
  },
  {
    n: "02",
    title: "Tambah Produk",
    desc: "Unggah produk lengkap dengan foto, harga, dan varian. Langsung tampil di toko.",
  },
  {
    n: "03",
    title: "Mulai Berjualan",
    desc: "Bagikan link toko, terima pesanan via WhatsApp, dan kelola lewat kasir.",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "Rp100rb",
    period: "/ bulan",
    features: [
      "Website toko + subdomain",
      "Manajemen produk & kategori",
      "Order via WhatsApp",
      "Halaman tentang & kontak",
    ],
    highlighted: false,
  },
  {
    name: "Plus",
    price: "Rp150rb",
    period: "/ bulan",
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh text-slate-900 font-sans overflow-x-hidden">
      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/40">
        <div className="max-w-7xl mx-auto px-6 h-18 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-linear-to-br from-brand-600 via-violet-600 to-pink-500 rounded-xl flex items-center justify-center shadow-glow">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">
              May<span className="text-gradient">Web</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 hover:shadow-float transition-all active:scale-95 flex items-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] -z-10" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[760px] max-w-[92vw] h-[420px] bg-linear-to-tr from-brand-300/40 via-violet-300/30 to-pink-300/30 rounded-full blur-3xl -z-10 animate-float" />

        <div className="max-w-5xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/50 text-brand-700 text-sm font-semibold mb-7 shadow-soft">
            <Sparkles size={15} className="text-violet-500" />
            Platform toko online #1 untuk UMKM Indonesia
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-7 leading-[1.05]">
            Bangun Toko Online
            <br className="hidden md:block" />{" "}
            <span className="text-gradient">Kelas Dunia</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Satu platform untuk semua kebutuhan toko Anda — produk, kasir, invoice,
            hingga website profesional. Pesanan langsung masuk ke WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-brand-600 to-violet-600 text-white rounded-full font-bold text-base hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-8 py-4 glass border border-white/60 text-slate-800 rounded-full font-bold text-base hover:bg-white transition-all"
            >
              Lihat Fitur
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <ShieldCheck size={15} className="text-emerald-500" />
            Harga transparan · Toko langsung aktif
          </div>
        </div>

        {/* App preview mockup */}
        <div className="max-w-5xl mx-auto mt-16 animate-fade-up">
          <div className="glass-card rounded-3xl p-2.5 shadow-float">
            <div className="rounded-2xl bg-white/80 border border-white/60 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-mono">
                  toko-anda.tokopintar.id
                </span>
              </div>
              <div className="grid grid-cols-12 gap-4 p-5">
                <div className="col-span-3 hidden sm:flex flex-col gap-2">
                  {[Package, ShoppingBag, CreditCard, Users].map((Ic, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        i === 0
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-400"
                      }`}
                    >
                      <Ic size={15} /> <span className="h-2 w-14 bg-current/20 rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="col-span-12 sm:col-span-9 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { c: "from-brand-500 to-indigo-600", v: "Rp4,8jt" },
                      { c: "from-violet-500 to-purple-600", v: "128" },
                      { c: "from-pink-500 to-rose-600", v: "96%" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-100 p-4 bg-white"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-linear-to-br ${s.c} mb-3`}
                        />
                        <p className="font-display font-bold text-slate-900">
                          {s.v}
                        </p>
                        <span className="block h-2 w-12 bg-slate-100 rounded-full mt-2" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4 bg-white">
                    <div className="flex items-end gap-2 h-28">
                      {[40, 65, 50, 80, 60, 92, 72].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="flex-1 rounded-t-lg bg-linear-to-t from-brand-500 to-violet-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats band ===== */}
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto glass-card rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {STATS.map((s) => (
            <div key={s.label} className="text-center px-4 py-7">
              <p className="font-display text-2xl md:text-3xl font-extrabold text-gradient">
                {s.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="fitur" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 mb-3">
              Fitur Lengkap
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Semua yang UMKM butuhkan
            </h2>
            <p className="text-slate-500 text-lg">
              Dari etalase online sampai kasir — dalam satu dashboard yang rapi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group glass-card rounded-3xl p-7 hover:-translate-y-1.5 hover:shadow-float transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-linear-to-br ${f.tint} flex items-center justify-center mb-5 shadow-soft group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600 mb-3">
              Cara Kerja
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Online hanya 3 langkah
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative glass-card rounded-3xl p-8 overflow-hidden"
              >
                <span className="font-display text-7xl font-extrabold text-slate-100 absolute -top-2 right-3 select-none">
                  {s.n}
                </span>
                <div className="relative">
                  <h3 className="font-display text-xl font-bold mb-2">
                    {s.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-widest text-pink-600 mb-3">
              Harga
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Harga terjangkau, upgrade saat tumbuh
            </h2>
            <p className="text-slate-500 text-lg">
              Tanpa biaya tersembunyi. Naik ke Plus kapan saja.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 ${
                  p.highlighted
                    ? "bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-float"
                    : "glass-card"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute top-6 right-6 text-xs font-bold bg-linear-to-r from-brand-500 to-violet-500 text-white px-3 py-1 rounded-full">
                    Populer
                  </span>
                )}
                <h3 className="font-display text-lg font-bold mb-1">{p.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-display text-4xl font-extrabold">
                    {p.price}
                  </span>
                  <span
                    className={`text-sm mb-1.5 ${
                      p.highlighted ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-none ${
                          p.highlighted
                            ? "bg-brand-500/30 text-brand-200"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className={p.highlighted ? "" : "text-slate-600"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    p.highlighted
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Pilih {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA band ===== */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-600 via-violet-600 to-pink-500 px-8 py-16 text-center shadow-float">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <BarChart3 size={40} className="text-white/90 mx-auto mb-5" />
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              Siap kembangkan bisnis Anda?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Bergabung dengan UMKM yang sudah berjualan lebih cerdas bersama MayWeb.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:shadow-2xl transition-all active:scale-95"
            >
              Buat Toko Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-200/70 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
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
