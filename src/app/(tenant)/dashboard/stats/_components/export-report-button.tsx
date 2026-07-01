"use client";

import { Download } from "lucide-react";

type Stats = {
  revenue: number;
  txCount: number;
  itemsSold: number;
  avg: number;
  series: { label: string; pendapatan: number }[];
  topProducts: { name: string; sold: number }[];
  payments: { method: string; count: number; total: number }[];
};

function cell(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ExportReportButton({ stats }: { stats: Stats }) {
  const download = () => {
    const now = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });
    const L: string[] = [];
    L.push("Laporan Penjualan - MayWeb");
    L.push(`Diunduh,${cell(now)}`);
    L.push("");
    L.push("RINGKASAN");
    L.push(`Total Pendapatan,${stats.revenue}`);
    L.push(`Total Transaksi,${stats.txCount}`);
    L.push(`Produk Terjual,${stats.itemsSold}`);
    L.push(`Rata-rata per Transaksi,${stats.avg}`);
    L.push("");
    L.push("PENDAPATAN PER BULAN");
    L.push("Bulan,Pendapatan");
    stats.series.forEach((r) => L.push(`${cell(r.label)},${r.pendapatan}`));
    L.push("");
    L.push("PRODUK TERLARIS");
    L.push("Produk,Jumlah Terjual");
    stats.topProducts.forEach((p) => L.push(`${cell(p.name)},${p.sold}`));
    L.push("");
    L.push("METODE PEMBAYARAN");
    L.push("Metode,Jumlah Transaksi,Total");
    stats.payments.forEach((p) =>
      L.push(`${cell(p.method)},${p.count},${p.total}`),
    );

    // BOM (﻿) agar Excel membaca UTF-8 dengan benar.
    const csv = "﻿" + L.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Download size={15} /> Export Laporan
    </button>
  );
}
