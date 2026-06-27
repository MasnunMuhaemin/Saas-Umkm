import { getServerTrpc } from "@/lib/trpc/server";
import { PlanUpgradeNotice } from "@/components/shared/upgrade-notice";
import { CustomerManager } from "./_components/customer-manager";

export default async function CustomersPage() {
  const api = await getServerTrpc();
  try {
    const initial = await api.customer.all();
    return <CustomerManager initial={initial} />;
  } catch {
    // plan-guard melempar FORBIDDEN untuk paket non-Plus
    return <PlanUpgradeNotice feature="Manajemen Data Pelanggan" />;
  }
}
