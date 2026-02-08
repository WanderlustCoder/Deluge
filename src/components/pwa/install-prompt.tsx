"use client";

import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/lib/pwa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function InstallPrompt() {
  const { isInstallable, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      const dismissedAt = new Date(wasDismissed);
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSince < 7) {
        setDismissed(true);
      }
    }

    // Show prompt after 3 seconds if installable
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setDismissed(true);
    }
  };

  if (!showPrompt || dismissed || isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-ocean/20">
        <CardContent className="pt-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-storm-light hover:text-storm"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-ocean/10 rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-ocean" />
            </div>
            <div>
              <h3 className="font-semibold text-storm mb-1">Install Deluge</h3>
              <p className="text-sm text-storm-light mb-3">
                Add to your home screen for quick access and offline support.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
