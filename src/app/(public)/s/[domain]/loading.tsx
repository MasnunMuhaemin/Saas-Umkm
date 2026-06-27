import { Skeleton } from "@/components/shared/skeleton";

export default function StorefrontLoading() {
  return (
    <div>
      <Skeleton className="h-[420px] w-full rounded-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
