"use client";

import { useState } from "react";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { buildWaLink } from "@/lib/helpers/whatsapp";
import { formatRupiah } from "@/lib/helpers/format";

type Variant = { id: string; name: string; price: number; stock: number };

export function ProductPurchase({
  productName,
  basePrice,
  originalPrice,
  baseStock,
  variants,
  phone,
  showPrice,
  showStock,
  showDiscount,
  showWhatsapp,
}: {
  productName: string;
  basePrice: number;
  originalPrice: number | null;
  baseStock: number;
  variants: Variant[];
  phone: string;
  showPrice: boolean;
  showStock: boolean;
  showDiscount: boolean;
  showWhatsapp: boolean;
}) {
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const price = selected ? selected.price : basePrice;
  const stock = selected ? selected.stock : baseStock;
  const name = selected ? `${productName} - ${selected.name}` : productName;
  const discount =
    originalPrice && !selected && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  const href = phone
    ? buildWaLink(phone, `Halo, saya ingin pesan ${qty} unit ${name}.`)
    : null;

  return (
    <div className="space-y-6">
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2.5">Pilih Varian</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVariantId("")}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-[0.97] ${
                variantId === ""
                  ? "border-primary text-primary bg-primary/10 shadow-soft"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Standar
            </button>
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${
                  variantId === v.id
                    ? "border-primary text-primary bg-primary/10 shadow-soft"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPrice && (
        <div className="flex items-end gap-3">
          <p className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(price)}
          </p>
          {showDiscount && originalPrice && discount > 0 && (
            <p className="text-lg text-slate-400 line-through mb-1">
              {formatRupiah(originalPrice)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {showPrice && (
          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Kurangi jumlah"
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="w-14 text-center font-display font-bold text-slate-900">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Tambah jumlah"
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
        {showWhatsapp && href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-float transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <MessageCircle size={18} /> Pesan {qty} Unit
          </a>
        )}
      </div>

      {showStock && (
        <p className="text-sm text-slate-500">
          Stok tersedia:{" "}
          <span className="font-display font-bold text-slate-900">{stock}</span>
        </p>
      )}
    </div>
  );
}
