import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function StudyCirclesLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-8 px-4 mb-6 rounded-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="container mx-auto px-4">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-10 w-full max-w-md mb-4 rounded-lg" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
