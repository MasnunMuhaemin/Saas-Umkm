import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Circle,
  DollarSign,
  ExternalLink,
  FileText,
  Package,
  ShoppingCart,
} from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";
import { RevenueChart } from "./_components/revenue-chart";

export default async function DashboardHome() {
  const api = await getServerTrpc();
  const [data, setup] = await Promise.all([
    api.dashboard.overview(),
    api.dashboard.setupStatus(),
  ]);
  const { stats, salesSeries, topProducts, recentOrders, storeUrl } = data;

  const cards = [
    {
      label: "Total Produk",
      value: String(stats.activeProducts),
      sub: "Aktif saat ini",
      icon: Package,
      tint: "from-brand-500 to-indigo-600",
    },
    {
      label: "Pesanan (Bulan Ini)",
      value: String(stats.ordersThisMonth),
      sub: stats.ordersThisMonth > 0 ? "Bulan berjalan" : "Belum ada pesanan",
      icon: ShoppingCart,
      tint: "from-emerald-500 to-green-600",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: formatRupiah(stats.revenueThisMonth),
      sub: "Bulan berjalan",
      icon: DollarSign,
      tint: "from-amber-500 to-orange-600",
    },
    {
      label: "Rata-rata Transaksi",
      value: formatRupiah(stats.avgTransaction),
      sub: "Bulan ini",
      icon: BarChart2,
      tint: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
          Ringkasan Bisnis
        </h2>
        <Link
          href="/dashboard/products"
          className="px-5 py-2.5 bg-linear-to-r from-brand-600 to-violet-600 text-white rounded-xl text-sm font-bold hover:shadow-glow transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <Package size={15} /> Tambah Produk
        </Link>
      </div>

      {/* Onboarding — kelengkapan setup toko */}
      {setup.percent < 100 && (
        <div className="relative overflow-hidden bg-linear-to-br from-brand-600 via-violet-600 to-pink-500 rounded-2xl p-6 text-white shadow-float">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">Lengkapi Toko Anda</h3>
              <p className="text-white/80 text-sm">
                Selesaikan langkah berikut agar toko siap tampil maksimal.
              </p>
            </div>
            <span className="font-display text-2xl font-extrabold">{setup.percent}%</span>
          </div>
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${setup.percent}%` }}
            />
          </div>
          <div className="relative grid sm:grid-cols-2 gap-2">
            {setup.steps.map((s) =>
              s.done ? (
                <div
                  key={s.label}
                  className="flex items-center gap-2 text-sm text-white/70 bg-white/10 rounded-xl px-3 py-2.5"
                >
                  <CheckCircle2 size={16} /> <span className="line-through">{s.label}</span>
                </div>
              ) : (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-2 text-sm font-semibold bg-white/15 hover:bg-white/25 rounded-xl px-3 py-2.5 transition-colors"
                >
                  <Circle size={16} />
                  <span className="flex-1">{s.label}</span>
                  <ArrowRight size={15} />
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, tint }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl bg-linear-to-br ${tint} flex items-center justify-center shadow-soft`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">
                {sub}
              </span>
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart + store card */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <div className="mb-5">
            <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">Grafik Pendapatan</h3>
            <p className="text-sm text-slate-500">7 hari terakhir</p>
          </div>
          <RevenueChart data={salesSeries} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 flex flex-col">
          <h3 className="font-display font-bold text-slate-900 mb-1 text-lg tracking-tight">
            Toko Online Anda
          </h3>
          <p className="text-sm text-slate-500 mb-4">Sistem berjalan dengan baik</p>
          <div className="bg-linear-to-br from-brand-50 to-violet-50 border border-brand-100 rounded-xl p-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-bold text-brand-900 truncate pr-2"
                title={storeUrl}
              >
                {storeUrl}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wide uppercase shadow-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online
              </span>
            </div>
            <p className="text-xs text-brand-600/80 font-medium mb-4">
              Pelanggan bisa belanja dari link ini 24/7
            </p>
            <a
              href={`https://${storeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-sm text-brand-600 border border-brand-200 py-2.5 rounded-xl font-bold hover:bg-linear-to-r hover:from-brand-600 hover:to-violet-600 hover:text-white hover:border-transparent transition-all shadow-soft flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} /> Buka Halaman Web Toko
            </a>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h3 className="font-display font-bold text-slate-900 mb-5 text-lg tracking-tight">
            Produk Paling Laris
          </h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-soft">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {p.name}
                  </p>
                </div>
                <div className="text-right flex-none">
                  <p className="font-display font-bold text-slate-900 text-sm">{p.sold}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    Terjual
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center py-6 text-slate-500 text-sm">
                Belum ada produk.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">Transaksi Terakhir</h3>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-brand-600 font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Belum ada pesanan terbaru. Gunakan menu{" "}
                <strong>Kasir (POS)</strong> untuk mencatat.
              </div>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-soft">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {o.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.date} • {o.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-brand-600 text-sm">
                      {formatRupiah(o.total)}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        o.paid
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {o.paid ? "Lunas" : "Belum"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
