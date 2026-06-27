"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { formatRupiah } from "@/lib/helpers/format";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type BillingInfo = RouterOutput["billing"]["getInfo"];

export function BillingPanel({ initial }: { initial: BillingInfo }) {
  const utils = trpc.useUtils();
  const { data } = trpc.billing.getInfo.useQuery(undefined, {
    initialData: initial,
  });
  const info = data ?? initial;
  const [coupon, setCoupon] = useState("");

  const pay = trpc.billing.createMyInvoice.useMutation({
    onSuccess: (res) => {
      toast.success(
        res.mock
          ? "Tagihan dibuat (mode demo). Pakai webhook untuk simulasi bayar."
          : "Tagihan dibuat. Silakan scan QR untuk membayar.",
      );
      utils.billing.getInfo.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: plans } = trpc.billing.plans.useQuery();
  const changePlan = trpc.billing.changePlan.useMutation({
    onSuccess: () => {
      toast.success("Paket diperbarui");
      utils.billing.getInfo.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const autoRenew = trpc.billing.setAutoRenew.useMutation({
    onSuccess: (_d, v) => {
      toast.success(
        v.autoRenew ? "Perpanjangan otomatis diaktifkan" : "Langganan dibatalkan",
      );
      utils.billing.getInfo.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h2 className="font-bold text-gray-900">Langganan</h2>
        <p className="text-sm text-gray-500">
          Kelola paket dan pembayaran toko Anda
        </p>
      </div>

      {/* Kartu paket */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Paket Aktif</p>
            <p className="text-2xl font-black text-gray-900">
              {info.planName}
            </p>
            <p className="text-sm text-gray-500">
              {formatRupiah(info.planPrice)} / bulan
            </p>
          </div>
          <StatusBadge status={info.status} variant="subscription" />
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
          <span className="text-gray-500">Aktif hingga</span>
          <span className="font-semibold text-gray-900">
            {info.currentEndLabel ?? "—"}
          </span>
        </div>

        {!info.pendingQr && (
          <div className="mt-5">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Kode kupon (opsional)"
              className="w-full mb-3 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <button
              onClick={() =>
                pay.mutate(coupon.trim() ? { couponCode: coupon.trim() } : undefined)
              }
              disabled={pay.isPending}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
            {pay.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CreditCard size={18} />
            )}
            {pay.isPending ? "Membuat tagihan..." : "Bayar / Perpanjang Langganan"}
            </button>
          </div>
        )}
      </div>

      {/* Perpanjangan otomatis / batal langganan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            Perpanjangan Otomatis
          </p>
          <p className="text-sm text-gray-500">
            {info.autoRenew
              ? "Langganan diperpanjang otomatis tiap periode."
              : `Dibatalkan — aktif hingga ${info.currentEndLabel ?? "akhir periode"}, tidak diperpanjang.`}
          </p>
        </div>
        <button
          onClick={() => autoRenew.mutate({ autoRenew: !info.autoRenew })}
          disabled={autoRenew.isPending}
          className={`flex-none text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 ${
            info.autoRenew
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          {info.autoRenew ? "Batalkan" : "Aktifkan Lagi"}
        </button>
      </div>

      {/* Ganti paket (upgrade/downgrade) */}
      {plans && plans.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-1">Ganti Paket</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upgrade atau downgrade kapan saja.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {plans.map((pl) => {
              const current = pl.slug === info.planSlug;
              return (
                <div
                  key={pl.slug}
                  className={`rounded-xl border p-4 ${
                    current
                      ? "border-brand-500 bg-brand-50/40"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-bold text-gray-900">{pl.name}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {formatRupiah(pl.price)}/bln
                  </p>
                  <button
                    disabled={current || changePlan.isPending}
                    onClick={() => changePlan.mutate({ planSlug: pl.slug })}
                    className="w-full text-sm font-bold py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default"
                  >
                    {current
                      ? "Paket Aktif"
                      : pl.price > info.planPrice
                        ? "Upgrade"
                        : "Pilih"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR pembayaran pending */}
      {info.pendingQr && info.pendingQr.paymentNumber && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-1">Selesaikan Pembayaran</h3>
          <p className="text-sm text-gray-500 mb-4">
            Scan QRIS dengan e-wallet / m-banking ·{" "}
            {formatRupiah(info.pendingQr.amount)}
          </p>
          <div className="inline-block bg-white p-4 rounded-xl border border-gray-200">
            <QRCodeSVG value={info.pendingQr.paymentNumber} size={220} />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Berlaku hingga {info.pendingQr.expiredLabel ?? "-"} · Order{" "}
            {info.pendingQr.orderId}
          </p>
        </div>
      )}

      {/* Riwayat pembayaran */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Riwayat Pembayaran</h3>
        </div>
        {info.payments.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            Belum ada pembayaran.
          </p>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-gray-50">
              {info.payments.map((p) => (
                <tr key={p.orderId}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    {p.orderId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {p.dateLabel}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatRupiah(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.status === "COMPLETED"
                          ? "badge-success"
                          : p.status === "PENDING"
                            ? "badge-warning"
                            : "badge-muted"
                      }`}
                    >
                      {p.status === "COMPLETED"
                        ? "Lunas"
                        : p.status === "PENDING"
                          ? "Menunggu"
                          : p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
