"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div>
      <div className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-card">
        {main ? (
          <Image
            src={main}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={80} className="text-slate-300" />
          </div>
        )}
        {children}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1}`}
              className={`relative w-20 h-20 flex-none rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                active === i
                  ? "border-primary ring-2 ring-primary/20 scale-[1.03] shadow-soft"
                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
