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
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/helpers/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdminModal } from "@/components/shared/admin-modal";
import type { AdminTenantRow } from "@/server/services/superadmin/tenant.service";

type TenantRow = AdminTenantRow;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";

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
    { k: "name", label: "Nama Toko", ph: "Toko Berkah" },
    { k: "slug", label: "Subdomain", ph: "toko-berkah" },
    { k: "ownerName", label: "Nama Pemilik", ph: "Andi" },
    { k: "ownerEmail", label: "Email Login", ph: "andi@email.com" },
  ] as const;

  return (
    <AdminModal onClose={onClose} title="Buat Tenant Baru">
      <div className="space-y-3.5">
        {fields.map((f) => (
          <div key={f.k}>
            <label className={labelCls}>{f.label}</label>
            <input
              value={form[f.k]}
              onChange={(e) => set(f.k, e.target.value)}
              placeholder={f.ph}
              className="admin-input"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="min. 6 karakter"
              className="admin-input"
            />
          </div>
          <div>
            <label className={labelCls}>Paket</label>
            <select
              value={form.planSlug}
              onChange={(e) => set("planSlug", e.target.value)}
              className="admin-select"
            >
              <option value="basic">Basic</option>
              <option value="plus">Plus</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          disabled={create.isPending}
          className="btn-admin btn-admin-outline"
        >
          Batal
        </button>
        <button
          onClick={() => create.mutate(form)}
          disabled={create.isPending}
          className="btn-admin btn-admin-primary"
        >
          {create.isPending && <Loader2 size={16} className="animate-spin" />}
          {create.isPending ? "Membuat..." : "Buat Tenant"}
        </button>
      </div>
    </AdminModal>
  );
}

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
    <AdminModal onClose={onClose} title="Edit Tenant">
      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>Nama Toko</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className={labelCls}>Subdomain</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="admin-input"
          />
          <p className="mt-1.5 font-mono text-xs text-neutral-400">
            {form.slug || "toko"}.{ROOT_DOMAIN}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Paket</label>
            <select
              value={form.planSlug}
              onChange={(e) =>
                set("planSlug", e.target.value as "basic" | "plus")
              }
              className="admin-select"
            >
              <option value="basic">Basic</option>
              <option value="plus">Plus</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                set(
                  "status",
                  e.target.value as "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED",
                )
              }
              className="admin-select"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspend</option>
              <option value="EXPIRED">Kedaluwarsa</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          disabled={update.isPending}
          className="btn-admin btn-admin-outline"
        >
          Batal
        </button>
        <button
          onClick={() => update.mutate({ id: tenant.id, ...form })}
          disabled={update.isPending}
          className="btn-admin btn-admin-primary"
        >
          {update.isPending && <Loader2 size={16} className="animate-spin" />}
          {update.isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </AdminModal>
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
    <AdminModal onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={22} />
        </div>
        <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-neutral-900">
          Hapus Tenant?
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-neutral-500">
          <b className="text-neutral-700">{tenant.name}</b> beserta SEMUA
          datanya (produk, pesanan, pelanggan, langganan) dan akun pemiliknya
          akan dihapus <b>permanen</b>. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-2.5">
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
    </AdminModal>
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
    <div className="animate-fade-up p-6">
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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Tenant
          </h2>
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

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {["Tenant", "Pemilik", "Paket", "Status", "Dibuat", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
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
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-slate-900">
                        {t.name}
                      </div>
                      <a
                        href={`https://${t.slug}.${ROOT_DOMAIN}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-azure-600 hover:underline"
                      >
                        {t.slug}.{ROOT_DOMAIN} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      <div>{t.user.name}</div>
                      <div className="text-xs text-slate-400">
                        {t.user.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-700">
                      {t.plan.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge status={t.status} variant="tenant" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggle(t)}
                          disabled={busy}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
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
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-azure-50 hover:text-azure-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          aria-label="Hapus tenant"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
                    className="px-4 py-16 text-center text-sm text-slate-400"
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
