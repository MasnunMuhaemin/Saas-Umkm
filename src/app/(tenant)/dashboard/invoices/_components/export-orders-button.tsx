"use client";

import Papa from "papaparse";
import { Download } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  ewallet: "E-Wallet",
};

export function ExportOrdersButton() {
  const utils = trpc.useUtils();

  async function handleExport() {
    const rows = await utils.order.exportRows.fetch();
    const csv = Papa.unparse(
      rows.map((r) => ({
        "No. Invoice": r.orderNumber,
        Tanggal: r.date,
        Pelanggan: r.customer,
        Total: r.total,
        "Metode Bayar": PAYMENT_LABEL[r.paymentMethod] ?? r.paymentMethod,
        "Status Bayar": r.paymentStatus === "PAID" ? "Lunas" : "Belum",
        Status: r.status,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "riwayat-order.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
    >
      <Download size={15} /> Export
    </button>
  );
}
