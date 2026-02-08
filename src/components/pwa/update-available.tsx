"use client";

import { useUpdateAvailable } from "@/lib/pwa";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function UpdateAvailable() {
  const { updateAvailable, applyUpdate } = useUpdateAvailable();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-ocean text-white rounded-lg shadow-lg p-4 flex items-center gap-4">
        <RefreshCw className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">New version available!</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={applyUpdate}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
