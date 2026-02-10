import { Skeleton } from "@/components/ui/skeleton";

export default function AccessibilityLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-8">
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-36 mb-3" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-48" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full mt-6 rounded-lg" />
    </div>
  );
}
