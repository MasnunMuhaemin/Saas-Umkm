import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  Users,
  X,
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
    tagline: "Untuk mulai jualan online",
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
    tagline: "Untuk bisnis yang bertumbuh",
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

const MARQUEE = [
  "Kuliner",
  "Fashion",
  "Kerajinan Tangan",
  "Kopi & Minuman",
  "Toko Kelontong",
  "Jasa & Layanan",
  "Skincare & Kosmetik",
  "Aksesoris",
];

const COMPARE = {
  before: [
    "Pesanan tercecer di chat & catatan",
    "Hitung manual, rawan salah kembalian",
    "Stok tidak terpantau, sering kehabisan",
    "Belum punya etalase online profesional",
  ],
  after: [
    "Semua pesanan rapi masuk ke WhatsApp",
    "Kasir otomatis menghitung kembalian",
    "Stok berkurang otomatis tiap penjualan",
    "Website toko sendiri dalam 5 menit",
  ],
};

const FAQS = [
  {
    q: "Apakah saya perlu bisa coding?",
    a: "Tidak sama sekali. Semua diatur lewat dashboard yang sederhana — tinggal isi nama toko, unggah produk, dan toko Anda langsung online.",
  },
  {
    q: "Bagaimana pelanggan memesan?",
    a: "Pelanggan memilih produk di website toko Anda, lalu pesanannya langsung diteruskan ke WhatsApp Anda. Tanpa ribet checkout atau pembayaran online.",
  },
  {
    q: "Apakah ada biaya tersembunyi?",
    a: "Tidak ada. Harga yang tertera adalah yang Anda bayar. Anda bisa naik ke paket Plus kapan saja saat bisnis bertumbuh.",
  },
  {
    q: "Bisakah memakai domain sendiri?",
    a: "Bisa. Selain subdomain gratis, Anda dapat menghubungkan domain milik sendiri (mis. tokosaya.com) di pengaturan toko.",
  },
];

const container = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
const sectionPad = "py-[clamp(4rem,8vw,7rem)]";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-azure px-[1.375rem] py-2.5 text-[0.9375rem] font-medium text-white transition-all duration-200 hover:bg-azure-dark hover:-translate-y-px hover:shadow-[0_8px_24px_-6px_rgba(0,158,245,0.5)]";
const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-neutral-200 px-[1.375rem] py-2.5 text-[0.9375rem] font-medium text-[#0a0a0a] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50";

export default async function LandingPage() {
  const api = await getServerTrpc();
  const plans = await api.plans();
  const priceBySlug: Record<string, number> = Object.fromEntries(
    plans.map((p) => [p.slug, p.price]),
  );

  return (
    <div className="lp min-h-screen bg-white font-sans text-neutral-800">
      {/* ===== Navigation ===== */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className={`${container} flex h-full items-center justify-between`}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#0a0a0a]">
              <Store size={16} className="text-white" />
            </div>
            <span className="text-[1.0625rem] font-[650] tracking-[-0.02em] text-[#0a0a0a]">
              MayWeb
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#fitur"
              className="lp-navlink text-sm font-medium text-neutral-500 transition-colors hover:text-[#0a0a0a]"
            >
              Fitur
            </a>
            <a
              href="#harga"
              className="lp-navlink text-sm font-medium text-neutral-500 transition-colors hover:text-[#0a0a0a]"
            >
              Harga
            </a>
            <a
              href="#faq"
              className="lp-navlink text-sm font-medium text-neutral-500 transition-colors hover:text-[#0a0a0a]"
            >
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-[#0a0a0a]"
            >
              Masuk
            </Link>
            <Link href="/register" className={`${btnPrimary} !py-2 !text-sm`}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <div className="mx-auto max-w-[760px] text-center">
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-[0.8125rem] font-medium text-neutral-600"
            style={{ animationDelay: "0s" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-azure" />
            Platform toko online untuk UMKM Indonesia
          </span>
          <h1
            className="animate-fade-up mt-6 text-[clamp(2.25rem,5.5vw,4rem)] font-[750] leading-[1.08] tracking-[-0.035em] text-[#0a0a0a]"
            style={{ animationDelay: "0.1s" }}
          >
            Jualan online jadi
            <br className="hidden sm:block" /> rapi &amp; profesional
          </h1>
          <p
            className="animate-fade-up mx-auto mt-6 max-w-[560px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-500"
            style={{ animationDelay: "0.2s" }}
          >
            Satu platform untuk produk, kasir, invoice, dan website toko Anda.
            Pesanan pelanggan langsung masuk ke WhatsApp — tanpa coding.
          </p>
          <div
            className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/register" className={`${btnPrimary} w-full sm:w-auto`}>
              Mulai Sekarang <ArrowRight size={17} />
            </Link>
            <a href="#fitur" className={`${btnOutline} w-full sm:w-auto`}>
              Lihat Fitur
            </a>
          </div>

          {/* Stats */}
          <div
            className="animate-fade-up mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-y-8 sm:grid-cols-4"
            style={{ animationDelay: "0.35s" }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="px-2">
                <p className="text-[1.75rem] font-[750] tracking-[-0.03em] text-[#0a0a0a]">
                  {s.value}
                </p>
                <p className="mt-1 text-[0.8125rem] text-neutral-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* App preview */}
        <div
          className="animate-fade-up mx-auto mt-16 max-w-[960px]"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="overflow-hidden rounded-[20px] border border-neutral-200 bg-white shadow-ds-xl">
            <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span className="ml-3 font-mono text-xs text-neutral-400">
                toko-anda.mayweb.id
              </span>
            </div>
            <div className="grid grid-cols-12 gap-4 p-5">
              <div className="col-span-3 hidden flex-col gap-1.5 sm:flex">
                {[Package, ShoppingBag, CreditCard, Users].map((Ic, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-xs font-medium ${
                      i === 0
                        ? "bg-[#0a0a0a] text-white"
                        : "text-neutral-400"
                    }`}
                  >
                    <Ic size={15} />
                    <span className="h-2 w-14 rounded-full bg-current opacity-25" />
                  </div>
                ))}
              </div>
              <div className="col-span-12 space-y-4 sm:col-span-9">
                <div className="grid grid-cols-3 gap-3">
                  {["Rp4,8jt", "128", "96%"].map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-100 p-4"
                    >
                      <div className="mb-3 h-8 w-8 rounded-[10px] bg-neutral-100" />
                      <p className="text-[1.05rem] font-[700] text-[#0a0a0a]">
                        {v}
                      </p>
                      <span className="mt-2 block h-2 w-12 rounded-full bg-neutral-100" />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-neutral-100 p-4">
                  <div className="flex h-28 items-end gap-2">
                    {[40, 65, 50, 80, 60, 92, 72].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t ${
                          i === 5 ? "bg-azure" : "bg-neutral-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Marquee ===== */}
      <section className="border-y border-neutral-100 py-10">
        <p className="mb-6 text-center text-[0.75rem] font-medium uppercase tracking-[0.04em] text-neutral-400">
          Cocok untuk semua jenis usaha
        </p>
        <div className="lp-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="lp-marquee-track flex w-max animate-marquee gap-3">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-medium text-neutral-600"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Benefits / Features ===== */}
      <section id="fitur" className={`${sectionPad}`}>
        <div className={container}>
          <div className="lp-reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[640px] text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.15] tracking-[-0.03em] text-[#0a0a0a]">
              Semua yang UMKM butuhkan
            </h2>
            <p className="mt-4 text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-500">
              Dari etalase online sampai kasir — dalam satu dashboard yang rapi.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="lp-reveal rounded-2xl border border-neutral-100 bg-white p-7 transition-all duration-[0.4s] hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-ds-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 text-neutral-600">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 text-[1rem] font-[650] tracking-[-0.01em] text-neutral-800">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[0.875rem] leading-[1.6] text-neutral-500">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Comparison ===== */}
      <section className={`bg-neutral-50 ${sectionPad}`}>
        <div className={container}>
          <div className="lp-reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[640px] text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.15] tracking-[-0.03em] text-[#0a0a0a]">
              Dari berantakan jadi teratur
            </h2>
            <p className="mt-4 text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-500">
              Lihat perbedaannya sebelum dan sesudah pakai MayWeb.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="lp-reveal rounded-2xl border border-neutral-200 bg-white p-7">
              <p className="mb-5 text-[0.8125rem] font-medium uppercase tracking-[0.04em] text-neutral-400">
                Tanpa MayWeb
              </p>
              <ul className="space-y-3.5">
                {COMPARE.before.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-[0.9375rem] text-neutral-500"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-50">
                      <X size={12} className="text-[#ef4444]" strokeWidth={3} />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-reveal rounded-2xl border-2 border-[#0a0a0a] bg-white p-7 shadow-ds-lg">
              <p className="mb-5 text-[0.8125rem] font-medium uppercase tracking-[0.04em] text-neutral-500">
                Dengan MayWeb
              </p>
              <ul className="space-y-3.5">
                {COMPARE.after.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-[0.9375rem] font-medium text-neutral-800"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-50">
                      <Check
                        size={12}
                        className="text-[#22c55e]"
                        strokeWidth={3}
                      />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="lp-reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[640px] text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.15] tracking-[-0.03em] text-[#0a0a0a]">
              Online hanya 3 langkah
            </h2>
            <p className="mt-4 text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-500">
              Tanpa instalasi, tanpa teknis. Toko Anda siap hari ini juga.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="lp-reveal rounded-2xl border border-neutral-100 bg-white p-7"
              >
                <span className="text-[2rem] font-[750] tracking-[-0.03em] text-neutral-300">
                  {s.n}
                </span>
                <h3 className="mt-3 text-[1.0625rem] font-[650] text-neutral-800">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[0.875rem] leading-[1.6] text-neutral-500">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="harga" className={`bg-neutral-50 ${sectionPad}`}>
        <div className={container}>
          <div className="lp-reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[640px] text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.15] tracking-[-0.03em] text-[#0a0a0a]">
              Harga transparan, tanpa kejutan
            </h2>
            <p className="mt-4 text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-500">
              Pilih paket sesuai kebutuhan. Naik ke Plus kapan saja.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`lp-reveal relative flex flex-col rounded-[20px] bg-white p-8 ${
                  p.highlighted
                    ? "border-2 border-[#0a0a0a] shadow-ds-lg"
                    : "border border-neutral-200"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0a0a0a] px-3.5 py-1 text-xs font-medium text-white">
                    Paling Populer
                  </span>
                )}
                <h3 className="text-[1.0625rem] font-[650] text-neutral-800">
                  {p.name}
                </h3>
                <p className="mt-0.5 text-[0.8125rem] text-neutral-400">
                  {p.tagline}
                </p>
                <div className="mt-5 flex items-end gap-1.5">
                  <span className="text-[clamp(1.75rem,3vw,2.25rem)] font-[750] tracking-[-0.03em] text-[#0a0a0a]">
                    {formatRupiah(priceBySlug[p.slug] ?? 0)}
                  </span>
                  <span className="mb-1.5 text-sm text-neutral-400">
                    / bulan
                  </span>
                </div>
                <ul className="mt-6 mb-8 space-y-3">
                  {p.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-[0.875rem] text-neutral-600"
                    >
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="flex-none text-azure"
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${p.slug}`}
                  className={`mt-auto w-full ${
                    p.highlighted ? btnPrimary : btnOutline
                  }`}
                >
                  Pilih {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className={sectionPad}>
        <div className={`${container} max-w-[760px]`}>
          <div className="lp-reveal mb-[clamp(2.5rem,5vw,4rem)] text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-[700] leading-[1.15] tracking-[-0.03em] text-[#0a0a0a]">
              Pertanyaan umum
            </h2>
          </div>
          <div className="lp-reveal">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="lp-faq group border-b border-neutral-100"
              >
                <summary className="flex items-center justify-between gap-4 py-5 text-[1rem] font-[600] text-neutral-800">
                  {f.q}
                  <ChevronDown
                    size={18}
                    className="lp-chevron flex-none text-neutral-400 transition-transform duration-300"
                  />
                </summary>
                <p className="pb-5 text-[0.9375rem] leading-[1.7] text-neutral-500">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA (dark) ===== */}
      <section className="px-5 pb-[clamp(4rem,8vw,7rem)] sm:px-8">
        <div className="mx-auto max-w-[1100px] rounded-[24px] bg-[#0a0a0a] px-6 py-[clamp(3rem,6vw,5rem)] text-center">
          <h2 className="mx-auto max-w-[640px] text-[clamp(1.75rem,4vw,2.75rem)] font-[750] leading-[1.12] tracking-[-0.03em] text-white">
            Siap kembangkan bisnis Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] leading-[1.65] text-neutral-400">
            Bergabung dengan UMKM yang berjualan lebih cerdas bersama MayWeb.
            Mulai hari ini, gratis.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-azure px-6 py-3 text-[0.9375rem] font-medium text-white transition-all duration-200 hover:bg-azure-dark hover:-translate-y-px hover:shadow-[0_8px_32px_-4px_rgba(0,158,245,0.5)] sm:w-auto"
            >
              Buat Toko Sekarang <ArrowRight size={17} />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[0.9375rem] font-medium text-white transition-colors hover:bg-white/5 sm:w-auto"
            >
              Sudah punya akun?
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-neutral-100 py-10">
        <div
          className={`${container} flex flex-col items-center justify-between gap-5 md:flex-row`}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a0a0a]">
              <Store size={14} className="text-white" />
            </div>
            <span className="font-[650] text-neutral-700">MayWeb</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/syarat-ketentuan"
              className="text-neutral-500 transition-colors hover:text-[#0a0a0a]"
            >
              Syarat &amp; Ketentuan
            </Link>
            <Link
              href="/kebijakan-privasi"
              className="text-neutral-500 transition-colors hover:text-[#0a0a0a]"
            >
              Kebijakan Privasi
            </Link>
          </div>
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} MayWeb · Untuk UMKM Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
