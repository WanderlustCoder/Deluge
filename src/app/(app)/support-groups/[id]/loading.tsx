import { Skeleton } from "@/components/ui/skeleton";

export default function SupportGroupDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 dark:bg-dark-card dark:border-dark-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-6 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full rounded-lg mb-3" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
