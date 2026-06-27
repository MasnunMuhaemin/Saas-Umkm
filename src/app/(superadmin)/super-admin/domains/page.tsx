import { ExternalLink } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { StatusBadge } from "@/components/shared/status-badge";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export default async function DomainsPage() {
  const api = await getServerTrpc();
  const tenants = await api.superadmin.tenant.list();

  return (
    <div className="p-6 animate-fade-up">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Domain Pool</h2>
        <p className="text-sm text-slate-500">
          Subdomain & custom domain seluruh tenant
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50 border-b border-slate-100">
                {["Tenant", "Subdomain", "Custom Domain", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900 text-sm">
                    {t.name}
                  </td>
                  <td className="px-4 py-4 text-sm font-mono text-slate-600 whitespace-nowrap">
                    {t.slug}.{ROOT_DOMAIN}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    {t.customDomain ? (
                      <a
                        href={`https://${t.customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline inline-flex items-center gap-1 font-mono"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
