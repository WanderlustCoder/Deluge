import { Skeleton } from "@/components/ui/skeleton";

export default function NewCommunityLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-56 mb-6" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
