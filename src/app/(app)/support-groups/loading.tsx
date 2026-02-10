import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function SupportGroupsLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="flex gap-4 overflow-x-auto mb-6 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="flex-shrink-0 w-56 h-28 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
