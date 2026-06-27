import { Lock } from "lucide-react";

/** Tampilan saat fitur butuh paket Plus (dipakai POS, Pelanggan, dll). */
export function PlanUpgradeNotice({ feature }: { feature: string }) {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto mt-16 text-center bg-white border border-gray-100 rounded-2xl p-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={26} />
        </div>
        <h2 className="font-bold text-gray-900 text-lg mb-2">Fitur Paket Plus</h2>
        <p className="text-sm text-gray-500">
          {feature} hanya tersedia untuk paket Plus. Hubungi admin untuk upgrade
          paket Anda.
        </p>
      </div>
    </div>
  );
}
