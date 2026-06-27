import { Lock } from "lucide-react";
import { getServerTrpc } from "@/lib/trpc/server";
import { CustomerManager } from "./_components/customer-manager";

function UpgradeNotice() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto mt-16 text-center bg-white border border-gray-100 rounded-2xl p-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={26} />
        </div>
        <h2 className="font-bold text-gray-900 text-lg mb-2">
          Fitur Paket Plus
        </h2>
        <p className="text-sm text-gray-500">
          Manajemen Data Pelanggan hanya tersedia untuk paket Plus. Hubungi admin
          untuk upgrade paket Anda.
        </p>
      </div>
    </div>
  );
}

export default async function CustomersPage() {
  const api = await getServerTrpc();
  try {
    const initial = await api.customer.all();
    return <CustomerManager initial={initial} />;
  } catch {
    // plan-guard melempar FORBIDDEN untuk paket non-Plus
    return <UpgradeNotice />;
  }
}
