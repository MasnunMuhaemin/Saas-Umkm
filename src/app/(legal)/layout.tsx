import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-lg text-slate-900">
            May<span className="text-brand-600">Web</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={15} /> Beranda
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="bg-white rounded-2xl border border-slate-100 p-8 space-y-4 text-sm leading-relaxed text-slate-600 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-brand-600 [&_a]:underline">
          {children}
        </article>
      </main>
      <footer className="max-w-3xl mx-auto px-6 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} MayWeb · Platform toko online UMKM Indonesia
      </footer>
    </div>
  );
}
