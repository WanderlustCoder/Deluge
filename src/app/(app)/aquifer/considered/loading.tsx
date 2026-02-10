import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function AquiferConsideredLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="mb-8">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
