import { Skeleton } from "@/components/ui/skeleton";

export default function DeveloperLoading() {
  return (
    <div>
      <div className="bg-gradient-to-r from-ocean/10 to-teal/10 py-12 px-4 rounded-xl mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
