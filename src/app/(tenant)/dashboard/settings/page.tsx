import { getServerTrpc } from "@/lib/trpc/server";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const api = await getServerTrpc();
  const profile = await api.settings.get();
  return <SettingsForm profile={profile} />;
}
