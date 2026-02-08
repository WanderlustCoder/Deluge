import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ImpactLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Hero stat skeleton */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-8 mb-8">
        <div className="text-center">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-12 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>

      {/* Tab switcher skeleton */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
