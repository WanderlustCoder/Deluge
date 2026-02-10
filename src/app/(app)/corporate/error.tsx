"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function CorporateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Corporate Portal Error"
      message={error.message || "Something went wrong loading the corporate portal."}
      onRetry={reset}
    />
  );
}
