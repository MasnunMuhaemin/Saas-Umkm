import Link from "next/link";
import { FileText } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { PlanUpgradeNotice } from "@/components/shared/upgrade-notice";
import { formatRupiah, formatDate } from "@/lib/helpers/format";
import { ExportOrdersButton } from "./_components/export-orders-button";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  ewallet: "E-Wallet",
};

export default async function InvoicesPage() {
  const api = await getServerTrpc();
  let invoices;
  try {
    invoices = await api.order.list();
  } catch {
    return <PlanUpgradeNotice feature="Riwayat Invoice" />;
  }

  return (
    <div className="p-6 animate-fade-up">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold tracking-tight text-slate-900 text-xl">
            Riwayat Invoice
          </h2>
          <p className="text-sm text-slate-500">{invoices.length} transaksi</p>
        </div>
        {invoices.length > 0 && <ExportOrdersButton />}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-1">
              Catat penjualan lewat menu <strong>Kasir (POS)</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 bg-slate-50">
                  {["No. Invoice", "Tanggal", "Pelanggan", "Item", "Bayar", "Total", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {inv.orderNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {inv.customer?.name ?? "Umum"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {inv._count.items}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-600">
                        {PAYMENT_LABEL[inv.paymentMethod ?? ""] ?? "-"}
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.paymentStatus === "PAID"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {inv.paymentStatus === "PAID" ? "Lunas" : "Belum"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(inv.total)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-sm text-brand-600 font-semibold hover:text-brand-700 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
