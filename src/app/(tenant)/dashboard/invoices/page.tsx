import Link from "next/link";
import { FileText } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { PlanUpgradeNotice } from "@/components/shared/upgrade-notice";
import { formatRupiah, formatDate } from "@/lib/helpers/format";

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
    <div className="p-6">
      <div className="mb-5">
        <h2 className="font-bold text-gray-900">Riwayat Invoice</h2>
        <p className="text-sm text-gray-500">{invoices.length} transaksi</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <FileText size={40} className="mb-3 opacity-20" />
            <p className="font-medium text-gray-500">Belum ada transaksi</p>
            <p className="text-xs mt-1">
              Catat penjualan lewat menu <strong>Kasir (POS)</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                  {["No. Invoice", "Tanggal", "Pelanggan", "Item", "Bayar", "Total", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {inv.orderNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {inv.customer?.name ?? "Umum"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {inv._count.items}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-600">
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
                    <td className="px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatRupiah(inv.total)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-sm text-brand-600 font-semibold hover:underline"
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
