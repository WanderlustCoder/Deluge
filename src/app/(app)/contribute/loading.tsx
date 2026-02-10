import { Skeleton } from "@/components/ui/skeleton";

export default function ContributeLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
