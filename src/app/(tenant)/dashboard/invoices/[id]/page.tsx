import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah, formatDate } from "@/lib/helpers/format";
import { PrintButton } from "../_components/print-button";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  ewallet: "E-Wallet",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getServerTrpc();
  let inv;
  try {
    inv = await api.order.byId({ id });
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 print:hidden">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} /> Kembali ke Riwayat
        </Link>
        <PrintButton />
      </div>

      <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-6 print:border-0 print:shadow-none">
        <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4">
          <h1 className="font-black text-gray-900 text-lg">Struk Transaksi</h1>
          <p className="font-mono text-sm text-gray-600 mt-1">
            {inv.orderNumber}
          </p>
          <p className="text-xs text-gray-500">{formatDate(inv.createdAt)}</p>
        </div>

        {inv.customer && (
          <div className="text-sm mb-4">
            <p className="text-gray-500">Pelanggan</p>
            <p className="font-semibold text-gray-900">{inv.customer.name}</p>
            {inv.customer.phone && (
              <p className="text-xs text-gray-500">{inv.customer.phone}</p>
            )}
          </div>
        )}

        <div className="border-y border-dashed border-gray-200 py-3 space-y-2">
          {inv.items.map((it, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-gray-900">{it.productName}</p>
                <p className="text-xs text-gray-500">
                  {it.quantity} × {formatRupiah(it.price)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatRupiah(it.subtotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatRupiah(inv.subtotal)}</span>
          </div>
          {inv.discount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Diskon</span>
              <span>-{formatRupiah(inv.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
            <span>Total</span>
            <span>{formatRupiah(inv.total)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-sm">
          <span className="text-gray-500">Metode</span>
          <span className="font-semibold text-gray-900">
            {PAYMENT_LABEL[inv.paymentMethod ?? ""] ?? "-"} ·{" "}
            {inv.paymentStatus === "PAID" ? "Lunas" : "Belum"}
          </span>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Terima kasih · Dibuat dengan MayWeb
        </p>
      </div>
    </div>
  );
}
