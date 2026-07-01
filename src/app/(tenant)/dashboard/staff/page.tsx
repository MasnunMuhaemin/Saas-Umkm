import { auth } from "@/server/auth";
import { getServerTrpc } from "@/lib/trpc/server";
import { StaffManager } from "./_components/staff-manager";

export default async function StaffPage() {
  const session = await auth();
  if (session?.user?.tenantRole !== "OWNER") {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Halaman ini hanya untuk <b>pemilik toko</b>. Hubungi pemilik untuk
          mengelola staff.
        </div>
      </div>
    );
  }

  const api = await getServerTrpc();
  const data = await api.staff.list();
  return <StaffManager initial={data} />;
}
