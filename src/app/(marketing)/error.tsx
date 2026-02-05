"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Page Error"
      message={error.message || "Something went wrong loading this page."}
      onRetry={reset}
    />
  );
}
