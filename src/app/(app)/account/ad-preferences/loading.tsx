import { Skeleton } from "@/components/ui/skeleton";

export default function AdPreferencesLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-12 w-full rounded-lg mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-6 rounded-lg" />
      </div>
    </div>
  );
}
