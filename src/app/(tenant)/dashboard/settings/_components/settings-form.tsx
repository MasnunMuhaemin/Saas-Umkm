"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProfileData = RouterOutput["settings"]["get"];

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

const COLOR_PRESETS = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#475569",
];

const TABS = [
  { id: "identitas", label: "Identitas" },
  { id: "kontak", label: "Kontak" },
  { id: "tampilan", label: "Tampilan" },
] as const;

const VISIBILITY: { key: keyof ProfileData; label: string }[] = [
  { key: "showPrice", label: "Tampilkan Harga" },
  { key: "showStock", label: "Tampilkan Stok" },
  { key: "showRating", label: "Tampilkan Rating" },
  { key: "showWhatsappButton", label: "Tampilkan Tombol WhatsApp" },
  { key: "showCategory", label: "Tampilkan Kategori" },
  { key: "showDiscount", label: "Tampilkan Diskon" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors flex-none",
        on ? "bg-primary" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
          on && "translate-x-4",
        )}
      />
    </button>
  );
}

export function SettingsForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("identitas");
  const [form, setForm] = useState<ProfileData>(profile);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const storeUrl = form.customDomain ?? `${form.slug}.${ROOT_DOMAIN}`;
  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white transition-colors";

  const update = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Profil berhasil disimpan");
      utils.settings.get.invalidate();
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Nama toko wajib diisi");
      setTab("identitas");
      return;
    }
    update.mutate({
      name: form.name,
      tagline: form.tagline || null,
      description: form.description || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      province: form.province || null,
      openingHours: form.openingHours || null,
      customDomain: form.customDomain || null,
      logo: form.logo || null,
      favicon: form.favicon || null,
      primaryColor: form.primaryColor,
      showBusinessName: form.showBusinessName,
      showTagline: form.showTagline,
      showPrice: form.showPrice,
      showStock: form.showStock,
      showRating: form.showRating,
      showWhatsappButton: form.showWhatsappButton,
      showCategory: form.showCategory,
      showDiscount: form.showDiscount,
    });
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="font-bold text-gray-900">Profil Bisnis</h2>
          <a
            href={`https://${storeUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            {storeUrl} <ExternalLink size={13} />
          </a>
        </div>
        <button
          onClick={save}
          disabled={update.isPending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
        >
          {update.isPending && <Loader2 size={16} className="animate-spin" />}
          {update.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "identitas" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-gray-700">
                Nama Toko *
              </label>
              <Toggle
                on={form.showBusinessName}
                onToggle={() => set("showBusinessName", !form.showBusinessName)}
              />
            </div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Toko Demo"
              className={inputCls}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-gray-700">Tagline</label>
              <Toggle
                on={form.showTagline}
                onToggle={() => set("showTagline", !form.showTagline)}
              />
            </div>
            <input
              type="text"
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Kue & jajanan rumahan enak"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Ceritakan singkat tentang usaha Anda..."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      )}

      {tab === "kontak" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 grid sm:grid-cols-2 gap-5">
          {(
            [
              { key: "whatsapp", label: "WhatsApp", ph: "6281234567890" },
              { key: "phone", label: "Telepon", ph: "0218765432" },
              { key: "email", label: "Email", ph: "toko@email.com" },
              { key: "city", label: "Kota", ph: "Bandung" },
              { key: "province", label: "Provinsi", ph: "Jawa Barat" },
              { key: "openingHours", label: "Jam Buka", ph: "Senin-Sabtu 08.00-18.00" },
            ] as const
          ).map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.ph}
                className={inputCls}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Alamat
            </label>
            <input
              type="text"
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Jl. Raya Dago No. 45"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {tab === "tampilan" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h3 className="font-bold text-gray-900">Domain Custom</h3>
            <input
              type="text"
              value={form.customDomain ?? ""}
              onChange={(e) => set("customDomain", e.target.value)}
              placeholder="tokosaya.com"
              className={inputCls}
            />
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">
                Cara menghubungkan:
              </p>
              <p>
                Tambahkan record <b>CNAME</b> di pengaturan DNS domain Anda yang
                mengarah ke <b>cname.{ROOT_DOMAIN}</b>. Setelah aktif, toko Anda
                bisa diakses dari domain sendiri.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Logo & Favicon</h3>
            <div className="flex items-start gap-4">
              {form.logo && (
                <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <input
                  type="url"
                  value={form.logo ?? ""}
                  onChange={(e) => set("logo", e.target.value)}
                  placeholder="URL Logo (https://...)"
                  className={inputCls}
                />
                <input
                  type="url"
                  value={form.favicon ?? ""}
                  onChange={(e) => set("favicon", e.target.value)}
                  placeholder="URL Favicon (https://...)"
                  className={inputCls}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Tempel URL gambar. Upload file langsung tersedia setelah storage
              dikonfigurasi.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Warna Tema</h3>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("primaryColor", c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                    form.primaryColor.toUpperCase() === c
                      ? "border-gray-900"
                      : "border-transparent",
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Visibilitas Elemen</h3>
            <div className="space-y-3">
              {VISIBILITY.map((v) => (
                <div key={v.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{v.label}</span>
                  <Toggle
                    on={form[v.key] as boolean}
                    onToggle={() => set(v.key, !form[v.key] as never)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
