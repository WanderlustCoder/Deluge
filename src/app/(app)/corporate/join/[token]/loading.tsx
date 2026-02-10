import { Skeleton } from "@/components/ui/skeleton";

export default function CorporateJoinLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center dark:bg-dark-card dark:border-dark-border">
        <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
        <Skeleton className="h-7 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto mb-6" />
        <Skeleton className="h-16 w-full rounded-lg mb-4" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
