# Plan 9: Mobile PWA & Offline Experience

**Status:** Approved
**Priority:** Low
**Epic:** DLG-MOBILE-001 through DLG-MOBILE-004
**Reference:** Implied by "engaging, daily habit" vision

---

## Overview

Create an installable PWA with offline support and native-like experience on mobile devices.

---

## Current State

- Web app works on mobile (responsive)
- No PWA manifest
- No offline capability
- No push notifications on mobile
- No app-like navigation

---

## PWA Requirements

- Installable on home screen (iOS, Android, desktop)
- Offline viewing of cached content
- Background sync for queued actions
- Push notifications
- App-like navigation with bottom tabs

---

## New Files

### `public/manifest.json`

```json
{
  "name": "Deluge",
  "short_name": "Deluge",
  "description": "Community-driven giving platform",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#0D47A1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### `public/sw.js`

```javascript
const CACHE_NAME = 'deluge-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/projects',
  '/communities',
  '/offline',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch - network first, cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((cached) => cached || caches.match('/offline'));
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncQueuedActions());
  }
});
```

---

## New Library Files

### `src/lib/pwa.ts`
- `registerServiceWorker()`
- `unregisterServiceWorker()`
- `useInstallPrompt()` — Install prompt hook
- `useOnlineStatus()` — Online/offline detection
- `queueAction(action)` — Queue for offline
- `syncWhenOnline()`

### `src/lib/offline-storage.ts`
- IndexedDB wrapper using `idb`
- `getCachedProjects()`
- `cacheProjects(projects)`
- `getCachedCommunities()`
- `cacheCommunities(communities)`

---

## UI Components

### `src/components/pwa/install-prompt.tsx`
- "Add to Home Screen" banner
- Benefits explanation
- Install button
- Dismiss option

### `src/components/pwa/offline-indicator.tsx`
- Fixed banner when offline
- Queued actions count
- "Will sync when online"

### `src/components/pwa/mobile-nav.tsx`
- Bottom tab navigation
- Home, Projects, Communities, Impact, Account
- Active state indicator
- Notification badge

### `src/components/pwa/pull-to-refresh.tsx`
- Pull down gesture
- Refresh indicator

### `src/components/pwa/update-available.tsx`
- Toast when new version available
- "Update now" button

---

## Caching Strategy

| Content Type | Strategy | TTL |
|--------------|----------|-----|
| Static assets | Cache first | Indefinite |
| API data | Network first, cache fallback | 1 hour |
| User-specific data | Network first, cache fallback | 5 minutes |
| Images | Cache first | 1 day |

---

## Background Sync Actions

**Queue for sync:**
- Fund project
- Watch ad
- Post comment
- Follow/unfollow
- RSVP to event

**NOT queued (require connectivity):**
- Cash contribution
- Loan application
- Account changes

---

## Mobile Layout

### `src/components/layout/app-shell.tsx`

```typescript
export function AppShell({ children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isInstalled = useIsInstalledPWA();

  return (
    <div className="app-shell">
      {!isMobile && <Navbar />}
      <main className={isMobile ? 'pb-16' : ''}>{children}</main>
      {isMobile && <MobileNav />}
      <OfflineIndicator />
    </div>
  );
}
```

---

## Implementation Order

1. PWA manifest and icons
2. Basic service worker with static caching
3. Service worker registration
4. Install prompt component
5. Offline indicator
6. IndexedDB storage layer
7. Project/community caching
8. Mobile navigation component
9. App shell with conditional layout
10. Pull-to-refresh
11. Background sync for actions
12. Offline page
13. Update notification
14. Testing on iOS and Android

---

## Testing Checklist

- [ ] Installable on iOS Safari
- [ ] Installable on Android Chrome
- [ ] Installable on desktop Chrome/Edge
- [ ] Works offline (cached content)
- [ ] Queued actions sync when online
- [ ] Push notifications work on mobile
- [ ] Bottom nav shows on mobile only
- [ ] Pull-to-refresh works
- [ ] Update prompt appears for new versions

---

## Success Criteria

- [ ] PWA installable on all platforms
- [ ] Offline access to cached projects and communities
- [ ] Actions queue and sync when reconnected
- [ ] Mobile has native-like bottom navigation
- [ ] Pull-to-refresh works on feed pages
- [ ] Install prompt shows for uninstalled users
- [ ] Update available notification works

---

## Estimated Effort

2-3 implementation sessions
