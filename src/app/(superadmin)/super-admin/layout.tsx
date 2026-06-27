import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { AdminShell } from "./_components/admin-shell";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") redirect("/login");

  return (
    <AdminShell userName={session.user.name ?? "Admin"}>{children}</AdminShell>
  );
}
