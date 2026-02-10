import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function AdvocateResourcesLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-52 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg mb-6" />
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
