"use client";

import { useOnlineStatus } from "@/lib/pwa";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gold text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
      <WifiOff className="h-4 w-4" />
      <span>You&apos;re offline. Some features may be limited.</span>
    </div>
  );
}
