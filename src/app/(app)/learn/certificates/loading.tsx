import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function LearningCertificatesLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-8 px-4 mb-6 rounded-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-52 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
