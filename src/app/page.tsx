import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Monitor,
  ShoppingBag,
  Store,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Website Toko Instan",
    desc: "Miliki website toko online profesional dengan domain sendiri tanpa perlu coding.",
  },
  {
    icon: Monitor,
    title: "Kasir Pintar (POS)",
    desc: "Proses transaksi lebih cepat dengan sistem kasir yang terintegrasi stok secara real-time.",
  },
  {
    icon: ShoppingBag,
    title: "Manajemen Produk",
    desc: "Kelola ratusan produk, kategori, dan varian harga dengan antarmuka yang sangat mudah.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-800">
              MayWeb
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8">
            <Zap size={16} className="text-amber-500" />
            Platform SaaS UMKM #1 di Indonesia
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]">
            Kembangkan Bisnis <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Tanpa Batas
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Satu platform untuk semua kebutuhan toko Anda. Kelola produk, kasir
            (POS), invoice, hingga buat website profesional dalam hitungan menit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Mulai Sekarang Gratis <ArrowRight size={20} />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Fitur Lengkap untuk UMKM
            </h2>
            <p className="text-gray-500 text-lg">
              Semua yang Anda butuhkan untuk berjualan online dan offline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Store size={20} className="text-gray-400" />
            <span className="font-bold text-gray-600 tracking-tight">
              MayWeb
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} MayWeb. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
