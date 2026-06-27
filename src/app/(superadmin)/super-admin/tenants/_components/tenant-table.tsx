"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, CheckCircle, ExternalLink, Loader2, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/helpers/format";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminTenantRow } from "@/server/services/superadmin/tenant.service";

type TenantRow = AdminTenantRow;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

function CreateTenantModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    planSlug: "basic" as "basic" | "plus",
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const create = trpc.superadmin.tenant.create.useMutation({
    onSuccess: () => {
      toast.success("Tenant berhasil dibuat");
      router.refresh();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const fields = [
    { k: "name", label: "Nama Toko *", ph: "Toko Berkah" },
    { k: "slug", label: "Subdomain *", ph: "toko-berkah" },
    { k: "ownerName", label: "Nama Pemilik *", ph: "Andi" },
    { k: "ownerEmail", label: "Email Login *", ph: "andi@email.com" },
  ] as const;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Buat Tenant Baru</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.k}>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {f.label}
              </label>
              <input
                value={form[f.k]}
                onChange={(e) => set(f.k, e.target.value)}
                placeholder={f.ph}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="min. 6 karakter"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Paket
              </label>
              <select
                value={form.planSlug}
                onChange={(e) => set("planSlug", e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none"
              >
                <option value="basic">Basic</option>
                <option value="plus">Plus</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={create.isPending}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => create.mutate(form)}
            disabled={create.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {create.isPending && <Loader2 size={16} className="animate-spin" />}
            {create.isPending ? "Membuat..." : "Buat Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenantTable({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const setStatus = trpc.superadmin.tenant.setStatus.useMutation({
    onSuccess: () => {
      toast.success("Status tenant diperbarui");
      setPendingId(null);
      router.refresh();
    },
    onError: (e) => {
      toast.error(e.message);
      setPendingId(null);
    },
  });

  const toggle = (t: TenantRow) => {
    const next = t.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setPendingId(t.id);
    setStatus.mutate({ id: t.id, status: next });
  };

  return (
    <div className="p-6">
      {createOpen && <CreateTenantModal onClose={() => setCreateOpen(false)} />}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-slate-900">Manajemen Tenant</h2>
          <p className="text-sm text-slate-500">
            {tenants.length} tenant terdaftar
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Buat Tenant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 bg-slate-50/50">
                {["Tenant", "Pemilik", "Paket", "Status", "Dibuat", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map((t) => {
                const isSuspended = t.status === "SUSPENDED";
                const busy = pendingId === t.id && setStatus.isPending;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {t.name}
                      </div>
                      <a
                        href={`https://${t.slug}.${ROOT_DOMAIN}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {t.slug}.{ROOT_DOMAIN} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      <div>{t.user.name}</div>
                      <div className="text-xs text-slate-400">{t.user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {t.plan.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={t.status} variant="tenant" />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggle(t)}
                        disabled={busy}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                          isSuspended
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {busy ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : isSuspended ? (
                          <CheckCircle size={13} />
                        ) : (
                          <Ban size={13} />
                        )}
                        {isSuspended ? "Aktifkan" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-slate-400"
                  >
                    Belum ada tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
