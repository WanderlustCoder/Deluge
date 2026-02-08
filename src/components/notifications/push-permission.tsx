"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

interface PushPermissionProps {
  onDismiss?: () => void;
  variant?: "banner" | "card" | "modal";
  className?: string;
}

export function PushPermission({
  onDismiss,
  variant = "card",
  className = "",
}: PushPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  useEffect(() => {
    // Check current permission state
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Check if dismissed in localStorage
    const wasDismissed = localStorage.getItem("push-permission-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }

    // Fetch VAPID key
    fetch("/api/push/vapid-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.publicKey) {
          setVapidKey(data.publicKey);
        }
      })
      .catch(() => {});
  }, []);

  async function handleEnable() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    setLoading(true);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey || undefined,
      });

      // Send to server
      const subJson = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: {
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
          },
        }),
      });

      handleDismiss();
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      alert("Failed to enable push notifications. Please try again.");
    }

    setLoading(false);
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("push-permission-dismissed", "true");
    onDismiss?.();
  }

  // Don't show if:
  // - Already granted
  // - Already denied (can't ask again)
  // - Already dismissed
  // - Not supported
  if (
    dismissed ||
    permission === "granted" ||
    permission === "denied" ||
    !("Notification" in window)
  ) {
    return null;
  }

  if (variant === "banner") {
    return (
      <div
        className={`bg-ocean text-white px-4 py-3 flex items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Get notified when projects hit their funding goals!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleEnable}
            loading={loading}
          >
            Enable
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-ocean/10 rounded-lg">
            <Bell className="h-6 w-6 text-ocean" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-storm mb-1">
              Stay in the loop
            </h3>
            <p className="text-sm text-storm-light mb-4">
              Get notified when projects cascade, rallies succeed, and your
              loans get funded.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable} loading={loading}>
                Enable Notifications
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
