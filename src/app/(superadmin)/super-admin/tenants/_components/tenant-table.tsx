"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
        className="bg-white rounded-2xl w-full max-w-md shadow-float animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-display text-lg font-bold text-slate-900">Buat Tenant Baru</h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all"
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Paket
              </label>
              <select
                value={form.planSlug}
                onChange={(e) => set("planSlug", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all"
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
            className="btn-admin btn-admin-outline flex-1"
          >
            Batal
          </button>
          <button
            onClick={() => create.mutate(form)}
            disabled={create.isPending}
            className="btn-admin btn-admin-primary flex-1"
          >
            {create.isPending && <Loader2 size={16} className="animate-spin" />}
            {create.isPending ? "Membuat..." : "Buat Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalInputCls =
  "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-azure-400 focus:ring-4 focus:ring-azure-100 transition-all";

function EditTenantModal({
  tenant,
  onClose,
}: {
  tenant: TenantRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: tenant.name,
    slug: tenant.slug,
    planSlug: (tenant.plan.name.toLowerCase() === "plus" ? "plus" : "basic") as
      | "basic"
      | "plus",
    status: tenant.status as "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const update = trpc.superadmin.tenant.update.useMutation({
    onSuccess: () => {
      toast.success("Tenant diperbarui");
      router.refresh();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-float animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Edit Tenant
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Nama Toko
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={modalInputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Subdomain
            </label>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className={modalInputCls}
            />
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {form.slug || "toko"}.{ROOT_DOMAIN}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Paket
              </label>
              <select
                value={form.planSlug}
                onChange={(e) =>
                  set("planSlug", e.target.value as "basic" | "plus")
                }
                className={modalInputCls}
              >
                <option value="basic">Basic</option>
                <option value="plus">Plus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  set(
                    "status",
                    e.target.value as
                      | "ACTIVE"
                      | "TRIAL"
                      | "SUSPENDED"
                      | "EXPIRED",
                  )
                }
                className={modalInputCls}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="TRIAL">Trial</option>
                <option value="SUSPENDED">Suspend</option>
                <option value="EXPIRED">Kedaluwarsa</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={update.isPending}
            className="btn-admin btn-admin-outline flex-1"
          >
            Batal
          </button>
          <button
            onClick={() => update.mutate({ id: tenant.id, ...form })}
            disabled={update.isPending}
            className="btn-admin btn-admin-primary flex-1"
          >
            {update.isPending && <Loader2 size={16} className="animate-spin" />}
            {update.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteTenantDialog({
  tenant,
  onClose,
}: {
  tenant: TenantRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const del = trpc.superadmin.tenant.delete.useMutation({
    onSuccess: () => {
      toast.success("Tenant dihapus");
      router.refresh();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-float animate-fade-up p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
          Hapus Tenant?
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          <b>{tenant.name}</b> beserta SEMUA datanya (produk, pesanan, pelanggan,
          langganan) dan akun pemiliknya akan dihapus <b>permanen</b>. Tindakan
          ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={del.isPending}
            className="btn-admin btn-admin-outline flex-1"
          >
            Batal
          </button>
          <button
            onClick={() => del.mutate({ id: tenant.id })}
            disabled={del.isPending}
            className="btn-admin btn-admin-danger flex-1"
          >
            {del.isPending && <Loader2 size={16} className="animate-spin" />}
            {del.isPending ? "Menghapus..." : "Hapus"}
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
  const [editTarget, setEditTarget] = useState<TenantRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantRow | null>(null);

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
    <div className="p-6 animate-fade-up">
      {createOpen && <CreateTenantModal onClose={() => setCreateOpen(false)} />}
      {editTarget && (
        <EditTenantModal
          tenant={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteTenantDialog
          tenant={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Manajemen Tenant</h2>
          <p className="text-sm text-slate-500">
            {tenants.length} tenant terdaftar
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-admin btn-admin-primary"
        >
          <Plus size={16} /> Buat Tenant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50 border-b border-slate-100">
                {["Tenant", "Pemilik", "Paket", "Status", "Dibuat", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => {
                const isSuspended = t.status === "SUSPENDED";
                const busy = pendingId === t.id && setStatus.isPending;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {t.name}
                      </div>
                      <a
                        href={`https://${t.slug}.${ROOT_DOMAIN}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-azure-600 hover:underline inline-flex items-center gap-1"
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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggle(t)}
                          disabled={busy}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                            isSuspended
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100"
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
                        <button
                          onClick={() => setEditTarget(t)}
                          aria-label="Edit tenant"
                          className="p-1.5 text-slate-400 hover:text-azure-600 hover:bg-azure-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          aria-label="Hapus tenant"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-slate-400 text-sm"
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
