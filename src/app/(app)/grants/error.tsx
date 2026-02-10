"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function GrantsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Grants Error"
      message={error.message || "Something went wrong loading grants."}
      onRetry={reset}
    />
  );
}
