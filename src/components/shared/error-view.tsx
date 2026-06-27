"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

/** Tampilan error boundary reusable (dipakai error.tsx tiap area). */
export function ErrorView({
  reset,
  title = "Terjadi kesalahan",
  message = "Maaf, ada yang tidak beres. Coba muat ulang halaman ini.",
}: {
  reset?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} />
        </div>
        <h2 className="font-bold text-slate-900 text-lg mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        {reset && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={15} /> Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
