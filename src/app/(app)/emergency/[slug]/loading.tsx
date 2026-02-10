import { Skeleton } from "@/components/ui/skeleton";

export default function EmergencyDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="mb-8">
        <Skeleton className="h-8 w-3/4 mb-3" />
        <div className="flex flex-wrap gap-4 mb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-28 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
