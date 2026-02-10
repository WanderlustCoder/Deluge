import { Skeleton } from "@/components/ui/skeleton";

export default function ReflectLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-8 px-4 mb-6 rounded-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-dark-card dark:border-dark-border">
          <Skeleton className="h-5 w-36 mb-3" />
          <Skeleton className="h-16 w-full rounded-lg mb-4" />
          <Skeleton className="h-32 w-full rounded-lg mb-3" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-5 w-40 mb-2" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-dark-card dark:border-dark-border">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
