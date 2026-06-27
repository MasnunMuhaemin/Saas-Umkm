"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Package,
  Store,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type Initial = {
  name: string;
  slug: string;
  whatsapp: string;
  description: string;
  logo: string;
};

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "tokopintar.id";

export function OnboardingWizard({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 — profil toko
  const [name, setName] = useState(initial.name);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [description, setDescription] = useState(initial.description);
  const [logo, setLogo] = useState(initial.logo);
  const [nameErr, setNameErr] = useState("");

  // Step 2 — produk pertama (opsional)
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pStock, setPStock] = useState("");

  const complete = trpc.onboarding.complete.useMutation({
    onSuccess: () => {
      toast.success("Toko Anda siap! Selamat datang 🎉");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const next = () => {
    if (step === 0) {
      if (!name.trim()) {
        setNameErr("Nama toko wajib diisi");
        return;
      }
      setNameErr("");
    }
    setStep((s) => s + 1);
  };

  const finish = () => {
    const hasProduct = pName.trim().length > 0;
    if (hasProduct && !pPrice.trim()) {
      toast.error("Isi harga produk, atau kosongkan namanya untuk melewati.");
      return;
    }
    complete.mutate({
      name: name.trim(),
      whatsapp: whatsapp.trim() || null,
      description: description.trim() || null,
      logo: logo.trim() || null,
      product: hasProduct
        ? {
            name: pName.trim(),
            price: Number(pPrice) || 0,
            stock: Number(pStock) || 0,
          }
        : null,
    });
  };

  const inputCls =
    "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 bg-slate-50 focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step
                  ? "bg-brand-600"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="glass-card rounded-3xl p-7 shadow-float">
          {step === 0 && (
            <div>
              <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                <Store size={24} />
              </div>
              <h1 className="font-display text-xl font-extrabold text-slate-900 mb-1">
                Siapkan Toko Anda
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                Beberapa info dasar agar toko langsung tampil profesional.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nama Toko *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Toko Kue Bunda"
                    aria-invalid={!!nameErr}
                    className={`${inputCls} ${
                      nameErr ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  {nameErr && (
                    <p className="text-xs text-red-500 mt-1">{nameErr}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Alamat toko:{" "}
                    <span className="font-mono text-slate-500">
                      {initial.slug}.{ROOT}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nomor WhatsApp{" "}
                    <span className="text-brand-600">(disarankan)</span>
                  </label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="08123456789"
                    className={inputCls}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Semua pesanan pelanggan masuk ke nomor ini.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Toko kue rumahan dengan bahan premium…"
                    rows={2}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    URL Logo (opsional)
                  </label>
                  <input
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://…/logo.png"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                onClick={next}
                className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                <Package size={24} />
              </div>
              <h1 className="font-display text-xl font-extrabold text-slate-900 mb-1">
                Tambah Produk Pertama
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                Opsional — bisa dilewati dan ditambah nanti dari dashboard.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nama Produk
                  </label>
                  <input
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Contoh: Nastar Premium"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="65000"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Stok
                    </label>
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      placeholder="0"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={finish}
                  disabled={complete.isPending}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {complete.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {pName.trim() ? "Simpan & Selesai" : "Lewati & Selesai"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
