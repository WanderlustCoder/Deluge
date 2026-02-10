import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 rounded-xl p-8 mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
