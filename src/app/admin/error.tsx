"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Admin Error"
      message={error.message || "Something went wrong in the admin panel."}
      onRetry={reset}
    />
  );
}
