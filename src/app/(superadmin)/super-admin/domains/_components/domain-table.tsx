"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { StatusBadge } from "@/components/shared/status-badge";
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {tenant.customDomain ? "Ubah Domain" : "Tambah Domain Custom"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-6">
          <p className="text-sm text-slate-500">
            Tenant: <b className="text-slate-700">{tenant.name}</b>
          </p>
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">
              Domain Custom
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="tokosaya.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              Kosongkan untuk kembali ke subdomain bawaan ({tenant.slug}.
              {ROOT_DOMAIN}).
            </p>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button
            onClick={onClose}
            disabled={setDomain.isPending}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
          >
            {setDomain.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {setDomain.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveDomainDialog({
  tenant,
  onClose,
}: {
  tenant: AdminTenantRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const setDomain = trpc.superadmin.tenant.setCustomDomain.useMutation({
    onSuccess: () => {
      toast.success("Domain custom dihapus");
      router.refresh();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6 text-center shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h3 className="mb-1 font-display text-lg font-bold text-slate-900">
          Hapus Domain Custom?
        </h3>
        <p className="mb-6 text-sm text-slate-500">
          <b className="font-mono">{tenant.customDomain}</b> akan dilepas dari{" "}
          <b>{tenant.name}</b>. Toko kembali diakses lewat subdomain bawaan (
          {tenant.slug}.{ROOT_DOMAIN}).
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={setDomain.isPending}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() =>
              setDomain.mutate({ id: tenant.id, customDomain: null })
            }
            disabled={setDomain.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {setDomain.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {setDomain.isPending ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DomainTable({ tenants }: { tenants: AdminTenantRow[] }) {
  const [editTarget, setEditTarget] = useState<AdminTenantRow | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminTenantRow | null>(
    null,
  );

  return (
    <div className="animate-fade-up p-6">
      {editTarget && (
        <EditDomainModal
          tenant={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {removeTarget && (
        <RemoveDomainDialog
          tenant={removeTarget}
          onClose={() => setRemoveTarget(null)}
        />
      )}

      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
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
                        className="inline-flex items-center gap-1 font-mono text-brand-600 hover:underline"
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
                        aria-label="Edit domain"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil size={15} />
                      </button>
                      {t.customDomain && (
                        <button
                          onClick={() => setRemoveTarget(t)}
                          aria-label="Hapus domain custom"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
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
