"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/image-upload";
import type { WebsiteData } from "@/server/services/tenant/website.service";

const TABS = [
  { id: "info", label: "Info Toko" },
  { id: "tema", label: "Tema" },
  { id: "hero", label: "Hero" },
  { id: "tentang", label: "Tentang" },
  { id: "keunggulan", label: "Keunggulan" },
  { id: "testimoni", label: "Testimoni" },
  { id: "faq", label: "FAQ" },
  { id: "promo", label: "Promo" },
  { id: "kontak", label: "Kontak" },
] as const;

const COLOR_PRESETS = [
  "#2563EB",
  "#0F172A",
  "#059669",
  "#0891B2",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#DC2626",
];

const HERO_STYLES = [
  { id: "centered", label: "Centered", desc: "Teks di tengah, latar warna" },
  { id: "split", label: "Split", desc: "Teks kiri + panel kanan" },
  { id: "minimal", label: "Minimal", desc: "Latar terang, bersih" },
] as const;

const PRODUCT_STYLES = [
  { id: "grid", label: "Grid", desc: "Kartu beberapa kolom" },
  { id: "list", label: "List", desc: "Baris memanjang" },
] as const;

const ADVANTAGE_STYLES = [
  { id: "cards", label: "Kartu", desc: "Grid kartu beberapa kolom" },
  { id: "list", label: "List", desc: "Daftar vertikal ringkas" },
] as const;
const TESTIMONIAL_STYLES = [
  { id: "grid", label: "Grid", desc: "Kartu sejajar" },
  { id: "highlight", label: "Sorotan", desc: "Besar & menonjol" },
] as const;
const FAQ_STYLES = [
  { id: "accordion", label: "Accordion", desc: "Buka-tutup" },
  { id: "open", label: "Terbuka", desc: "Semua jawaban tampil" },
] as const;

/** Wireframe mini preview untuk section Keunggulan. */
function AdvantagePreview({ variant }: { variant: string }) {
  if (variant === "list")
    return (
      <div className="h-14 rounded-md bg-slate-50 p-2 space-y-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-brand-200 flex-none" />
            <div className="h-1.5 flex-1 bg-slate-300 rounded" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="h-14 rounded-md bg-slate-50 p-2 grid grid-cols-3 gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded border border-slate-200 p-1 flex flex-col gap-0.5"
        >
          <div className="w-2.5 h-2.5 rounded bg-brand-300" />
          <div className="h-1 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Wireframe mini preview untuk section Testimoni. */
function TestimonialPreview({ variant }: { variant: string }) {
  if (variant === "highlight")
    return (
      <div className="h-14 rounded-md bg-slate-50 p-2 flex items-center justify-center">
        <div className="w-3/4 bg-white rounded border border-slate-200 p-1.5 flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((j) => (
              <div key={j} className="w-1 h-1 rounded-full bg-amber-400" />
            ))}
          </div>
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-1/2 bg-slate-300 rounded" />
        </div>
      </div>
    );
  return (
    <div className="h-14 rounded-md bg-slate-50 p-2 grid grid-cols-3 gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded border border-slate-200 p-1 flex flex-col gap-0.5"
        >
          <div className="flex gap-0.5">
            {[0, 1].map((j) => (
              <div key={j} className="w-1 h-1 rounded-full bg-amber-400" />
            ))}
          </div>
          <div className="h-1 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Wireframe mini preview untuk section FAQ. */
function FaqPreview({ variant }: { variant: string }) {
  if (variant === "open")
    return (
      <div className="h-14 rounded-md bg-slate-50 p-2 space-y-1.5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white rounded border border-slate-200 p-1 space-y-0.5"
          >
            <div className="h-1 w-2/3 bg-slate-400 rounded" />
            <div className="h-1 w-full bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="h-14 rounded-md bg-slate-50 p-2 space-y-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded border border-slate-200 p-1 flex items-center justify-between"
        >
          <div className="h-1 w-2/3 bg-slate-400 rounded" />
          <div className="w-1.5 h-1.5 border-r border-b border-slate-400 rotate-45" />
        </div>
      ))}
    </div>
  );
}

/** Selektor template generik (preview + label + deskripsi). */
function StyleSelect({
  title,
  options,
  value,
  onChange,
  preview,
}: {
  title: string;
  options: readonly { id: string; label: string; desc: string }[];
  value: string;
  onChange: (id: string) => void;
  preview?: (variant: string) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
      <label className="block text-sm font-bold text-slate-700 mb-3">
        {title}
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              "text-left rounded-xl border p-3 transition-all",
              value === s.id
                ? "border-brand-600 ring-2 ring-brand-100"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            {preview?.(s.id)}
            <p className="font-bold text-sm text-slate-900 mt-2">{s.label}</p>
            <p className="text-xs text-slate-500">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

const ELEMENT_TOGGLES = [
  { key: "showBusinessName", label: "Nama bisnis di header" },
  { key: "showTagline", label: "Tagline / slogan" },
  { key: "showPrice", label: "Harga produk" },
  { key: "showStock", label: "Sisa stok produk" },
  { key: "showCategory", label: "Kategori produk" },
  { key: "showDiscount", label: "Badge diskon" },
  { key: "showRating", label: "Rating produk" },
  { key: "showWhatsappButton", label: "Tombol WhatsApp" },
] as const;

/** Wireframe mini untuk preview template (bukan warna asli). */
function HeroPreview({ variant }: { variant: string }) {
  if (variant === "split")
    return (
      <div className="h-14 rounded-md bg-brand-50 flex gap-1.5 p-2">
        <div className="flex-1 space-y-1">
          <div className="h-1.5 w-3/4 bg-brand-400 rounded" />
          <div className="h-1 w-full bg-slate-300 rounded" />
        </div>
        <div className="w-8 bg-brand-200 rounded" />
      </div>
    );
  if (variant === "minimal")
    return (
      <div className="h-14 rounded-md bg-slate-100 flex flex-col items-center justify-center gap-1">
        <div className="h-1.5 w-1/2 bg-slate-400 rounded" />
        <div className="h-1 w-2/3 bg-slate-300 rounded" />
      </div>
    );
  return (
    <div className="h-14 rounded-md bg-brand-100 flex flex-col items-center justify-center gap-1">
      <div className="h-1.5 w-1/2 bg-brand-500 rounded" />
      <div className="h-1 w-2/3 bg-brand-300 rounded" />
    </div>
  );
}

function ProductPreview({ variant }: { variant: string }) {
  if (variant === "list")
    return (
      <div className="h-14 rounded-md bg-slate-50 p-2 space-y-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-slate-300 rounded" />
            <div className="h-1.5 flex-1 bg-slate-300 rounded" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="h-14 rounded-md bg-slate-50 p-2 grid grid-cols-3 gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-slate-300 rounded" />
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors flex-none",
        on ? "bg-primary" : "bg-slate-300",
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
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("info");
  const [form, setForm] = useState<WebsiteData>(website);

  function set<K extends keyof WebsiteData>(key: K, value: WebsiteData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // --- Hero stats (max 4) ---
  const addStat = () => set("heroStats", [...form.heroStats, { value: "", label: "" }]);
  const setStat = (i: number, patch: Partial<WebsiteData["heroStats"][number]>) =>
    set(
      "heroStats",
      form.heroStats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  const removeStat = (i: number) =>
    set(
      "heroStats",
      form.heroStats.filter((_, idx) => idx !== i),
    );

  // --- Advantages (max 6) ---
  const addAdvantage = () =>
    set("advantages", [...form.advantages, { title: "", description: "" }]);
  const setAdvantage = (
    i: number,
    patch: Partial<WebsiteData["advantages"][number]>,
  ) =>
    set(
      "advantages",
      form.advantages.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );
  const removeAdvantage = (i: number) =>
    set(
      "advantages",
      form.advantages.filter((_, idx) => idx !== i),
    );

  // --- Testimonials (max 12) ---
  const addTestimonial = () =>
    set("testimonials", [...form.testimonials, { name: "", text: "", rating: 5 }]);
  const setTestimonial = (
    i: number,
    patch: Partial<WebsiteData["testimonials"][number]>,
  ) =>
    set(
      "testimonials",
      form.testimonials.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    );
  const removeTestimonial = (i: number) =>
    set(
      "testimonials",
      form.testimonials.filter((_, idx) => idx !== i),
    );

  // --- FAQs (max 15) ---
  const addFaq = () => set("faqs", [...form.faqs, { question: "", answer: "" }]);
  const setFaq = (i: number, patch: Partial<WebsiteData["faqs"][number]>) =>
    set(
      "faqs",
      form.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    );
  const removeFaq = (i: number) =>
    set(
      "faqs",
      form.faqs.filter((_, idx) => idx !== i),
    );

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
      name: form.name.trim() || form.name,
      tagline: form.tagline || null,
      description: form.description || null,
      logo: form.logo || null,
      bannerTitle: form.bannerTitle || null,
      bannerSubtitle: form.bannerSubtitle || null,
      heroCtaText: form.heroCtaText || null,
      bannerImage: form.bannerImage || null,
      heroStats: form.heroStats.filter((s) => s.value || s.label),
      aboutHeadline: form.aboutHeadline || null,
      aboutBody: form.aboutBody || null,
      aboutImage: form.aboutImage || null,
      yearsExperience: form.yearsExperience,
      aboutChecklist: form.aboutChecklist.filter((s) => s.trim()),
      advantages: form.advantages.filter((a) => a.title || a.description),
      testimonials: form.testimonials.filter((t) => t.name || t.text),
      faqs: form.faqs.filter((f) => f.question || f.answer),
      promoEnabled: form.promoEnabled,
      promoTitle: form.promoTitle || null,
      promoSubtitle: form.promoSubtitle || null,
      promoCode: form.promoCode || null,
      promoImage: form.promoImage || null,
      googleMapsUrl: form.googleMapsUrl || null,
      openingHours: form.openingHours || null,
      socialLinks: form.socialLinks,
      primaryColor: form.primaryColor,
      heroStyle: form.heroStyle as "centered" | "split" | "minimal",
      productStyle: form.productStyle as "grid" | "list",
      advantagesStyle: form.advantagesStyle as "cards" | "list",
      testimonialStyle: form.testimonialStyle as "grid" | "highlight",
      faqStyle: form.faqStyle as "accordion" | "open",
      showBusinessName: form.showBusinessName,
      showTagline: form.showTagline,
      showPrice: form.showPrice,
      showStock: form.showStock,
      showCategory: form.showCategory,
      showDiscount: form.showDiscount,
      showRating: form.showRating,
      showWhatsappButton: form.showWhatsappButton,
    });

  const inputCls =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-colors";

  return (
    <div className="p-6 max-w-3xl animate-fade-up">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
            Website Builder
          </h2>
          <p className="text-sm text-slate-500">
            Atur tampilan halaman toko publik Anda
          </p>
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

      <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "py-2 px-3 rounded-lg text-sm font-semibold transition-colors",
              tab === t.id
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nama Toko
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nama toko Anda"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tagline / Slogan
            </label>
            <input
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Mis. Kue & jajanan rumahan enak"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">
              Tampil di badge hero &amp; header toko.
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Deskripsi Toko
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Ceritakan tentang toko Anda…"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">
              Dipakai sebagai subjudul hero &amp; info toko.
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Logo Toko
            </label>
            <ImageUpload
              value={form.logo}
              onChange={(url) => set("logo", url)}
              size="sm"
            />
          </div>
        </div>
      )}

      {tab === "hero" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Gambar Latar Hero
            </label>
            <ImageUpload
              value={form.bannerImage}
              onChange={(url) => set("bannerImage", url)}
              size="wide"
            />
            <p className="text-xs text-slate-400 mt-1">
              Tempel URL gambar untuk latar belakang hero.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">
                Statistik Hero
              </label>
              {form.heroStats.length < 4 && (
                <button
                  type="button"
                  onClick={addStat}
                  className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Tambah
                </button>
              )}
            </div>
            <div className="space-y-2">
              {form.heroStats.map((stat, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => setStat(i, { value: e.target.value })}
                    placeholder="cth: 1.200+"
                    className="w-1/3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => setStat(i, { label: e.target.value })}
                    placeholder="cth: Pelanggan puas"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {form.heroStats.length === 0 && (
                <p className="text-xs text-slate-400">
                  Belum ada statistik. Maks. 4 item.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "tentang" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Gambar Tentang Kami
            </label>
            <ImageUpload
              value={form.aboutImage}
              onChange={(url) => set("aboutImage", url)}
              size="wide"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">
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
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "aboutChecklist",
                        form.aboutChecklist.filter((_, idx) => idx !== i),
                      )
                    }
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {form.aboutChecklist.length === 0 && (
                <p className="text-xs text-slate-400">
                  Belum ada poin keunggulan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "promo" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Aktifkan Promo</p>
              <p className="text-xs text-slate-500">
                Tampilkan banner promo di halaman toko
              </p>
            </div>
            <Toggle
              on={form.promoEnabled}
              onToggle={() => set("promoEnabled", !form.promoEnabled)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
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
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Gambar Promo
            </label>
            <ImageUpload
              value={form.promoImage}
              onChange={(url) => set("promoImage", url)}
              size="wide"
            />
          </div>
        </div>
      )}

      {tab === "keunggulan" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Keunggulan Toko</p>
              <p className="text-xs text-slate-500">
                Tonjolkan kelebihan usaha Anda. Maks. 6 item.
              </p>
            </div>
            {form.advantages.length < 6 && (
              <button
                type="button"
                onClick={addAdvantage}
                className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Tambah
              </button>
            )}
          </div>
          <div className="space-y-3">
            {form.advantages.map((adv, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adv.title}
                    onChange={(e) => setAdvantage(i, { title: e.target.value })}
                    placeholder="Judul keunggulan"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdvantage(i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  value={adv.description}
                  onChange={(e) =>
                    setAdvantage(i, { description: e.target.value })
                  }
                  rows={2}
                  placeholder="Penjelasan singkat keunggulan ini…"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            ))}
            {form.advantages.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada keunggulan.</p>
            )}
          </div>
        </div>
      )}

      {tab === "testimoni" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Testimoni Pelanggan
              </p>
              <p className="text-xs text-slate-500">
                Ulasan pelanggan untuk membangun kepercayaan. Maks. 12 item.
              </p>
            </div>
            {form.testimonials.length < 12 && (
              <button
                type="button"
                onClick={addTestimonial}
                className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Tambah
              </button>
            )}
          </div>
          <div className="space-y-3">
            {form.testimonials.map((tst, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tst.name}
                    onChange={(e) =>
                      setTestimonial(i, { name: e.target.value })
                    }
                    placeholder="Nama pelanggan"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <select
                    value={tst.rating}
                    onChange={(e) =>
                      setTestimonial(i, { rating: Number(e.target.value) })
                    }
                    aria-label="Rating"
                    className="w-24 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} ★
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  value={tst.text}
                  onChange={(e) => setTestimonial(i, { text: e.target.value })}
                  rows={2}
                  placeholder="Tulis ulasan pelanggan…"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            ))}
            {form.testimonials.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada testimoni.</p>
            )}
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Pertanyaan Umum (FAQ)
              </p>
              <p className="text-xs text-slate-500">
                Jawab pertanyaan yang sering ditanyakan. Maks. 15 item.
              </p>
            </div>
            {form.faqs.length < 15 && (
              <button
                type="button"
                onClick={addFaq}
                className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Tambah
              </button>
            )}
          </div>
          <div className="space-y-3">
            {form.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => setFaq(i, { question: e.target.value })}
                    placeholder="Pertanyaan"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  value={faq.answer}
                  onChange={(e) => setFaq(i, { answer: e.target.value })}
                  rows={2}
                  placeholder="Jawaban…"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            ))}
            {form.faqs.length === 0 && (
              <p className="text-xs text-slate-400">Belum ada FAQ.</p>
            )}
          </div>
        </div>
      )}

      {tab === "kontak" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Jam Operasional
            </label>
            <input
              type="text"
              value={form.openingHours ?? ""}
              onChange={(e) => set("openingHours", e.target.value)}
              placeholder="Senin–Sabtu 08.00–17.00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              URL Google Maps
            </label>
            <input
              type="text"
              value={form.googleMapsUrl ?? ""}
              onChange={(e) => set("googleMapsUrl", e.target.value)}
              placeholder="https://maps.google.com/…"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">
              Tempel URL embed atau berbagi lokasi toko Anda.
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Media Sosial
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={form.socialLinks.facebook ?? ""}
                onChange={(e) =>
                  set("socialLinks", {
                    ...form.socialLinks,
                    facebook: e.target.value,
                  })
                }
                placeholder="Facebook — https://facebook.com/…"
                className={inputCls}
              />
              <input
                type="text"
                value={form.socialLinks.instagram ?? ""}
                onChange={(e) =>
                  set("socialLinks", {
                    ...form.socialLinks,
                    instagram: e.target.value,
                  })
                }
                placeholder="Instagram — https://instagram.com/…"
                className={inputCls}
              />
              <input
                type="text"
                value={form.socialLinks.youtube ?? ""}
                onChange={(e) =>
                  set("socialLinks", {
                    ...form.socialLinks,
                    youtube: e.target.value,
                  })
                }
                placeholder="YouTube — https://youtube.com/…"
                className={inputCls}
              />
              <input
                type="text"
                value={form.socialLinks.tiktok ?? ""}
                onChange={(e) =>
                  set("socialLinks", {
                    ...form.socialLinks,
                    tiktok: e.target.value,
                  })
                }
                placeholder="TikTok — https://tiktok.com/@…"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {tab === "tema" && (
        <div className="space-y-5">
          {/* Warna utama */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Warna Utama Toko
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Dipakai pada tombol, badge, dan aksen di halaman toko publik.
            </p>
            <div className="flex flex-wrap gap-2.5 mb-4">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("primaryColor", c)}
                  aria-label={`Warna ${c}`}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-transform",
                    form.primaryColor.toLowerCase() === c.toLowerCase()
                      ? "border-slate-900 scale-110"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                aria-label="Pilih warna kustom"
                className="w-11 h-11 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className={`${inputCls} max-w-[160px] font-mono uppercase`}
              />
            </div>
          </div>

          {/* Template Hero */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Template Bagian Hero
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {HERO_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set("heroStyle", s.id)}
                  className={cn(
                    "text-left rounded-xl border p-3 transition-all",
                    form.heroStyle === s.id
                      ? "border-brand-600 ring-2 ring-brand-100"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <HeroPreview variant={s.id} />
                  <p className="font-bold text-sm text-slate-900 mt-2">
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Produk */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Template Daftar Produk
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {PRODUCT_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set("productStyle", s.id)}
                  className={cn(
                    "text-left rounded-xl border p-3 transition-all",
                    form.productStyle === s.id
                      ? "border-brand-600 ring-2 ring-brand-100"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <ProductPreview variant={s.id} />
                  <p className="font-bold text-sm text-slate-900 mt-2">
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <StyleSelect
            title="Template Keunggulan"
            options={ADVANTAGE_STYLES}
            value={form.advantagesStyle}
            onChange={(v) => set("advantagesStyle", v)}
            preview={(v) => <AdvantagePreview variant={v} />}
          />
          <StyleSelect
            title="Template Testimoni"
            options={TESTIMONIAL_STYLES}
            value={form.testimonialStyle}
            onChange={(v) => set("testimonialStyle", v)}
            preview={(v) => <TestimonialPreview variant={v} />}
          />
          <StyleSelect
            title="Template FAQ"
            options={FAQ_STYLES}
            value={form.faqStyle}
            onChange={(v) => set("faqStyle", v)}
            preview={(v) => <FaqPreview variant={v} />}
          />

          {/* Tampilan elemen */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Tampilan Elemen Toko
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Tampilkan atau sembunyikan elemen di halaman toko.
            </p>
            <div className="divide-y divide-slate-100">
              {ELEMENT_TOGGLES.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-slate-700">{t.label}</span>
                  <Toggle
                    on={form[t.key]}
                    onToggle={() => set(t.key, !form[t.key])}
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
