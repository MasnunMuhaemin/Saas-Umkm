"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function SuperAdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorView reset={reset} />;
}
