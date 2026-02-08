"use client";

import { useEffect } from "react";
import { InstallPrompt } from "./install-prompt";
import { OfflineIndicator } from "./offline-indicator";
import { UpdateAvailable } from "./update-available";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      <OfflineIndicator />
      {children}
      <InstallPrompt />
      <UpdateAvailable />
    </>
  );
}
