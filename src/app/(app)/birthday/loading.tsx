import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function BirthdayLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-7 w-52" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-44 mb-4" />
      <div className="space-y-4 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
