import {
  BarChart2,
  DollarSign,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";
import { RevenueChart } from "../_components/revenue-chart";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  ewallet: "E-Wallet",
  lainnya: "Lainnya",
};

export default async function StatsPage() {
  const api = await getServerTrpc();
  const s = await api.dashboard.stats();

  const cards = [
    {
      label: "Total Pendapatan",
      value: formatRupiah(s.revenue),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Transaksi",
      value: String(s.txCount),
      icon: ShoppingCart,
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Produk Terjual",
      value: String(s.itemsSold),
      icon: Package,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Rata-rata / Transaksi",
      value: formatRupiah(s.avg),
      icon: BarChart2,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const maxSold = Math.max(1, ...s.topProducts.map((p) => p.sold));
  const totalPay = Math.max(1, s.payments.reduce((a, p) => a + p.total, 0));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Statistik Penjualan
        </h2>
        <p className="text-sm text-gray-500">
          Ringkasan performa toko Anda
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}
            >
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {value}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Pendapatan</h3>
          <p className="text-sm text-gray-500">6 bulan terakhir</p>
        </div>
        <RevenueChart data={s.series} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top produk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-lg mb-5">
            Produk Terlaris
          </h3>
          {s.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Belum ada penjualan.
            </p>
          ) : (
            <div className="space-y-4">
              {s.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-none">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate mb-1">
                      {p.name}
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(p.sold / maxSold) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-none">
                    {p.sold}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metode bayar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-lg mb-5">
            Metode Pembayaran
          </h3>
          {s.payments.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Belum ada transaksi.
            </p>
          ) : (
            <div className="space-y-4">
              {s.payments.map((p) => (
                <div key={p.method} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-none">
                    <Wallet size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {PAYMENT_LABEL[p.method] ?? p.method}
                      </span>
                      <span className="text-xs text-gray-500">
                        {p.count}× · {formatRupiah(p.total)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(p.total / totalPay) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
