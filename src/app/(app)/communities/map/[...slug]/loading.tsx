import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function CommunityMapDetailLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-dark-card dark:border-dark-border">
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
