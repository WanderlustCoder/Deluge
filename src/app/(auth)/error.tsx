"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Authentication Error"
      message={error.message || "Something went wrong during authentication."}
      onRetry={reset}
    />
  );
}
