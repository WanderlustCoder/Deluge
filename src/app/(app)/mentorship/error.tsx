"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function MentorshipError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Mentorship Error"
      message={error.message || "Something went wrong loading mentorship."}
      onRetry={reset}
    />
  );
}
