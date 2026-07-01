import { getServerTrpc } from "@/lib/trpc/server";
import { NotificationInbox } from "./_components/notification-inbox";

export default async function NotificationsPage() {
  const api = await getServerTrpc();
  const items = await api.notification.list();
  return <NotificationInbox initial={items} />;
}
