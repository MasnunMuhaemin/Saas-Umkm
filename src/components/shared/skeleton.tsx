import { cn } from "@/lib/utils";

/** Placeholder ber-animasi pulse untuk loading state. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-gray-200/70", className)} />
  );
}

/** Skeleton baris kartu KPI (dipakai dashboard loading). */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
