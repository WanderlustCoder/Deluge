import { Skeleton } from "@/components/ui/skeleton";

export default function SubmitStoryLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
            {i < 2 && <Skeleton className="h-0.5 w-8" />}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
