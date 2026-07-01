"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdminModal } from "@/components/shared/admin-modal";
import type { AdminTenantRow } from "@/server/services/superadmin/tenant.service";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

function EditDomainModal({
  tenant,
  onClose,
}: {
  tenant: AdminTenantRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(tenant.customDomain ?? "");

  const setDomain = trpc.superadmin.tenant.setCustomDomain.useMutation({
    onSuccess: () => {
      toast.success("Domain tersimpan");
      router.refresh();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminModal
      onClose={onClose}
      title={tenant.customDomain ? "Ubah Domain Custom" : "Tambah Domain Custom"}
    >
      <p className="text-sm text-neutral-500">
        Tenant <b className="font-semibold text-neutral-800">{tenant.name}</b>
      </p>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Domain Custom
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="tokosaya.com"
          className="admin-input"
        />
        <p className="mt-1.5 text-xs text-neutral-400">
          Kosongkan untuk melepas domain custom (kembali ke subdomain bawaan{" "}
          {tenant.slug}.{ROOT_DOMAIN}).
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          disabled={setDomain.isPending}
          className="btn-admin btn-admin-outline"
        >
          Batal
        </button>
        <button
          onClick={() =>
            setDomain.mutate({
              id: tenant.id,
              customDomain: value.trim() ? value.trim() : null,
            })
          }
          disabled={setDomain.isPending}
          className="btn-admin btn-admin-primary"
        >
          {setDomain.isPending && <Loader2 size={16} className="animate-spin" />}
          Simpan
        </button>
      </div>
    </AdminModal>
  );
}

function DeleteTenantDialog({
  tenant,
  onClose,
}: {
  tenant: AdminTenantRow;
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
          datanya (produk, pesanan, pelanggan, langganan), domain, dan akun
          pemiliknya akan dihapus <b>permanen</b>. Tindakan ini tidak bisa
          dibatalkan.
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

export function DomainTable({ tenants }: { tenants: AdminTenantRow[] }) {
  const [editTarget, setEditTarget] = useState<AdminTenantRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTenantRow | null>(null);

  return (
    <div className="animate-fade-up p-6">
      {editTarget && (
        <EditDomainModal
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

      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Domain Pool
        </h2>
        <p className="text-sm text-slate-500">
          Subdomain & custom domain seluruh tenant
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {["Tenant", "Subdomain", "Custom Domain", "Status", "Aksi"].map(
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
              {tenants.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">
                    {t.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-slate-600">
                    {t.slug}.{ROOT_DOMAIN}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    {t.customDomain ? (
                      <a
                        href={`https://${t.customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-azure-600 hover:underline"
                      >
                        {t.customDomain} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-400">Bawaan</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={t.status} variant="tenant" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditTarget(t)}
                        aria-label="Kelola domain"
                        title="Kelola domain custom"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-azure-50 hover:text-azure-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        aria-label="Hapus tenant"
                        title="Hapus tenant"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
