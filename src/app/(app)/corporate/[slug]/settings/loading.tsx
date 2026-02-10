import { Skeleton } from "@/components/ui/skeleton";

export default function CorporateSettingsLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-7 w-28 mb-6" />
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-10 w-full rounded-lg mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
