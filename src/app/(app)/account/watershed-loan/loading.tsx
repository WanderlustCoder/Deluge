import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function WatershedLoanLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <CardSkeleton />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <CardSkeleton />
    </div>
  );
}
