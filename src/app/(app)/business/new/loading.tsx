import { Skeleton } from "@/components/ui/skeleton";

export default function NewBusinessLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
