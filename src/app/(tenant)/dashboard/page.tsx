import Link from "next/link";
import {
  BarChart2,
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
  const data = await api.dashboard.overview();
  const { stats, salesSeries, topProducts, recentOrders, storeUrl } = data;

  const cards = [
    {
      label: "Total Produk",
      value: String(stats.activeProducts),
      sub: "Aktif saat ini",
      icon: Package,
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Pesanan (Bulan Ini)",
      value: String(stats.ordersThisMonth),
      sub: stats.ordersThisMonth > 0 ? "Bulan berjalan" : "Belum ada pesanan",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: formatRupiah(stats.revenueThisMonth),
      sub: "Bulan berjalan",
      icon: DollarSign,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Rata-rata Transaksi",
      value: formatRupiah(stats.avgTransaction),
      sub: "Bulan ini",
      icon: BarChart2,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Ringkasan Bisnis
        </h2>
        <Link
          href="/dashboard/products"
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
        >
          + Tambah Produk
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}
              >
                <Icon size={18} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-50 text-gray-500">
                {sub}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {value}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart + store card */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-5">
            <h3 className="font-bold text-gray-900 text-lg">Grafik Pendapatan</h3>
            <p className="text-sm text-gray-500">7 hari terakhir</p>
          </div>
          <RevenueChart data={salesSeries} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-1 text-lg">
            Toko Online Anda
          </h3>
          <p className="text-sm text-gray-500 mb-4">Sistem berjalan dengan baik</p>
          <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-bold text-brand-900 truncate pr-2"
                title={storeUrl}
              >
                {storeUrl}
              </p>
              <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">
                Online
              </span>
            </div>
            <p className="text-xs text-brand-600/80 font-medium mb-4">
              Pelanggan bisa belanja dari link ini 24/7
            </p>
            <a
              href={`https://${storeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-sm text-brand-600 border border-brand-200 py-2.5 rounded-xl font-bold hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} /> Buka Halaman Web Toko
            </a>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-5 text-lg">
            Produk Paling Laris
          </h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {p.name}
                  </p>
                </div>
                <div className="text-right flex-none">
                  <p className="font-bold text-gray-900 text-sm">{p.sold}</p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                    Terjual
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center py-6 text-gray-500 text-sm">
                Belum ada produk.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-lg">Transaksi Terakhir</h3>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-brand-600 font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Belum ada pesanan terbaru. Gunakan menu{" "}
                <strong>Kasir (POS)</strong> untuk mencatat.
              </div>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {o.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {o.date} • {o.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600 text-sm">
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
