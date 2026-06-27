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
    <div className="p-6 max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display font-bold tracking-tight text-slate-900 text-xl">
          Langganan
        </h2>
        <p className="text-sm text-slate-500">
          Kelola paket dan pembayaran toko Anda
        </p>
      </div>

      {/* Kartu paket */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6">
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-300 mb-1">Paket Aktif</p>
              <p className="text-3xl font-display font-extrabold tracking-tight">
                {info.planName}
              </p>
              <p className="text-sm text-slate-300">
                {formatRupiah(info.planPrice)} / bulan
              </p>
            </div>
            <StatusBadge status={info.status} variant="subscription" />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
            <span className="text-slate-300">Aktif hingga</span>
            <span className="font-semibold text-white">
              {info.currentEndLabel ?? "—"}
            </span>
          </div>

          {!info.pendingQr && (
            <div className="mt-5">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Kode kupon (opsional)"
                className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white/15 focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all"
              />
              <button
                onClick={() =>
                  pay.mutate(coupon.trim() ? { couponCode: coupon.trim() } : undefined)
                }
                disabled={pay.isPending}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
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
      </div>

      {/* Perpanjangan otomatis / batal langganan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900 text-sm">
            Perpanjangan Otomatis
          </p>
          <p className="text-sm text-slate-500">
            {info.autoRenew
              ? "Langganan diperpanjang otomatis tiap periode."
              : `Dibatalkan — aktif hingga ${info.currentEndLabel ?? "akhir periode"}, tidak diperpanjang.`}
          </p>
        </div>
        <button
          onClick={() => autoRenew.mutate({ autoRenew: !info.autoRenew })}
          disabled={autoRenew.isPending}
          className={`flex-none text-sm font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
            info.autoRenew
              ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          {info.autoRenew ? "Batalkan" : "Aktifkan Lagi"}
        </button>
      </div>

      {/* Ganti paket (upgrade/downgrade) */}
      {plans && plans.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h3 className="font-display font-bold tracking-tight text-slate-900 mb-1">
            Ganti Paket
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Upgrade atau downgrade kapan saja.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {plans.map((pl) => {
              const current = pl.slug === info.planSlug;
              return (
                <div
                  key={pl.slug}
                  className={`rounded-2xl border p-4 transition-all ${
                    current
                      ? "border-brand-300 bg-brand-50 ring-1 ring-brand-100/70"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-soft"
                  }`}
                >
                  <p className="font-bold text-slate-900">{pl.name}</p>
                  <p className="font-display text-sm text-slate-500 mb-3">
                    {formatRupiah(pl.price)}/bln
                  </p>
                  <button
                    disabled={current || changePlan.isPending}
                    onClick={() => changePlan.mutate({ planSlug: pl.slug })}
                    className={`w-full text-sm font-bold py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-default ${
                      current
                        ? "bg-white border border-slate-200 text-slate-500"
                        : "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]"
                    }`}
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
        <div className="glass-card rounded-2xl p-6 text-center shadow-card">
          <h3 className="font-display font-bold tracking-tight text-slate-900 mb-1">
            Selesaikan Pembayaran
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Scan QRIS dengan e-wallet / m-banking ·{" "}
            <span className="font-display font-bold text-gradient">
              {formatRupiah(info.pendingQr.amount)}
            </span>
          </p>
          <div className="inline-block bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
            <QRCodeSVG value={info.pendingQr.paymentNumber} size={220} />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Berlaku hingga {info.pendingQr.expiredLabel ?? "-"} · Order{" "}
            {info.pendingQr.orderId}
          </p>
        </div>
      )}

      {/* Riwayat pembayaran */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-display font-bold tracking-tight text-slate-900">
            Riwayat Pembayaran
          </h3>
        </div>
        {info.payments.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">
            Belum ada pembayaran.
          </p>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              {info.payments.map((p) => (
                <tr key={p.orderId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-mono text-slate-600">
                    {p.orderId}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">
                    {p.dateLabel}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                    {formatRupiah(p.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
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
