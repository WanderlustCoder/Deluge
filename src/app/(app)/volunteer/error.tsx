"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function VolunteerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Volunteer Error"
      message={error.message || "Something went wrong loading volunteer opportunities."}
      onRetry={reset}
    />
  );
}
