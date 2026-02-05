import { CardSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <CardSkeleton />
      <div className="mt-6">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
