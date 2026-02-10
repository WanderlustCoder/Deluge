import { Skeleton } from "@/components/ui/skeleton";

export default function AquiferDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
