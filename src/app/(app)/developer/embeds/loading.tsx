import { Skeleton } from "@/components/ui/skeleton";

export default function EmbedsLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <Skeleton className="h-8 w-44 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
