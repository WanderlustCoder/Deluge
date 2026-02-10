import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function OccasionDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-48 w-full rounded-xl mb-8" />
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-10 w-40 mx-auto rounded-lg" />
      </div>
    </div>
  );
}
