import {
  Ban,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  Users,
} from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { formatRupiah } from "@/lib/helpers/format";

export default async function AdminDashboard() {
  const api = await getServerTrpc();
  const s = await api.superadmin.dashboard.stats();

  const cards = [
    { label: "Total Tenant", value: String(s.totalTenants), icon: Users, tint: "bg-brand-600" },
    { label: "Tenant Aktif", value: String(s.active), icon: CheckCircle, tint: "bg-brand-600" },
    { label: "Trial", value: String(s.trial), icon: Clock, tint: "bg-brand-600" },
    { label: "Suspended", value: String(s.suspended), icon: Ban, tint: "bg-brand-600" },
    { label: "Total Produk", value: String(s.totalProducts), icon: Package, tint: "bg-brand-600" },
    { label: "Est. MRR", value: formatRupiah(s.mrr), icon: CreditCard, tint: "bg-brand-600" },
  ];

  const maxPlan = Math.max(1, ...s.planDist.map((p) => p.count));

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Dashboard Platform
        </h2>
        <p className="text-sm text-slate-500">Ringkasan seluruh tenant MayWeb</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, tint }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 hover:shadow-card transition-shadow"
          >
            <div
              className={`w-11 h-11 rounded-xl ${tint} flex items-center justify-center mb-4 shadow-soft`}
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 max-w-lg">
        <h3 className="font-display font-bold text-slate-900 text-lg mb-5">
          Distribusi Paket
        </h3>
        <div className="space-y-4">
          {s.planDist.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-16 text-sm font-semibold text-slate-700">
                {p.name}
              </span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${(p.count / maxPlan) * 100}%` }}
                />
              </div>
              <span className="font-display text-sm font-bold text-slate-900 w-8 text-right">
                {p.count}
              </span>
            </div>
          ))}
          {s.planDist.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada tenant.</p>
          )}
        </div>
      </div>
    </div>
  );
}
