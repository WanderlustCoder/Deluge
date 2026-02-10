"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Account Error"
      message={error.message || "Something went wrong loading your account."}
      onRetry={reset}
    />
  );
}
