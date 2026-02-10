import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function PrivacyLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-10 w-full mt-6 rounded-lg" />
    </div>
  );
}
