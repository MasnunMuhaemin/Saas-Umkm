import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getServerTrpc } from "@/lib/trpc/server";
import { DashboardShell } from "./_components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware sudah guard, tapi cek lagi di server.
  const session = await auth();
  if (session?.user?.role !== "MERCHANT") redirect("/login");

  const api = await getServerTrpc();

  // Merchant baru → arahkan ke wizard onboarding dulu.
  const ob = await api.onboarding.status();
  if (!ob.onboarded) redirect("/onboarding");

  const shell = await api.dashboard.shell();

  return (
    <DashboardShell
      shell={shell}
      userName={session.user.name ?? "Pengguna"}
      isOwner={session.user.tenantRole === "OWNER"}
    >
      {children}
    </DashboardShell>
  );
}
