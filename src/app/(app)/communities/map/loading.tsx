import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityMapLoading() {
  return (
    <div className="flex h-[calc(100vh-12rem)]">
      <div className="flex-1">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      <div className="w-80 border-l border-gray-200 dark:border-dark-border p-4 space-y-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto pt-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
