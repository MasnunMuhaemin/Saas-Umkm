import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-black text-brand-600">404</p>
        <h1 className="text-xl font-bold text-slate-900 mt-2 mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
        >
          <Home size={15} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
