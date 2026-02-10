import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-8 px-4 mb-6 rounded-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
