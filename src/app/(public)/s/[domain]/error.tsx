"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function StorefrontError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorView
      reset={reset}
      title="Toko sedang bermasalah"
      message="Halaman ini gagal dimuat. Silakan coba lagi sebentar."
    />
  );
}
