import { Skeleton } from "@/components/ui/skeleton";

export default function OfflineLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md space-y-4">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-7 w-40 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto rounded-lg" />
      </div>
    </div>
  );
}
