import { Skeleton } from "@/components/ui/skeleton";

export default function LearnDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50/20 dark:bg-dark-bg">
      <div className="bg-white border-b border-gray-200 dark:bg-dark-card dark:border-dark-border">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-7 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 dark:bg-dark-card dark:border-dark-border space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/3 mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
