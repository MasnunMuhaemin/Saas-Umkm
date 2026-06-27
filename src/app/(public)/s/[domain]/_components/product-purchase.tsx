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
          <p className="text-sm font-bold text-gray-700 mb-2">Pilih Varian</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVariantId("")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                variantId === ""
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Standar
            </button>
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-40 ${
                  variantId === v.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
          <p className="text-4xl font-black text-gray-900">
            {formatRupiah(price)}
          </p>
          {showDiscount && originalPrice && discount > 0 && (
            <p className="text-lg text-gray-400 line-through mb-1">
              {formatRupiah(originalPrice)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {showPrice && (
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
            >
              <Minus size={16} />
            </button>
            <span className="w-14 text-center font-bold">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
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
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-semibold text-lg transition-colors hover:opacity-90"
          >
            <MessageCircle size={18} /> Pesan {qty} Unit
          </a>
        )}
      </div>

      {showStock && (
        <p className="text-sm text-gray-500">
          Stok tersedia:{" "}
          <span className="font-semibold text-gray-900">{stock}</span>
        </p>
      )}
    </div>
  );
}
