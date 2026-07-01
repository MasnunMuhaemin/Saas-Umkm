import Link from "next/link";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";

const ACTION_META: Record<string, { label: string; tone: string }> = {
  "tenant.create": { label: "Buat tenant", tone: "badge-success" },
  "tenant.update": { label: "Ubah tenant", tone: "badge-info" },
  "tenant.delete": { label: "Hapus tenant", tone: "badge-danger" },
  "tenant.suspend": { label: "Suspend tenant", tone: "badge-danger" },
  "tenant.activate": { label: "Aktifkan tenant", tone: "badge-success" },
  "tenant.domain.set": { label: "Set domain", tone: "badge-info" },
  "tenant.domain.clear": { label: "Hapus domain", tone: "badge-warning" },
  "auth.impersonate": { label: "Impersonate", tone: "badge-warning" },
  "plan.update": { label: "Ubah paket", tone: "badge-info" },
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const api = await getServerTrpc();
  const { rows, total, totalPages } = await api.superadmin.audit.list({ page });

  return (
    <div className="animate-fade-up p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          <ScrollText size={20} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Audit Log
          </h2>
          <p className="text-sm text-slate-500">
            {total} aksi tercatat · riwayat aksi sensitif platform
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                {["Waktu", "Pelaku", "Aksi", "Tenant", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const m = ACTION_META[r.action] ?? {
                  label: r.action,
                  tone: "badge-muted",
                };
                return (
                  <tr
                    key={r.id}
                    className="align-top transition-colors hover:bg-slate-50/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-500">
                      {r.createdAt}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <div className="font-medium text-slate-800">
                        {r.actor}
                      </div>
                      {r.actorEmail && (
                        <div className="text-xs text-slate-400">
                          {r.actorEmail}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${m.tone}`}
                      >
                        {m.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {r.tenant ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                      {r.detail ?? "—"}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    Belum ada aktivitas tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/super-admin/audit?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 ${
                page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronLeft size={15} /> Sebelumnya
            </Link>
            <Link
              href={`/super-admin/audit?page=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 ${
                page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Berikutnya <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
