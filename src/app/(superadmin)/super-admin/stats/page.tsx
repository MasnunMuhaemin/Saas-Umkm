import { DollarSign, Eye, Package, ShoppingCart, Store } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";

export default async function GlobalStatsPage() {
  const api = await getServerTrpc();
  const s = await api.superadmin.dashboard.globalStats();

  const cards = [
    { label: "Total Produk", value: String(s.totalProducts), icon: Package, tint: "from-brand-500 to-violet-600" },
    { label: "Total Transaksi", value: String(s.totalOrders), icon: ShoppingCart, tint: "from-emerald-500 to-green-600" },
    { label: "Total Omzet Platform", value: formatRupiah(s.totalRevenue), icon: DollarSign, tint: "from-pink-500 to-rose-600" },
    { label: "Pageviews (7 hari)", value: String(s.pageviews7d), icon: Eye, tint: "from-amber-500 to-orange-600" },
  ];
  const maxProducts = Math.max(1, ...s.topTenants.map((t) => t.products));

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Statistik Global
        </h2>
        <p className="text-sm text-slate-500">Agregat seluruh tenant platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, tint }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 hover:shadow-card transition-shadow"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-linear-to-br ${tint} flex items-center justify-center mb-4 shadow-soft`}
            >
              <Icon size={18} className="text-white" />
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 max-w-2xl">
        <h3 className="font-display font-bold text-slate-900 text-lg mb-5">
          Tenant Teratas (produk terbanyak)
        </h3>
        {s.topTenants.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada tenant.</p>
        ) : (
          <div className="space-y-4">
            {s.topTenants.map((t, i) => (
              <div key={t.slug} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs flex-none shadow-soft">
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
                      className="h-full bg-linear-to-r from-brand-500 to-violet-500 rounded-full"
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
