# Plan 6: Cascade Sponsorship & Notification Monetization

**Status:** Approved
**Priority:** Medium
**Epic:** DLG-SPONSOR-001 through DLG-SPONSOR-005
**Reference:** `docs/business-model.md`

---

## Overview

Create sponsorship products for cascade celebrations and hyperlocal notifications, plus the underlying push notification infrastructure.

---

## Current State

- Basic cascade celebration exists
- No push notification system
- No sponsorship for cascades or notifications
- No B2B monetization beyond business directory

---

## Business Model Context

From `docs/business-model.md`:
- **Cascade sponsorship:** $100-500 per cascade — businesses co-brand the celebration
- **Notification sponsorship:** Hyperlocal business placement in push notifications

---

## Cascade Sponsorship Tiers

| Tier | Price | Includes |
|------|-------|----------|
| Basic | $100 | Logo in cascade animation |
| Featured | $250 | Logo + custom message + link |
| Premium | $500 | Logo + message + link + featured placement + analytics |

---

## Schema Changes

```prisma
model CascadeSponsor {
  id            String   @id @default(cuid())

  // Sponsor details
  sponsorType   String   // business, corporate, matching_campaign
  businessId    String?
  campaignId    String?
  corporateName String?

  // Sponsorship configuration
  tier          String   // basic ($100), featured ($250), premium ($500)
  logoUrl       String?
  message       String?
  linkUrl       String?

  // Targeting
  categories    String?  // JSON array of project categories
  locations     String?  // JSON array of locations

  // Budget & scheduling
  budgetTotal   Float
  budgetUsed    Float    @default(0)
  costPerCascade Float
  startDate     DateTime
  endDate       DateTime?

  status        String   @default("active")
  createdAt     DateTime @default(now())

  business      BusinessListing? @relation(fields: [businessId], references: [id])
  campaign      MatchingCampaign? @relation(fields: [campaignId], references: [id])
  cascades      CascadeSponsorEvent[]

  @@index([status, startDate])
}

model CascadeSponsorEvent {
  id          String   @id @default(cuid())
  sponsorId   String
  projectId   String

  impressions Int      @default(0)
  clicks      Int      @default(0)

  createdAt   DateTime @default(now())

  sponsor     CascadeSponsor @relation(fields: [sponsorId], references: [id], onDelete: Cascade)
  project     Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([sponsorId])
}

model NotificationSponsor {
  id            String   @id @default(cuid())
  businessId    String

  message       String
  linkUrl       String?

  // Hyperlocal targeting
  latitude      Float
  longitude     Float
  radiusMeters  Int      @default(1000)

  notificationTypes String  // JSON array

  budgetTotal   Float
  budgetUsed    Float    @default(0)
  costPerNotification Float

  status        String   @default("active")
  createdAt     DateTime @default(now())

  business      BusinessListing @relation(fields: [businessId], references: [id])
  events        NotificationSponsorEvent[]

  @@index([status])
}

model NotificationSponsorEvent {
  id          String   @id @default(cuid())
  sponsorId   String
  userId      String

  notificationType String
  delivered   Boolean  @default(false)
  clicked     Boolean  @default(false)

  createdAt   DateTime @default(now())

  sponsor     NotificationSponsor @relation(fields: [sponsorId], references: [id], onDelete: Cascade)

  @@index([sponsorId])
}

model PushSubscription {
  id          String   @id @default(cuid())
  userId      String

  endpoint    String   @db.Text
  p256dh      String
  auth        String

  userAgent   String?

  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model NotificationPreference {
  id          String   @id @default(cuid())
  userId      String   @unique

  pushEnabled     Boolean @default(true)
  emailEnabled    Boolean @default(true)
  enabledTypes    String  // JSON array
  digestFrequency String  @default("instant")
  quietHoursStart Int?
  quietHoursEnd   Int?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## New Library Files

### `src/lib/cascade-sponsors.ts`
- `findCascadeSponsor(projectId)`
- `recordCascadeSponsorEvent(sponsorId, projectId, impressions)`
- `trackSponsorClick(eventId)`
- `createCascadeSponsor(data)`
- `getSponsorAnalytics(sponsorId)`

### `src/lib/notification-sponsors.ts`
- `findNotificationSponsor(userId, notificationType, userLocation)`
- `recordNotificationSponsorEvent(sponsorId, userId, type)`

### `src/lib/push-notifications.ts`
- `sendPushNotification(userId, notification)`
- `sendBulkPushNotifications(userIds, notification)`
- `subscribeUser(userId, subscription)`
- `unsubscribeUser(userId)`

### `src/lib/notification-composer.ts`
- `composeNotification(type, data, userId)`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/push/subscribe` | POST | Subscribe to push |
| `/api/push/unsubscribe` | POST | Unsubscribe |
| `/api/notifications/preferences` | GET/PUT | Preferences |
| `/api/admin/sponsors/cascade` | GET/POST | Manage cascade sponsors |
| `/api/admin/sponsors/cascade/[id]` | GET/PUT/DELETE | Individual sponsor |
| `/api/admin/sponsors/cascade/[id]/analytics` | GET | Analytics |
| `/api/admin/sponsors/notification` | GET/POST | Notification sponsors |
| `/api/sponsors/click/[eventId]` | POST | Track clicks |

---

## UI Components

- `src/components/cascade/sponsored-celebration.tsx`
- `src/components/notifications/push-permission.tsx`
- `src/components/notifications/notification-preferences.tsx`
- `src/components/admin/cascade-sponsor-form.tsx`
- `src/components/admin/sponsor-analytics.tsx`

---

## Push Notification Types

| Type | Trigger | Content |
|------|---------|---------|
| `cascade` | Project hits 100% | "🌊 CASCADE! {project} is fully funded!" |
| `almost_there` | Project hits 90% | "So close! {project} is 90% funded" |
| `rally` | Rally created/succeeded | "Rally for {project}" |
| `project_update` | Proposer posts update | "New update on {project}" |
| `loan_funded` | Loan fully funded | "Your loan was fully funded!" |
| `badge_earned` | User earns badge | "🏆 You earned {badge}!" |
| `mention` | User mentioned | "{user} mentioned you" |
| `follow` | Someone follows you | "{user} started following you" |

---

## Implementation Order

1. Schema migration
2. Push subscription infrastructure
3. Service worker setup
4. `push-notifications.ts`
5. Notification preferences UI
6. Permission request flow
7. `cascade-sponsors.ts`
8. Sponsored cascade celebration
9. Admin cascade sponsor management
10. `notification-sponsors.ts`
11. Admin notification sponsor management
12. Analytics dashboards
13. Click tracking
14. Onboarding integration

---

## Success Criteria

- [ ] Users can subscribe to push notifications
- [ ] Push notifications work for all types
- [ ] Cascade celebrations show sponsor branding
- [ ] Sponsors can target by category and location
- [ ] Notification sponsors work hyperlocally
- [ ] Click-through tracking works
- [ ] Admin can manage sponsors and view analytics
- [ ] Budget tracking auto-pauses exhausted sponsors

---

## Estimated Effort

3 implementation sessions
