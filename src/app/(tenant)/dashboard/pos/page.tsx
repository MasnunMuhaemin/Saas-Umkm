import { getServerTrpc } from "@/lib/trpc/server";
import { PlanUpgradeNotice } from "@/components/shared/upgrade-notice";
import { PosTerminal } from "./_components/pos-terminal";

export default async function PosPage() {
  const api = await getServerTrpc();
  try {
    const initial = await api.order.posData();
    return <PosTerminal initial={initial} />;
  } catch {
    return <PlanUpgradeNotice feature="Sistem Kasir (POS)" />;
  }
}
