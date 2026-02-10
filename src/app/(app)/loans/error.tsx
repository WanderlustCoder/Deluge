"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function LoansError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Loans Error"
      message={error.message || "Something went wrong loading loans."}
      onRetry={reset}
    />
  );
}
