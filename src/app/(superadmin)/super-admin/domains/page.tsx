import { getServerTrpc } from "@/lib/trpc/server";
import { DomainTable } from "./_components/domain-table";

export default async function DomainsPage() {
  const api = await getServerTrpc();
  const tenants = await api.superadmin.tenant.list();

  return <DomainTable tenants={tenants} />;
}
