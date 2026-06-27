import { getServerTrpc } from "@/lib/trpc/server";
import { TenantTable } from "./_components/tenant-table";

export default async function TenantsPage() {
  const api = await getServerTrpc();
  const tenants = await api.superadmin.tenant.list();
  return <TenantTable tenants={tenants} />;
}
