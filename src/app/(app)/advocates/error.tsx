"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AdvocatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Advocates Error"
      message={error.message || "Something went wrong loading advocates."}
      onRetry={reset}
    />
  );
}
