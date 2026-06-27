import { getServerTrpc } from "@/lib/trpc/server";
import { NotificationCenter } from "./_components/notification-center";

export default async function NotificationsPage() {
  const api = await getServerTrpc();
  const initial = await api.superadmin.notification.list();
  return <NotificationCenter initial={initial} />;
}
