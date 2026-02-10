"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Business Directory Error"
      message={error.message || "Something went wrong loading the business directory."}
      onRetry={reset}
    />
  );
}
