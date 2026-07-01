"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/routers/_app";

type Plan = inferRouterOutputs<AppRouter>["superadmin"]["plan"]["list"][number];

const FLAGS = [
  { key: "hasSeo", label: "Optimasi SEO" },
  { key: "hasPos", label: "Sistem Kasir (POS)" },
  { key: "hasInvoice", label: "Invoice & Riwayat" },
  { key: "hasCustomerDb", label: "Data Pelanggan" },
] as const;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors flex-none",
        on ? "bg-azure-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform",
          on && "translate-x-4",
        )}
      />
    </button>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const utils = trpc.useUtils();
  const [price, setPrice] = useState(String(plan.price));
  const [maxProducts, setMaxProducts] = useState(
    plan.maxProducts === null ? "" : String(plan.maxProducts),
  );
  const [flags, setFlags] = useState({
    hasSeo: plan.hasSeo,
    hasPos: plan.hasPos,
    hasInvoice: plan.hasInvoice,
    hasCustomerDb: plan.hasCustomerDb,
  });
  const [isActive, setIsActive] = useState(plan.isActive);

  const update = trpc.superadmin.plan.update.useMutation({
    onSuccess: () => {
      toast.success(`Paket ${plan.name} disimpan`);
      utils.superadmin.plan.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const save = () =>
    update.mutate({
      id: plan.id,
      data: {
        price: Number(price) || 0,
        maxProducts: maxProducts === "" ? null : Number(maxProducts) || 0,
        ...flags,
        isActive,
      },
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-lg">{plan.name}</h3>
          <p className="text-xs text-slate-500">
            {plan._count.tenants} tenant memakai paket ini
          </p>
        </div>
        <Toggle on={isActive} onToggle={() => setIsActive(!isActive)} />
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Harga / bulan (Rp)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Maks. Produk (kosong = unlimited)
          </label>
          <input
            type="number"
            value={maxProducts}
            onChange={(e) => setMaxProducts(e.target.value)}
            placeholder="unlimited"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {FLAGS.map((f) => (
          <div key={f.key} className="flex items-center justify-between">
            <span className="text-sm text-slate-700">{f.label}</span>
            <Toggle
              on={flags[f.key]}
              onToggle={() =>
                setFlags((s) => ({ ...s, [f.key]: !s[f.key] }))
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={update.isPending}
        className="btn-admin btn-admin-primary w-full"
      >
        {update.isPending && <Loader2 size={16} className="animate-spin" />}
        Simpan Paket
      </button>
    </div>
  );
}

export function PlanManager({ plans }: { plans: Plan[] }) {
  return (
    <div className="p-6 animate-fade-up">
      <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-5">Paket Langganan</h2>
      <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </div>
    </div>
  );
}
