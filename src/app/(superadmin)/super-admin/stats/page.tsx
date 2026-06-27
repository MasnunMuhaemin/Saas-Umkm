import { DollarSign, Eye, Package, ShoppingCart, Store } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";

export default async function GlobalStatsPage() {
  const api = await getServerTrpc();
  const s = await api.superadmin.dashboard.globalStats();

  const cards = [
    { label: "Total Produk", value: String(s.totalProducts), icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total Transaksi", value: String(s.totalOrders), icon: ShoppingCart, color: "bg-green-50 text-green-600" },
    { label: "Total Omzet Platform", value: formatRupiah(s.totalRevenue), icon: DollarSign, color: "bg-purple-50 text-purple-600" },
    { label: "Pageviews (7 hari)", value: String(s.pageviews7d), icon: Eye, color: "bg-amber-50 text-amber-600" },
  ];
  const maxProducts = Math.max(1, ...s.topTenants.map((t) => t.products));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Statistik Global
        </h2>
        <p className="text-sm text-slate-500">Agregat seluruh tenant platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}
            >
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {value}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 max-w-2xl">
        <h3 className="font-bold text-slate-900 text-lg mb-5">
          Tenant Teratas (produk terbanyak)
        </h3>
        {s.topTenants.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada tenant.</p>
        ) : (
          <div className="space-y-4">
            {s.topTenants.map((t, i) => (
              <div key={t.slug} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-none">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Store size={13} className="text-slate-400" />
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {t.name}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(t.products / maxProducts) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500 flex-none">
                  {t.products} produk · {t.orders} transaksi
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
