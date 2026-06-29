"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/image-upload";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type ProfileData = RouterOutput["settings"]["get"];

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

const TABS = [
  { id: "identitas", label: "Identitas" },
  { id: "kontak", label: "Kontak" },
  { id: "tampilan", label: "Logo & Domain" },
] as const;

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
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-colors";

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
    });
  };

  return (
    <div className="p-6 max-w-3xl animate-fade-up">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
            Profil Bisnis
          </h2>
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
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 flex items-center gap-2"
        >
          {update.isPending && <Loader2 size={16} className="animate-spin" />}
          {update.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "identitas" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nama Toko *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Toko Demo"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Kue & jajanan rumahan enak"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 grid sm:grid-cols-2 gap-5">
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
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-3">
            <h3 className="font-display font-bold text-slate-900">Domain Custom</h3>
            <input
              type="text"
              value={form.customDomain ?? ""}
              onChange={(e) => set("customDomain", e.target.value)}
              placeholder="tokosaya.com"
              className={inputCls}
            />
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">
                Cara menghubungkan:
              </p>
              <p>
                Tambahkan record <b>CNAME</b> di pengaturan DNS domain Anda yang
                mengarah ke <b>cname.{ROOT_DOMAIN}</b>. Setelah aktif, toko Anda
                bisa diakses dari domain sendiri.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-900">Logo & Favicon</h3>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1.5">
                  Logo
                </p>
                <ImageUpload
                  value={form.logo}
                  onChange={(url) => set("logo", url)}
                  size="sm"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1.5">
                  Favicon
                </p>
                <ImageUpload
                  value={form.favicon}
                  onChange={(url) => set("favicon", url)}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-800">
            Warna tema & tampilan elemen toko diatur di menu{" "}
            <b>Website Builder → Tema</b>.
          </div>
        </div>
      )}
    </div>
  );
}
