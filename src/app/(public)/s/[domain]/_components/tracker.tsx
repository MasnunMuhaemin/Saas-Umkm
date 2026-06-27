"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Beacon analytics: kirim pageview ke /api/track saat halaman dibuka. */
export function Tracker({ domain }: { domain: string }) {
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [domain, pathname]);
  return null;
}
