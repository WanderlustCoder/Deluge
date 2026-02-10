"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function CommunitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Communities Error"
      message={error.message || "Something went wrong loading communities."}
      onRetry={reset}
    />
  );
}
