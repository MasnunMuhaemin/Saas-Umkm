import { Skeleton, CardSkeleton } from "@/components/shared/skeleton";

export default function SuperAdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-52" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
