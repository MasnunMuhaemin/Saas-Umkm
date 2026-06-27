import { getServerTrpc } from "@/lib/trpc/server";
import { WebsiteBuilder } from "./_components/website-builder";

export default async function StoreBuilderPage() {
  const api = await getServerTrpc();
  const website = await api.website.get();
  return <WebsiteBuilder website={website} />;
}
