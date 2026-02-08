# Plan 36: Notification & Communication Center

## Overview

Comprehensive notification system with multi-channel delivery, smart batching, user preferences, and a unified inbox. Ensure users never miss important updates while respecting their attention and preferences.

**Core Principle:** Right message, right channel, right time.

---

## Phase 1: Notification Infrastructure

### 1A. Notification Schema

**Goal:** Unified notification system.

**Schema Addition:**

```prisma
model Notification {
  id              String   @id @default(cuid())
  userId          String
  type            String   // funding, milestone, loan, community, system
  category        String   // action_required, update, celebration, reminder
  title           String
  body            String
  richBody        Json?    // Rich content with links, images
  actionUrl       String?
  actionLabel     String?
  priority        String   @default("normal") // low, normal, high, urgent
  entityType      String?  // project, loan, community
  entityId        String?
  metadata        Json?
  channels        String[] // in_app, email, push, sms
  status          String   @default("pending") // pending, sent, read, archived
  readAt          DateTime?
  archivedAt      DateTime?
  expiresAt       DateTime?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
  @@index([userId, type, status])
  @@index([entityType, entityId])
}

model NotificationDelivery {
  id              String   @id @default(cuid())
  notificationId  String
  channel         String   // email, push, sms
  status          String   @default("pending") // pending, sent, delivered, failed, bounced
  provider        String?  // sendgrid, twilio, firebase
  providerMessageId String?
  sentAt          DateTime?
  deliveredAt     DateTime?
  failedAt        DateTime?
  errorMessage    String?
  retryCount      Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([notificationId])
  @@index([channel, status])
}
```

**Files:**
- `src/lib/notifications/index.ts` - Core notification logic
- `src/lib/notifications/types.ts` - Notification type definitions
- `src/lib/notifications/create.ts` - Create notifications
- `src/app/api/notifications/route.ts`

### 1B. Channel Providers

**Goal:** Multi-channel delivery.

**Files:**
- `src/lib/notifications/channels/index.ts` - Channel interface
- `src/lib/notifications/channels/in-app.ts`
- `src/lib/notifications/channels/email.ts`
- `src/lib/notifications/channels/push.ts`
- `src/lib/notifications/channels/sms.ts`
- `src/lib/notifications/providers/sendgrid.ts`
- `src/lib/notifications/providers/twilio.ts`
- `src/lib/notifications/providers/firebase.ts`

### 1C. Delivery Engine

**Goal:** Reliable delivery with retries.

**Files:**
- `src/lib/notifications/delivery.ts` - Delivery logic
- `src/lib/notifications/queue.ts` - Queue management
- `src/lib/notifications/retry.ts` - Retry logic
- Background job for processing queue

---

## Phase 2: User Preferences

### 2A. Preference Schema

**Goal:** Granular notification control.

**Schema Addition:**

```prisma
model NotificationPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  globalEnabled   Boolean  @default(true)
  emailEnabled    Boolean  @default(true)
  pushEnabled     Boolean  @default(true)
  smsEnabled      Boolean  @default(false)
  quietHoursStart String?  // "22:00"
  quietHoursEnd   String?  // "08:00"
  timezone        String   @default("America/Los_Angeles")
  digestFrequency String   @default("daily") // realtime, daily, weekly, none
  digestTime      String   @default("09:00")
  preferences     Json     // Per-type preferences
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NotificationChannel {
  id          String   @id @default(cuid())
  userId      String
  channel     String   // push, sms
  identifier  String   // device token, phone number
  name        String?  // "iPhone", "Work Phone"
  isVerified  Boolean  @default(false)
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, channel, identifier])
  @@index([userId, channel])
}
```

**Files:**
- `src/lib/notifications/preferences.ts`
- `src/app/api/notifications/preferences/route.ts`
- `src/app/(app)/account/notifications/page.tsx`
- `src/components/notifications/preference-form.tsx`
- `src/components/notifications/channel-manager.tsx`

### 2B. Smart Routing

**Goal:** Route to best channel.

**Files:**
- `src/lib/notifications/routing.ts`
- `src/lib/notifications/quiet-hours.ts`
- `src/lib/notifications/urgency.ts`
- Fallback logic when primary channel fails

### 2C. Unsubscribe Management

**Goal:** Easy unsubscribe options.

**Files:**
- `src/lib/notifications/unsubscribe.ts`
- `src/app/unsubscribe/[token]/page.tsx`
- `src/components/notifications/unsubscribe-link.tsx`
- One-click unsubscribe in emails

---

## Phase 3: Notification Inbox

### 3A. Inbox UI

**Goal:** Central notification center.

**Files:**
- `src/app/(app)/notifications/page.tsx` - Full inbox
- `src/components/notifications/inbox.tsx`
- `src/components/notifications/notification-list.tsx`
- `src/components/notifications/notification-item.tsx`
- `src/components/notifications/notification-filters.tsx`

### 3B. Notification Bell

**Goal:** Quick access notification bell.

**Files:**
- `src/components/notifications/notification-bell.tsx`
- `src/components/notifications/notification-dropdown.tsx`
- `src/components/notifications/unread-badge.tsx`
- Real-time update via polling or WebSocket

### 3C. Bulk Actions

**Goal:** Manage multiple notifications.

**Files:**
- `src/lib/notifications/bulk.ts`
- `src/app/api/notifications/bulk/route.ts`
- `src/components/notifications/bulk-actions.tsx`
- Mark all read, archive old, etc.

---

## Phase 4: Smart Batching

### 4A. Digest System

**Goal:** Batch notifications into digests.

**Schema Addition:**

```prisma
model NotificationDigest {
  id              String   @id @default(cuid())
  userId          String
  frequency       String   // daily, weekly
  periodStart     DateTime
  periodEnd       DateTime
  notificationIds String[]
  status          String   @default("pending") // pending, sent
  sentAt          DateTime?
  createdAt       DateTime @default(now())

  @@index([userId, frequency, periodStart])
  @@index([status])
}
```

**Files:**
- `src/lib/notifications/digest.ts`
- `src/lib/notifications/digest-builder.ts`
- `src/lib/notifications/digest-templates.ts`
- Cron job for digest generation

### 4B. Grouping Logic

**Goal:** Smart notification grouping.

**Files:**
- `src/lib/notifications/grouping.ts`
- `src/lib/notifications/aggregation.ts`
- "5 people funded your project" instead of 5 separate notifications

### 4C. Throttling

**Goal:** Prevent notification overload.

**Files:**
- `src/lib/notifications/throttle.ts`
- `src/lib/notifications/rate-limit.ts`
- Max notifications per hour/day
- Combine rapid-fire events

---

## Phase 5: Notification Templates

### 5A. Template System

**Goal:** Consistent, branded notifications.

**Schema Addition:**

```prisma
model NotificationTemplate {
  id              String   @id @default(cuid())
  name            String   @unique
  type            String
  subject         String?  // For email
  titleTemplate   String
  bodyTemplate    String
  richBodyTemplate Json?
  emailTemplate   String?  // HTML template ID
  pushTemplate    Json?
  smsTemplate     String?
  variables       String[] // Required variables
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Files:**
- `src/lib/notifications/templates/index.ts`
- `src/lib/notifications/templates/renderer.ts`
- `src/lib/notifications/templates/variables.ts`
- Pre-defined templates for all notification types

### 5B. Email Templates

**Goal:** Beautiful email notifications.

**Files:**
- `src/lib/notifications/email-templates/base.tsx`
- `src/lib/notifications/email-templates/funding.tsx`
- `src/lib/notifications/email-templates/digest.tsx`
- `src/lib/notifications/email-templates/transactional.tsx`
- React Email integration

### 5C. Template Admin

**Goal:** Manage notification templates.

**Files:**
- `src/app/admin/notifications/templates/page.tsx`
- `src/components/admin/template-editor.tsx`
- `src/components/admin/template-preview.tsx`
- `src/components/admin/template-test.tsx`

---

## Phase 6: Triggered Notifications

### 6A. Event Triggers

**Goal:** Auto-trigger notifications on events.

**Schema Addition:**

```prisma
model NotificationTrigger {
  id              String   @id @default(cuid())
  name            String   @unique
  eventType       String   // project_funded, loan_repaid, etc.
  conditions      Json?    // Trigger conditions
  templateId      String
  channels        String[]
  delay           Int?     // Delay in seconds
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Files:**
- `src/lib/notifications/triggers/index.ts`
- `src/lib/notifications/triggers/evaluator.ts`
- `src/lib/notifications/triggers/scheduler.ts`
- Integration with platform events

### 6B. Scheduled Notifications

**Goal:** Time-based notifications.

**Files:**
- `src/lib/notifications/scheduled.ts`
- `src/app/api/notifications/schedule/route.ts`
- Cron job for scheduled delivery
- Reminder notifications

### 6C. Lifecycle Notifications

**Goal:** User journey notifications.

**Files:**
- `src/lib/notifications/lifecycle/index.ts`
- `src/lib/notifications/lifecycle/onboarding.ts`
- `src/lib/notifications/lifecycle/reengagement.ts`
- `src/lib/notifications/lifecycle/milestones.ts`

---

## Phase 7: Analytics & Admin

### 7A. Delivery Analytics

**Goal:** Track notification performance.

**Schema Addition:**

```prisma
model NotificationMetric {
  id              String   @id @default(cuid())
  date            DateTime
  type            String
  channel         String
  sent            Int      @default(0)
  delivered       Int      @default(0)
  opened          Int      @default(0)
  clicked         Int      @default(0)
  failed          Int      @default(0)
  unsubscribed    Int      @default(0)

  @@unique([date, type, channel])
}
```

**Files:**
- `src/lib/notifications/analytics.ts`
- `src/app/admin/notifications/analytics/page.tsx`
- `src/components/admin/notification-metrics.tsx`
- `src/components/admin/delivery-chart.tsx`

### 7B. Admin Dashboard

**Goal:** Manage notification system.

**Files:**
- `src/app/admin/notifications/page.tsx`
- `src/components/admin/notification-overview.tsx`
- `src/components/admin/recent-notifications.tsx`
- `src/components/admin/failed-deliveries.tsx`

### 7C. Testing Tools

**Goal:** Test notification delivery.

**Files:**
- `src/app/admin/notifications/test/page.tsx`
- `src/components/admin/send-test.tsx`
- `src/components/admin/preview-notification.tsx`
- `src/lib/notifications/testing.ts`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Notification Infrastructure | Large | High |
| 2 | User Preferences | Medium | High |
| 3 | Notification Inbox | Medium | High |
| 4 | Smart Batching | Medium | Medium |
| 5 | Notification Templates | Medium | Medium |
| 6 | Triggered Notifications | Medium | Medium |
| 7 | Analytics & Admin | Medium | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Notification, NotificationDelivery, NotificationPreference, NotificationChannel, NotificationDigest, NotificationTemplate, NotificationTrigger, NotificationMetric

### New Libraries
- `src/lib/notifications/index.ts`
- `src/lib/notifications/channels/*.ts`
- `src/lib/notifications/providers/*.ts`
- `src/lib/notifications/delivery.ts`
- `src/lib/notifications/preferences.ts`
- `src/lib/notifications/routing.ts`
- `src/lib/notifications/digest.ts`
- `src/lib/notifications/templates/*.ts`
- `src/lib/notifications/triggers/*.ts`
- `src/lib/notifications/lifecycle/*.ts`
- `src/lib/notifications/analytics.ts`

### Pages
- `src/app/(app)/notifications/page.tsx`
- `src/app/(app)/account/notifications/page.tsx`
- `src/app/unsubscribe/[token]/page.tsx`
- `src/app/admin/notifications/page.tsx`
- `src/app/admin/notifications/templates/page.tsx`
- `src/app/admin/notifications/analytics/page.tsx`

---

## Notification Types

| Type | Category | Channels |
|------|----------|----------|
| Project funded | celebration | in_app, email, push |
| Cascade reached | celebration | in_app, email, push |
| Loan approved | action_required | in_app, email, push, sms |
| Payment due | reminder | in_app, email, push, sms |
| New follower | update | in_app |
| Community update | update | in_app, email |
| System maintenance | system | in_app, email |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test notification creation
4. Verify multi-channel delivery
5. Test preference application
6. Verify digest generation
7. Test unsubscribe flow

