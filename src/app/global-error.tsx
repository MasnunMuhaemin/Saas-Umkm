"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <ErrorView reset={reset} />
      </body>
    </html>
  );
}
