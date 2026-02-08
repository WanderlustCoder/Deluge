"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-storm/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-storm-light" />
        </div>

        <h1 className="font-heading font-bold text-2xl text-storm mb-2">
          You&apos;re Offline
        </h1>

        <p className="text-storm-light mb-6">
          It looks like you&apos;ve lost your internet connection. Some cached
          content may still be available, but live features require connectivity.
        </p>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <p className="text-sm text-storm-light">
            Any actions you attempted will be saved and synced when you&apos;re
            back online.
          </p>
        </div>
      </div>
    </div>
  );
}
