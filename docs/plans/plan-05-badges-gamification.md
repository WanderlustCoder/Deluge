# Plan 5: Extended Badge & Gamification System

**Status:** Approved
**Priority:** Medium
**Epic:** DLG-BADGE-001 through DLG-BADGE-004
**Reference:** `docs/user-experience.md`

---

## Overview

Complete the full 5-tier badge system with 25+ badges, progress tracking, legendary effects, and streak improvements.

---

## Current State

- 9 badges implemented in `src/lib/badges.ts`
- Basic streak tracking exists
- No badge progress indicators
- No tier system for badges
- No legendary/rare badge effects

---

## Badge Tier System

### Tier 1: First Drop (Getting Started)

| Badge | Criteria | Icon |
|-------|----------|------|
| First Drop | Made first cash contribution | 💧 |
| Community Member | Joined first community | 👥 |
| Profile Complete | Added photo and bio | ✨ |
| Time Giver | Watched first ad to fund a project | ⏰ |
| First Referral | Referred a friend who signed up | 🔗 |

### Tier 2: Stream (Building Habits)

| Badge | Criteria | Icon |
|-------|----------|------|
| Steady Flow | Contributed every month for 3 months | 🌊 |
| Promoter | Shared a project that got 5+ new backers | 📢 |
| Proposer | Proposed a project that went live | 💡 |
| Conversationalist | Posted 10 comments across discussions | 💬 |
| Week Streak | Watched ads 7 days in a row | 🔥 |

### Tier 3: Creek (Making Waves)

| Badge | Criteria | Icon |
|-------|----------|------|
| Project Backer x10 | Backed 10 different projects | 🎯 |
| Social Butterfly | Invited 3 friends who joined and became active | 🦋 |
| Storyteller | Shared a cascade story that reached 50+ people | 📖 |
| Month Streak | Watched ads 30 days in a row | ⚡ |
| First Cascade | Part of your first fully-funded project | 🌈 |

### Tier 4: River (Serious Impact)

| Badge | Criteria | Icon |
|-------|----------|------|
| Community Builder | Community you started has 100+ members | 🏛️ |
| Serial Proposer | Proposed 3+ projects that got funded | 🚀 |
| Impact Witness | Received 5 impact updates from backed projects | 👁️ |
| Rallier | Promoted a project from <25% to fully funded | 📣 |
| Six-Month Flow | Contributed every month for 6 months | 💎 |

### Tier 5: Watershed (Legendary)

| Badge | Criteria | Icon |
|-------|----------|------|
| Movement Builder | Referred 25+ active users | 🌟 |
| Cascade Veteran | Part of 10 fully-funded projects | 🏆 |
| Catalyst | Proposed or promoted projects that collectively funded $10K+ | ⭐ |
| Year of Flow | Contributed every month for 12 months | 👑 |
| Community Pillar | Active in 5+ communities with regular contributions | 🗿 |

---

## Schema Changes

```prisma
model Badge {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  tier        Int      // 1-5
  icon        String   // emoji or icon name
  category    String   // contribution, community, streak, impact, growth

  // Criteria stored as JSON for flexibility
  criteriaType  String   // count, streak, threshold, compound
  criteriaValue String   // JSON encoded criteria

  createdAt   DateTime @default(now())

  userBadges  UserBadge[]
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())

  // For display customization
  featured  Boolean  @default(false)  // Show on profile

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
}

model BadgeProgress {
  id          String   @id @default(cuid())
  userId      String
  badgeId     String

  currentValue Float   // Current progress (e.g., 7 of 10 projects)
  targetValue  Float   // Target to earn badge

  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
}

model Streak {
  id          String   @id @default(cuid())
  userId      String
  type        String   // ad_watching, contributing, login

  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActivityAt  DateTime?

  // Grace period tracking
  gracePeriodUsed Boolean  @default(false)
  graceExpiresAt  DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type])
}
```

---

## New Library Files

### `src/lib/badges-full.ts`
- Complete 25 badge definitions
- `checkBadgeEligibility(userId, badgeSlug)`
- `awardBadge(userId, badgeSlug)`
- `checkAllBadges(userId)` — Returns newly earned

### `src/lib/badge-progress.ts`
- `updateBadgeProgress(userId, badgeSlug)`
- `getBadgeProgress(userId)`
- `getNextBadges(userId)` — Closest to earning

### `src/lib/streaks.ts` (enhanced)
- `recordActivity(userId, type)`
- `checkStreak(userId, type)`
- `useGracePeriod(userId, type)` — 48h recovery
- `getStreakStatus(userId)`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/badges` | GET | List all badges with user's status |
| `/api/badges/[slug]` | GET | Badge details + earning criteria |
| `/api/badges/progress` | GET | User's progress on all badges |
| `/api/badges/featured` | PUT | Set featured badges for profile |
| `/api/streaks` | GET | User's current streaks |
| `/api/streaks/[type]/recover` | POST | Use grace period |

---

## UI Components

- `src/components/badges/badge-card.tsx`
- `src/components/badges/badge-progress.tsx`
- `src/components/badges/badge-showcase.tsx`
- `src/components/badges/legendary-badge.tsx`
- `src/components/badges/badge-notification.tsx`
- `src/components/streaks/streak-indicator.tsx`
- `src/components/streaks/streak-recovery.tsx`

---

## Badge Earning Triggers

| Trigger Point | Badges to Check |
|---------------|-----------------|
| After contribution | first_drop, steady_flow, six_month_flow, year_of_flow |
| After joining community | community_member, community_pillar |
| After profile update | profile_complete |
| After ad watch | time_giver, week_streak, month_streak |
| After referral signup | first_referral, social_butterfly, movement_builder |
| After project funds | project_backer_x10, first_cascade, cascade_veteran |
| After share tracked | promoter, storyteller |
| After project goes live | proposer, serial_proposer |
| After posting comment | conversationalist |
| After community grows | community_builder |
| After receiving update | impact_witness |
| After rally success | rallier |

---

## Implementation Order

1. Schema migration
2. Seed all 25 badge definitions
3. `badges-full.ts` — Complete definitions + checking
4. `badge-progress.ts` — Progress tracking
5. Enhanced `streaks.ts` with grace period
6. Badge card + progress components
7. Enhanced badges page
8. Badge showcase on profiles
9. Legendary badge effects
10. Streak recovery UI
11. Badge earning notifications
12. Integration with all trigger points

---

## Success Criteria

- [ ] All 25 badges defined and earnable
- [ ] Progress shows for in-progress badges
- [ ] Streaks have 48h grace period recovery
- [ ] Tier 5 badges have special visual effects
- [ ] Users can feature badges on profile
- [ ] Badge earning triggers celebration
- [ ] Streak status visible on dashboard

---

## Estimated Effort

2 implementation sessions
