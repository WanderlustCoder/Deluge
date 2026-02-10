import { Skeleton } from "@/components/ui/skeleton";

export default function CorporateCampaignDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
      </div>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-6 w-44 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
