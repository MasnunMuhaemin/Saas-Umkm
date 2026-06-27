import { CheckCircle2, Circle } from "lucide-react";

export default function SystemSettingsPage() {
  const rows = [
    {
      label: "Root Domain",
      value: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id",
      ok: true,
    },
    {
      label: "Pembayaran (Pakasir)",
      value: process.env.PAKASIR_API_KEY ? "Live (API key terpasang)" : "Mode Demo (API key kosong)",
      ok: Boolean(process.env.PAKASIR_API_KEY),
    },
    {
      label: "Email (Resend)",
      value: process.env.RESEND_API_KEY ? "Aktif" : "Mode Log (API key kosong)",
      ok: Boolean(process.env.RESEND_API_KEY),
    },
    {
      label: "Cron Secret",
      value: process.env.CRON_SECRET ? "Terpasang" : "Belum diatur",
      ok: Boolean(process.env.CRON_SECRET),
    },
    {
      label: "Storage Upload",
      value: process.env.UPLOADTHING_TOKEN ? "Terkonfigurasi" : "Belum (pakai input URL)",
      ok: Boolean(process.env.UPLOADTHING_TOKEN),
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-5">
        <h2 className="font-bold text-slate-900">Pengaturan Sistem</h2>
        <p className="text-sm text-slate-500">
          Status konfigurasi platform (dari environment)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 p-4">
            {r.ok ? (
              <CheckCircle2 size={18} className="text-green-500 flex-none" />
            ) : (
              <Circle size={18} className="text-amber-400 flex-none" />
            )}
            <span className="text-sm font-semibold text-slate-700 flex-1">
              {r.label}
            </span>
            <span className="text-sm text-slate-500">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Untuk mengaktifkan layanan berstatus kuning, isi variabel terkait di{" "}
        <code>.env</code>.
      </p>
    </div>
  );
}
