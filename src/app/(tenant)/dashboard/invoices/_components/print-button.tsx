"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all"
    >
      <Printer size={16} /> Cetak
    </button>
  );
}
