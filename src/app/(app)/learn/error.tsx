"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function LearningError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Learning Error"
      message={error.message || "Something went wrong loading learning content."}
      onRetry={reset}
    />
  );
}
