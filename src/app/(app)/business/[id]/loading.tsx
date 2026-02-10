import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-48 w-full" />
        <div className="p-6">
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-1/2 mb-2" />
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 dark:bg-dark-elevated">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
