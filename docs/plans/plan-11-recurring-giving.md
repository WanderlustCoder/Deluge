# Plan 11: Recurring Giving & Subscriptions

## Overview

Enable users to set up recurring contributions that automatically fund their watershed or specific projects. Creates predictable giving habits and steady funding flow for community projects.

---

## Phase 1: Recurring Watershed Contributions

### 1A. Subscription Model

**Goal:** Users can set up monthly auto-contributions to their watershed.

**Schema Addition:**

```prisma
model RecurringContribution {
  id              String   @id @default(cuid())
  userId          String
  amount          Float    // Monthly amount
  frequency       String   @default("monthly") // monthly, weekly, biweekly
  nextChargeDate  DateTime
  lastChargeDate  DateTime?
  status          String   @default("active") // active, paused, cancelled
  paymentMethodId String?  // Stripe payment method ID
  failureCount    Int      @default(0)
  pausedUntil     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user    User                          @relation(fields: [userId], references: [id], onDelete: Cascade)
  history RecurringContributionHistory[]

  @@index([userId, status])
  @@index([nextChargeDate, status])
}

model RecurringContributionHistory {
  id                      String   @id @default(cuid())
  recurringContributionId String
  amount                  Float
  status                  String   // succeeded, failed, pending
  chargeDate              DateTime
  failureReason           String?
  createdAt               DateTime @default(now())

  recurringContribution RecurringContribution @relation(fields: [recurringContributionId], references: [id], onDelete: Cascade)

  @@index([recurringContributionId, chargeDate])
}
```

**Files:**
- `src/lib/recurring.ts` - Subscription management logic
- `src/lib/recurring-processor.ts` - Process due subscriptions (cron job)
- `src/app/api/recurring/route.ts` - CRUD for subscriptions
- `src/app/api/recurring/[id]/route.ts` - Individual subscription management

### 1B. Subscription UI

**Goal:** Interface for setting up and managing recurring contributions.

**Files:**
- `src/components/recurring/setup-recurring-modal.tsx` - Setup flow
- `src/components/recurring/recurring-card.tsx` - Display current subscription
- `src/components/recurring/edit-recurring-modal.tsx` - Modify amount/frequency
- `src/app/(app)/account/recurring/page.tsx` - Manage subscriptions page

---

## Phase 2: Project Subscriptions

### 2A. Subscribe to Projects

**Goal:** Set up recurring funding for specific projects (ongoing projects).

**Schema Addition:**

```prisma
model ProjectSubscription {
  id              String   @id @default(cuid())
  userId          String
  projectId       String
  amount          Float
  frequency       String   @default("monthly")
  nextChargeDate  DateTime
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([nextChargeDate, status])
}
```

**Files:**
- `src/lib/project-subscriptions.ts` - Project subscription logic
- `src/app/api/projects/[id]/subscribe/route.ts` - Subscribe to project
- `src/components/projects/subscribe-button.tsx` - Subscription CTA
- `src/components/projects/subscription-manager.tsx` - Manage project subs

### 2B. Subscription Limits

**Goal:** Handle project completion and subscription caps.

**Logic:**
- Auto-pause subscription when project reaches 100% funding
- Option to redirect to similar projects in same category
- Cap per-project subscription at project goal amount

**Files:**
- Update `src/lib/project-subscriptions.ts` - Add completion handling
- `src/lib/subscription-redirect.ts` - Find similar projects for redirect

---

## Phase 3: Community Subscriptions

### 3A. Subscribe to Communities

**Goal:** Recurring support for community-linked projects.

**Schema Addition:**

```prisma
model CommunitySubscription {
  id              String   @id @default(cuid())
  userId          String
  communityId     String
  amount          Float
  frequency       String   @default("monthly")
  allocationRule  String   @default("newest") // newest, neediest, random
  nextChargeDate  DateTime
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  @@unique([userId, communityId])
  @@index([nextChargeDate, status])
}
```

**Allocation Rules:**
- `newest` - Fund the most recently created active project
- `neediest` - Fund the project closest to goal (highest %)
- `random` - Randomly distribute among active projects

**Files:**
- `src/lib/community-subscriptions.ts` - Community subscription logic
- `src/app/api/communities/[id]/subscribe/route.ts`
- `src/components/communities/subscribe-button.tsx`

---

## Phase 4: Smart Giving

### 4A. Round-Up Giving

**Goal:** Round up daily spending and contribute the difference.

**Schema Addition:**

```prisma
model RoundUpSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  enabled           Boolean  @default(false)
  multiplier        Float    @default(1) // 1x, 2x, 3x round-ups
  weeklyMax         Float?   // Optional cap
  currentWeekTotal  Float    @default(0)
  weekStartDate     DateTime
  destination       String   @default("watershed") // watershed, project, community
  destinationId     String?  // For project/community
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Note:** This requires Plaid integration for bank account linking. Mark as future phase.

### 4B. Giving Goals

**Goal:** Set personal giving targets with progress tracking.

**Schema Addition:**

```prisma
model PersonalGivingGoal {
  id            String   @id @default(cuid())
  userId        String
  targetAmount  Float
  currentAmount Float    @default(0)
  period        String   // monthly, quarterly, yearly
  periodStart   DateTime
  periodEnd     DateTime
  status        String   @default("active")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}
```

**Files:**
- `src/lib/giving-goals.ts` - Goal tracking
- `src/app/api/giving-goals/route.ts`
- `src/components/giving/goal-progress.tsx`
- `src/components/giving/set-goal-modal.tsx`

---

## Phase 5: Subscription Management

### 5A. Billing Dashboard

**Goal:** Central place to manage all recurring giving.

**Files:**
- `src/app/(app)/account/billing/page.tsx` - Billing dashboard
- `src/components/billing/subscription-list.tsx` - All subscriptions
- `src/components/billing/payment-methods.tsx` - Manage cards
- `src/components/billing/billing-history.tsx` - Past charges

### 5B. Pause & Skip

**Goal:** Flexible subscription management.

**Features:**
- Pause all subscriptions for X weeks
- Skip next charge (one-time)
- Pause individual subscription

**Files:**
- `src/app/api/recurring/pause/route.ts` - Pause endpoint
- `src/app/api/recurring/[id]/skip/route.ts` - Skip next charge
- `src/components/recurring/pause-modal.tsx`

### 5C. Notifications

**Goal:** Keep users informed about subscription activity.

**Triggers:**
- Upcoming charge (3 days before)
- Successful charge
- Failed charge (with retry info)
- Subscription paused/resumed
- Project subscription redirected

**Files:**
- Update notification composer with subscription templates
- Email templates for subscription events

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Recurring Watershed | Medium | High |
| 2 | Project Subscriptions | Medium | High |
| 3 | Community Subscriptions | Medium | Medium |
| 4 | Smart Giving (Goals only) | Medium | Medium |
| 5 | Subscription Management | Medium | High |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add RecurringContribution, ProjectSubscription, CommunitySubscription, PersonalGivingGoal, RoundUpSettings

### New Libraries
- `src/lib/recurring.ts`
- `src/lib/recurring-processor.ts`
- `src/lib/project-subscriptions.ts`
- `src/lib/community-subscriptions.ts`
- `src/lib/subscription-redirect.ts`
- `src/lib/giving-goals.ts`

### API Routes
- `src/app/api/recurring/route.ts`
- `src/app/api/recurring/[id]/route.ts`
- `src/app/api/recurring/pause/route.ts`
- `src/app/api/recurring/[id]/skip/route.ts`
- `src/app/api/projects/[id]/subscribe/route.ts`
- `src/app/api/communities/[id]/subscribe/route.ts`
- `src/app/api/giving-goals/route.ts`

### UI Components
- `src/components/recurring/setup-recurring-modal.tsx`
- `src/components/recurring/recurring-card.tsx`
- `src/components/recurring/edit-recurring-modal.tsx`
- `src/components/recurring/pause-modal.tsx`
- `src/components/projects/subscribe-button.tsx`
- `src/components/communities/subscribe-button.tsx`
- `src/components/giving/goal-progress.tsx`
- `src/components/giving/set-goal-modal.tsx`
- `src/components/billing/subscription-list.tsx`
- `src/components/billing/payment-methods.tsx`

### Pages
- `src/app/(app)/account/recurring/page.tsx`
- `src/app/(app)/account/billing/page.tsx`

---

## Dependencies

- Stripe subscription infrastructure (existing payment service)
- Cron job for processing recurring charges

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test subscription creation and modification
4. Verify charge processing works correctly
5. Test pause/skip functionality
