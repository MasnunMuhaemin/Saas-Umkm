"use client";

import { useState } from "react";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { buildWaLink } from "@/lib/helpers/whatsapp";

export function BuyBox({
  productName,
  phone,
  showQty = true,
  showWhatsapp = true,
}: {
  productName: string;
  phone: string;
  showQty?: boolean;
  showWhatsapp?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const href = phone
    ? buildWaLink(phone, `Halo, saya ingin pesan ${qty} unit ${productName}.`)
    : null;

  return (
    <div className="flex items-center gap-4">
      {showQty && (
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
  );
}
