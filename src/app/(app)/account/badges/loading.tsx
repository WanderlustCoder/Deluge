import { Skeleton } from "@/components/ui/skeleton";

export default function BadgesLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
