import { Skeleton } from "@/components/ui/skeleton";

export default function GiftCardsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-36 mb-6" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-9 w-36 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[1.6] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg bg-gray-50 dark:bg-dark-elevated" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
