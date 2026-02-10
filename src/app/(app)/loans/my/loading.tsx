import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function MyLoansLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-36 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
