import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function FindMentorLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-44 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <Skeleton className="h-10 w-full rounded-lg mb-6" />
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
