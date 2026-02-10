"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function CirclesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Giving Circles Error"
      message={error.message || "Something went wrong loading giving circles."}
      onRetry={reset}
    />
  );
}
