/**
 * Deluge Service Worker
 *
 * Handles push notifications, offline caching, and background sync.
 */

const CACHE_NAME = "deluge-v1";
const STATIC_CACHE = "deluge-static-v1";
const DYNAMIC_CACHE = "deluge-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/dashboard",
  "/projects",
  "/communities",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log("[SW] Some assets failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event - network first with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;

  // Skip API requests
  if (request.url.includes("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback to offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// Background sync event
self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event:", event.tag);
  if (event.tag === "sync-actions") {
    event.waitUntil(syncQueuedActions());
  }
});

async function syncQueuedActions() {
  // Get queued actions from IndexedDB and replay them
  // This is a stub - actual implementation would use IndexedDB
  console.log("[SW] Syncing queued actions...");
}

// Push notification event
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) {
    console.log("[SW] No data in push notification");
    return;
  }

  let notification;
  try {
    notification = event.data.json();
  } catch (e) {
    notification = {
      title: "Deluge",
      body: event.data.text(),
    };
  }

  const options = {
    body: notification.body,
    icon: notification.icon || "/icons/icon-192.png",
    badge: notification.badge || "/icons/badge-72.png",
    image: notification.image,
    tag: notification.tag,
    requireInteraction: notification.requireInteraction || false,
    data: notification.data || {},
    actions: notification.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);
  event.notification.close();

  const data = event.notification.data || {};

  // Handle action clicks
  if (event.action === "sponsor" && data.sponsorLink) {
    // Track sponsor click
    if (data.sponsorEventId) {
      fetch(`/api/sponsors/click/${data.sponsorEventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notification" }),
      }).catch(() => {});
    }

    event.waitUntil(clients.openWindow(data.sponsorLink));
    return;
  }

  // Determine URL to open based on notification type
  let url = "/dashboard";
  const type = data.type;

  switch (type) {
    case "cascade":
    case "almost_there":
    case "project_update":
      url = `/projects/${data.projectId}`;
      break;
    case "rally":
    case "rally_succeeded":
      url = `/projects/${data.projectId}?rally=${data.rallyId}`;
      break;
    case "loan_funded":
    case "loan_payment":
      url = `/loans/${data.loanId}`;
      break;
    case "badge_earned":
      url = "/account/badges";
      break;
    case "mention":
      url = `/communities/${data.communityId}`;
      break;
    case "follow":
      url = data.actorId ? `/users/${data.actorId}` : "/account";
      break;
    case "community_milestone":
      url = `/communities/${data.communityId}`;
      break;
    case "referral_signup":
    case "referral_activated":
      url = "/account/referrals";
      break;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});
