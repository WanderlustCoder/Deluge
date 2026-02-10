import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-64 rounded-lg" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
