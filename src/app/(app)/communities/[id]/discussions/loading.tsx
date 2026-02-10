import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function DiscussionsLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
