import { getServerTrpc } from "@/lib/trpc/server";
import { BillingPanel } from "./_components/billing-panel";

export default async function BillingPage() {
  const api = await getServerTrpc();
  const info = await api.billing.getInfo();
  return <BillingPanel initial={info} />;
}
