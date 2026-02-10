import { Skeleton } from "@/components/ui/skeleton";

export default function GiveGiftLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg mt-6" />
    </div>
  );
}
