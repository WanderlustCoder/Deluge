import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ChallengeDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-7 w-2/3 mb-3" />
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-5 w-20 rounded-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <CardSkeleton />
    </div>
  );
}
