"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { validateImage } from "@/lib/helpers/upload";

/** Upload 1 file gambar → kembalikan URL publik. Throw bila gagal. */
export async function uploadImage(file: File): Promise<string> {
  const v = validateImage(file);
  if (!v.ok) throw new Error(v.error ?? "File tidak valid.");
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Gagal mengunggah.");
  return data.url;
}

const SIZE = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  wide: "w-full aspect-video",
} as const;

/** Pemilih + uploader 1 gambar (tampilkan preview, tombol upload, hapus). */
export function ImageUpload({
  value,
  onChange,
  size = "md",
  hint,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  size?: keyof typeof SIZE;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file: File) {
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className={`relative ${SIZE[size]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Foto"
            className="w-full h-full rounded-xl object-cover border border-slate-200 bg-slate-50"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Hapus foto"
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600"
          >
            <X size={13} />
          </button>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs py-1 rounded-b-xl font-medium hover:bg-black/70"
          >
            {busy ? "Mengunggah…" : "Ganti"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className={`${SIZE[size]} rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand-400 flex flex-col items-center justify-center gap-1.5 text-slate-500 transition-colors disabled:opacity-60`}
        >
          {busy ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <ImagePlus size={22} />
          )}
          <span className="text-xs font-medium">
            {busy ? "Mengunggah…" : "Upload Foto"}
          </span>
        </button>
      )}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}
