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
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden border border-gray-100">
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
            <ShoppingBag size={80} className="text-gray-300" />
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
              className={`relative w-20 h-20 flex-none rounded-xl overflow-hidden border-2 transition-colors ${
                active === i ? "border-primary" : "border-transparent"
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
