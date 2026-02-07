# Plan 3: Rally & Momentum System

**Status:** Approved
**Priority:** Medium-High
**Epic:** DLG-RALLY-001 through DLG-RALLY-005
**Reference:** `docs/user-experience.md`

---

## Overview

Create organic momentum mechanics where communities rally behind projects, with visible trending indicators and time-bound campaigns.

---

## Current State

- Projects show basic funding progress
- No trending/momentum indicators
- No rally campaigns
- Discovery is basic search + category filtering
- No "Almost There" or "Trending" feeds

---

## Schema Changes

```prisma
model Rally {
  id          String   @id @default(cuid())
  projectId   String
  creatorId   String
  title       String   // "Let's get 50 backers by Friday!"
  targetType  String   // "backers" or "amount"
  targetValue Float    // 50 backers or $500
  deadline    DateTime
  status      String   @default("active") // active, succeeded, failed
  createdAt   DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator     User     @relation(fields: [creatorId], references: [id])
  participants RallyParticipant[]

  @@index([projectId, status])
  @@index([deadline])
}

model RallyParticipant {
  id        String   @id @default(cuid())
  rallyId   String
  userId    String
  joinedAt  DateTime @default(now())

  rally     Rally    @relation(fields: [rallyId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@unique([rallyId, userId])
}

model ShareEvent {
  id          String   @id @default(cuid())
  projectId   String
  userId      String?  // null for anonymous shares
  platform    String   // twitter, facebook, email, copy, other
  createdAt   DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
}

// Add to Project for momentum caching
model Project {
  // ... existing fields ...
  momentumScore     Float     @default(0)
  momentumUpdatedAt DateTime?
  rallies           Rally[]
  shareEvents       ShareEvent[]
}
```

---

## Momentum Algorithm

```typescript
// src/lib/momentum.ts

export function calculateMomentumScore(projectId: string): number {
  // Time-decayed scoring over last 7 days
  const weights = {
    newBacker: 10,        // Each new backer
    fundingAmount: 0.5,   // Per dollar funded
    share: 3,             // Each share event
    rallyJoin: 5,         // Each rally participant
    comment: 2,           // Each discussion comment
  };

  const decayFactor = 0.9; // Per day decay

  // Score = sum of (weight * count * decay^daysAgo)
  // Higher score = more momentum
}

export function getMomentumTrend(projectId: string): "rising" | "steady" | "new" {
  // Compare current score to 24h ago
  // rising: >20% increase
  // steady: -10% to +20%
  // new: created in last 48h
}
```

---

## New Library Files

### `src/lib/momentum.ts`
- `calculateMomentumScore(projectId)` — Weighted, time-decayed score
- `getMomentumTrend(projectId)` — Rising/steady/new
- `updateProjectMomentum(projectId)` — Recalculate and cache
- `getTopMomentumProjects(limit, filters)` — For trending feed

### `src/lib/rallies.ts`
- `createRally(projectId, creatorId, data)` — Start a rally
- `joinRally(rallyId, userId)` — Participate
- `checkRallyProgress(rallyId)` — Current vs target
- `resolveExpiredRallies()` — Cron job to mark succeeded/failed
- `getActiveRallies(projectId)` — List active rallies for project

### `src/lib/shares.ts`
- `trackShare(projectId, userId, platform)` — Record share event
- `getShareCount(projectId)` — Total shares
- `getShareAnalytics(projectId)` — Breakdown by platform

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects/[id]/rallies` | GET | List project rallies |
| `/api/projects/[id]/rallies` | POST | Create rally |
| `/api/rallies/[id]` | GET | Rally details + progress |
| `/api/rallies/[id]/join` | POST | Join rally |
| `/api/projects/[id]/share` | POST | Track share event |
| `/api/projects/[id]/momentum` | GET | Get momentum score + trend |
| `/api/discover/trending` | GET | Trending projects feed |
| `/api/discover/almost-there` | GET | Projects at 75%+ funding |
| `/api/discover/near-you` | GET | Projects by location |
| `/api/discover/new` | GET | Recently created projects |

---

## UI Components

### `src/components/projects/momentum-indicator.tsx`
- Visual indicator: flame icon for rising, wave for steady
- Score display (optional, could be hidden)
- "Trending" badge on hot projects

### `src/components/projects/rally-card.tsx`
- Rally title and deadline countdown
- Progress bar (current/target)
- Participant avatars
- Join button

### `src/components/projects/rally-create-modal.tsx`
- Target type selector (backers vs amount)
- Target value input
- Deadline picker (24h to 7d)
- Rally title/message

### `src/components/projects/share-modal.tsx`
- Platform buttons (Twitter, Facebook, Email, Copy Link)
- Pre-filled share text
- Track which platform selected

### `src/components/discover/feed-tabs.tsx`
- Tab navigation for discovery feeds
- Trending / Almost There / Near You / New / Following

---

## Page Changes

### Project Detail (`/projects/[id]`)
- Momentum indicator near title
- Active rallies section
- Share button with tracking
- "Start a Rally" button for backers

### New: Discover Page (`/discover`)
- Multi-tab layout with feed types
- Each feed uses appropriate sorting/filtering
- Personalization based on interests + location

### Project Cards (everywhere)
- Add momentum indicator
- Show active rally badge if applicable
- "Almost there!" badge at 75%+

---

## Discovery Feeds

| Feed | Query Logic |
|------|-------------|
| Trending | Order by momentumScore DESC, last 7 days activity |
| Almost There | fundingRaised/fundingGoal >= 0.75, active only |
| Near You | Match user's location, order by distance + momentum |
| New | createdAt DESC, last 14 days |
| Following | Projects from followed communities/users |

---

## Implementation Order

1. Schema migration
2. `momentum.ts` — Score calculation + caching
3. `shares.ts` — Share tracking
4. Share modal component
5. Momentum indicator component
6. `rallies.ts` — Rally system
7. Rally UI (card, create modal)
8. Discovery feeds API
9. Discover page with tabs
10. Cron job for rally resolution
11. Project card enhancements

---

## Success Criteria

- [ ] Projects have visible momentum indicators
- [ ] Users can create time-bound rally campaigns
- [ ] Rally progress updates in real-time
- [ ] Share events are tracked by platform
- [ ] Trending feed shows high-momentum projects
- [ ] "Almost There" feed shows 75%+ funded projects
- [ ] Discovery is personalized by location + interests
- [ ] Rallies auto-resolve at deadline

---

## Estimated Effort

2 implementation sessions
