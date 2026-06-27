import { getServerTrpc } from "@/lib/trpc/server";
import { PlanManager } from "./_components/plan-manager";

export default async function PlansPage() {
  const api = await getServerTrpc();
  const plans = await api.superadmin.plan.list();
  return <PlanManager plans={plans} />;
}
