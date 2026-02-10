import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ScenariosLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-8 px-4 mb-6 rounded-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-52" />
      </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
