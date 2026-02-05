"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong"
      message={error.message || "An unexpected error occurred in the app."}
      onRetry={reset}
    />
  );
}
