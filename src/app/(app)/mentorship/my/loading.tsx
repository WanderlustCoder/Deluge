import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function MyMentorshipLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
