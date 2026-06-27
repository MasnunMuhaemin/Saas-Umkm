"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { WebsiteData } from "@/server/services/tenant/website.service";

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "tentang", label: "Tentang" },
  { id: "promo", label: "Promo" },
] as const;

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

export function WebsiteBuilder({ website }: { website: WebsiteData }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hero");
  const [form, setForm] = useState<WebsiteData>(website);

  function set<K extends keyof WebsiteData>(key: K, value: WebsiteData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const update = trpc.website.update.useMutation({
    onSuccess: () => {
      toast.success("Tampilan website tersimpan");
      utils.website.get.invalidate();
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const save = () =>
    update.mutate({
      bannerTitle: form.bannerTitle || null,
      bannerSubtitle: form.bannerSubtitle || null,
      heroCtaText: form.heroCtaText || null,
      aboutHeadline: form.aboutHeadline || null,
      aboutBody: form.aboutBody || null,
      yearsExperience: form.yearsExperience,
      aboutChecklist: form.aboutChecklist.filter((s) => s.trim()),
      promoEnabled: form.promoEnabled,
      promoTitle: form.promoTitle || null,
      promoSubtitle: form.promoSubtitle || null,
      promoCode: form.promoCode || null,
    });

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white transition-colors";

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <h2 className="font-bold text-gray-900">Website Builder</h2>
          <p className="text-sm text-gray-500">
            Atur tampilan halaman toko publik Anda
          </p>
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

      {tab === "hero" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Judul Banner
            </label>
            <input
              type="text"
              value={form.bannerTitle ?? ""}
              onChange={(e) => set("bannerTitle", e.target.value)}
              placeholder="Jajanan & Kue Buatan Sendiri"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Subjudul Banner
            </label>
            <textarea
              value={form.bannerSubtitle ?? ""}
              onChange={(e) => set("bannerSubtitle", e.target.value)}
              rows={2}
              placeholder="Produk homemade berkualitas, tanpa pengawet."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Teks Tombol (CTA)
            </label>
            <input
              type="text"
              value={form.heroCtaText ?? ""}
              onChange={(e) => set("heroCtaText", e.target.value)}
              placeholder="Lihat Semua Produk"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {tab === "tentang" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Judul Tentang Kami
              </label>
              <input
                type="text"
                value={form.aboutHeadline ?? ""}
                onChange={(e) => set("aboutHeadline", e.target.value)}
                placeholder="Dari Dapur Rumahan ke Ribuan Pelanggan"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tahun Pengalaman
              </label>
              <input
                type="number"
                value={form.yearsExperience || ""}
                onChange={(e) => set("yearsExperience", Number(e.target.value) || 0)}
                placeholder="5"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Cerita / Deskripsi
            </label>
            <textarea
              value={form.aboutBody ?? ""}
              onChange={(e) => set("aboutBody", e.target.value)}
              rows={5}
              placeholder="Ceritakan asal mula usaha Anda..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700">
                Poin Keunggulan
              </label>
              <button
                type="button"
                onClick={() => set("aboutChecklist", [...form.aboutChecklist, ""])}
                className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {form.aboutChecklist.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const arr = [...form.aboutChecklist];
                      arr[i] = e.target.value;
                      set("aboutChecklist", arr);
                    }}
                    placeholder="cth: Bahan alami pilihan"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "aboutChecklist",
                        form.aboutChecklist.filter((_, idx) => idx !== i),
                      )
                    }
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {form.aboutChecklist.length === 0 && (
                <p className="text-xs text-gray-400">
                  Belum ada poin keunggulan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "promo" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700">Aktifkan Promo</p>
              <p className="text-xs text-gray-500">
                Tampilkan banner promo di halaman toko
              </p>
            </div>
            <Toggle
              on={form.promoEnabled}
              onToggle={() => set("promoEnabled", !form.promoEnabled)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Judul Promo
            </label>
            <input
              type="text"
              value={form.promoTitle ?? ""}
              onChange={(e) => set("promoTitle", e.target.value)}
              placeholder="Promo Spesial Akhir Pekan!"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Subjudul Promo
            </label>
            <input
              type="text"
              value={form.promoSubtitle ?? ""}
              onChange={(e) => set("promoSubtitle", e.target.value)}
              placeholder="Diskon untuk pembelian tertentu"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Kode Promo
            </label>
            <input
              type="text"
              value={form.promoCode ?? ""}
              onChange={(e) => set("promoCode", e.target.value)}
              placeholder="HEMAT10"
              className={`${inputCls} font-mono uppercase`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
