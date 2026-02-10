import { Skeleton } from "@/components/ui/skeleton";

export default function NewCircleLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-52 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
