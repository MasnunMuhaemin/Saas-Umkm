"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/helpers/format";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminTenantRow } from "@/server/services/superadmin/tenant.service";

type TenantRow = AdminTenantRow;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export function TenantTable({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

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
      <div className="mb-5">
        <h2 className="font-bold text-slate-900">Manajemen Tenant</h2>
        <p className="text-sm text-slate-500">{tenants.length} tenant terdaftar</p>
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
