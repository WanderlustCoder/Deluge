# Plan 17: Community Advocates

**Status:** Not Started
**Priority:** Medium
**Epic:** DLG-ADV-001 through DLG-ADV-006
**Reference:** `docs/user-experience.md`

---

## Philosophy

Community Advocates are **natural leaders who emerged organically**, not recruits incentivized by points or rewards. They help others because they believe in the mission, not because they're chasing status.

### What We Avoid
- **No tiers or levels** - All advocates are equally valued
- **No points or rewards** - Advocacy isn't transactional
- **No leaderboards** - We don't rank people against each other
- **No streak tracking** - Missing a week isn't failure
- **No quotas** - No "host X events to maintain status"
- **No gamification** - This is community service, not a game

### What We Embrace
- **Recognition of contribution** - Thank people for what they do
- **Resources and support** - Help advocates be effective
- **Connection** - Advocates know each other
- **Flexibility** - People contribute in different ways
- **Appreciation** - Genuine gratitude, not manufactured rewards

---

## Overview

A program that recognizes and supports community members who naturally take on advocacy roles—organizing events, welcoming newcomers, answering questions, and spreading the word about Deluge.

---

## Phase 1: Advocate Recognition

### 1A. Advocate Schema

**Goal:** Identify and support advocates without gamification.

**Schema Addition:**

```prisma
model CommunityAdvocate {
  id              String   @id @default(cuid())
  userId          String   @unique
  status          String   @default("active") // active, paused, alumni
  region          String?  // Geographic focus
  communityIds    String[] // Communities they support
  interests       String[] // Areas of interest (events, onboarding, content)
  bio             String?
  publicProfile   Boolean  @default(true)
  joinedAt        DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  AdvocateActivity[]
  events      AdvocateEvent[]

  @@index([status])
  @@index([region])
}
```

**Note:** No tiers, no points, no metrics tracking. Just recognition.

**Files:**
- `src/lib/advocates/index.ts` - Advocate management
- `src/app/api/advocates/route.ts` - List advocates
- `src/app/api/advocates/join/route.ts` - Express interest in becoming advocate

### 1B. Joining Flow

**Goal:** People express interest, not "apply" with requirements.

**Schema Addition:**

```prisma
model AdvocateInterest {
  id              String   @id @default(cuid())
  userId          String   @unique
  motivation      String   // Why they want to help
  interests       String[] // What they'd like to do
  availability    String?  // General availability
  region          String?
  status          String   @default("pending") // pending, welcomed, declined
  welcomedBy      String?
  welcomedAt      DateTime?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
}
```

**Language shift:** "Join us" not "Apply to become" - no gatekeeping.

**Files:**
- `src/app/(app)/advocates/join/page.tsx` - Interest form
- `src/components/advocates/interest-form.tsx`
- `src/app/admin/advocates/page.tsx` - Welcome new advocates
- `src/components/admin/advocate-welcome-card.tsx`

---

## Phase 2: Advocate Activities

### 2A. Activity Recording

**Goal:** Record what advocates do (for appreciation, not scoring).

**Schema Addition:**

```prisma
model AdvocateActivity {
  id            String   @id @default(cuid())
  advocateId    String
  type          String   // welcome, event, content, support, outreach
  description   String
  communityId   String?  // Which community this was for
  createdAt     DateTime @default(now())

  advocate CommunityAdvocate @relation(fields: [advocateId], references: [id], onDelete: Cascade)

  @@index([advocateId, type])
  @@index([createdAt])
}
```

**Note:** No points, no verification required. Trust advocates to log their contributions.

**Activity Types:**
- **Welcome**: Helped onboard new community members
- **Event**: Organized or hosted a gathering
- **Content**: Created helpful resources
- **Support**: Answered questions, helped troubleshoot
- **Outreach**: Represented Deluge at external events

**Files:**
- `src/lib/advocates/activities.ts` - Activity logging
- `src/app/api/advocates/activities/route.ts`
- `src/components/advocates/log-activity.tsx`
- `src/components/advocates/activity-history.tsx`

### 2B. Appreciation (Not Rewards)

**Goal:** Thank advocates genuinely without transactional incentives.

**What appreciation looks like:**
- Personal thank-you notes from staff
- Highlight in community newsletters (with permission)
- Invitations to advocate gatherings
- Early access to new features (for feedback, not "reward")
- Occasional Deluge swag (sent as gifts, not "earned")

**What it's NOT:**
- Points to accumulate
- Rewards shop to redeem
- Tiers to unlock
- Status to maintain

**Files:**
- `src/lib/advocates/appreciation.ts` - Thank-you tracking
- `src/components/admin/send-appreciation.tsx`
- No rewards shop, no points balance UI

---

## Phase 3: Advocate Events

### 3A. Event Organization

**Goal:** Advocates organize community gatherings.

**Schema Addition:**

```prisma
model AdvocateEvent {
  id            String   @id @default(cuid())
  advocateId    String
  communityId   String?
  title         String
  description   String
  type          String   // meetup, workshop, welcome_session, info_session
  date          DateTime
  endDate       DateTime?
  location      String?
  isVirtual     Boolean  @default(false)
  virtualLink   String?
  recap         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  advocate CommunityAdvocate @relation(fields: [advocateId], references: [id], onDelete: Cascade)
  rsvps    AdvocateEventRSVP[]

  @@index([advocateId, date])
  @@index([communityId, date])
}

model AdvocateEventRSVP {
  id        String   @id @default(cuid())
  eventId   String
  userId    String?
  email     String?  // For non-users
  name      String?
  attended  Boolean  @default(false)
  createdAt DateTime @default(now())

  event AdvocateEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}
```

**Files:**
- `src/lib/advocates/events.ts` - Event management
- `src/app/(app)/advocates/events/page.tsx` - Browse advocate events
- `src/app/(app)/advocates/events/new/page.tsx` - Create event
- `src/app/(app)/advocates/events/[id]/page.tsx` - Event detail
- `src/components/advocates/event-form.tsx`
- `src/components/advocates/event-card.tsx`

### 3B. Resource Library

**Goal:** Provide advocates with helpful materials.

**Schema Addition:**

```prisma
model AdvocateResource {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   // presentation, flyer, video, guide, template
  category    String   // welcome, events, outreach
  fileUrl     String?
  content     String?  // For text-based resources
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category, type])
}
```

**Note:** Resources available to all advocates equally—no tier gating.

**Files:**
- `src/app/(app)/advocates/resources/page.tsx` - Resource library
- `src/app/api/advocates/resources/route.ts`
- `src/components/advocates/resource-card.tsx`

---

## Phase 4: Advocate Dashboard

### 4A. Personal Dashboard

**Goal:** Advocates see their contribution history (not rankings or progress bars).

**What the dashboard shows:**
- Recent activities you've logged
- Upcoming events you're hosting
- Resources available
- Connect with other advocates

**What it DOESN'T show:**
- Points balance
- Tier progress
- Comparison to other advocates
- Rankings or leaderboards
- "Next milestone" prompts

**Files:**
- `src/app/(app)/advocates/dashboard/page.tsx` - Advocate home
- `src/components/advocates/activity-summary.tsx`
- `src/components/advocates/upcoming-events.tsx`
- `src/components/advocates/advocate-directory.tsx` - Find other advocates

### 4B. Advocate Directory

**Goal:** Advocates can find and connect with each other.

**Files:**
- `src/app/(app)/advocates/directory/page.tsx`
- `src/components/advocates/advocate-card.tsx`
- `src/components/advocates/region-filter.tsx`

**Note:** Directory is alphabetical or by region—NOT ranked by activity.

---

## Phase 5: Onboarding & Orientation

### 5A. Welcome Materials

**Goal:** Help new advocates get started.

**What we provide:**
- Welcome guide explaining the role
- Orientation videos (optional, not required)
- Connection to a mentor advocate
- Access to resource library

**What we DON'T do:**
- Required "certification" to maintain status
- Tests or quizzes to pass
- Progression through training levels

**Files:**
- `src/app/(app)/advocates/welcome/page.tsx` - Welcome guide
- `src/components/advocates/orientation-checklist.tsx` - Suggested (not required) steps
- `src/components/advocates/mentor-connection.tsx`

### 5B. Mentor Connections

**Goal:** Experienced advocates support newer ones.

**Files:**
- `src/lib/advocates/mentorship.ts`
- `src/components/advocates/mentor-match.tsx`
- Informal mentorship, not tracked or scored

---

## Phase 6: Admin Management

### 6A. Advocate Admin

**Goal:** Staff support the advocate program.

**Files:**
- `src/app/admin/advocates/page.tsx` - Advocate list
- `src/app/admin/advocates/[id]/page.tsx` - Advocate detail
- `src/components/admin/advocate-table.tsx`
- `src/components/admin/send-appreciation.tsx`
- `src/app/api/admin/advocates/route.ts`

### 6B. Program Health

**Goal:** Understand program health without ranking individuals.

**What we track:**
- Total active advocates
- Events hosted (aggregate)
- Geographic coverage
- Resource usage

**What we DON'T track:**
- Individual performance rankings
- Points per advocate
- Tier distributions

**Files:**
- `src/lib/advocates/health.ts`
- `src/components/admin/advocate-program-health.tsx`
- `src/components/admin/geographic-coverage.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Advocate Recognition | Medium | High |
| 2 | Advocate Activities | Small | High |
| 3 | Advocate Events | Medium | Medium |
| 4 | Advocate Dashboard | Medium | High |
| 5 | Onboarding & Orientation | Small | Medium |
| 6 | Admin Management | Medium | High |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add CommunityAdvocate, AdvocateInterest, AdvocateActivity, AdvocateEvent, AdvocateEventRSVP, AdvocateResource

### New Libraries
- `src/lib/advocates/index.ts`
- `src/lib/advocates/activities.ts`
- `src/lib/advocates/events.ts`
- `src/lib/advocates/appreciation.ts`
- `src/lib/advocates/mentorship.ts`
- `src/lib/advocates/health.ts`

### Pages
- `src/app/(app)/advocates/join/page.tsx`
- `src/app/(app)/advocates/dashboard/page.tsx`
- `src/app/(app)/advocates/events/page.tsx`
- `src/app/(app)/advocates/resources/page.tsx`
- `src/app/(app)/advocates/directory/page.tsx`
- `src/app/(app)/advocates/welcome/page.tsx`
- `src/app/admin/advocates/page.tsx`

---

## What We Removed

### Removed from Original Plan
- ❌ Ambassador tiers (advocate → ambassador → champion → director)
- ❌ AmbassadorMetrics with streaks and points
- ❌ Points & Rewards System
- ❌ Rewards shop
- ❌ Leaderboards
- ❌ Monthly champions
- ❌ Tier progress tracking
- ❌ Training certification requirements
- ❌ Point values for activities

### Replaced With
- ✅ Equal recognition for all advocates
- ✅ Genuine appreciation (not transactional rewards)
- ✅ Directory (not leaderboard)
- ✅ Orientation materials (not required certification)
- ✅ Mentor connections (not tier progression)

---

## Language Guide

**Do say:**
- "Thank you for organizing this event"
- "Your community is lucky to have you"
- "Here are some resources that might help"

**Don't say:**
- "You've earned 150 points!"
- "Only 50 more points to reach Champion tier"
- "You're in the top 10% of advocates"
- "Maintain your streak by logging activity this week"

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Verify no points, tiers, or rankings appear
4. Test that all advocates see same resources
5. Confirm no competitive language in UI
6. Verify appreciation is personal, not automated rewards

