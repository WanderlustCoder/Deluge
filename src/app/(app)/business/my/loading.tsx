import { Skeleton } from "@/components/ui/skeleton";

export default function MyBusinessLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 dark:bg-dark-card dark:border-dark-border">
            <Skeleton className="w-32 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
