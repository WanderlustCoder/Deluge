"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function DeveloperError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Developer Portal Error"
      message={error.message || "Something went wrong loading the developer portal."}
      onRetry={reset}
    />
  );
}
