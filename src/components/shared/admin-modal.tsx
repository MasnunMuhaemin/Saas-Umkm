"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal shell premium untuk dashboard super admin/merchant.
 * Backdrop halus + kartu putih rounded-2xl + judul Inter. Tutup via klik luar
 * atau tombol X. `title` opsional (dialog konfirmasi tak memakainya).
 */
export function AdminModal({
  onClose,
  title,
  size = "md",
  children,
}: {
  onClose: () => void;
  title?: string;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  return (
    <div
      className="admin fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[3px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full animate-fade-up rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-neutral-950/[0.06]",
          size === "sm" ? "max-w-sm" : "max-w-md",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="-mr-1 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
