# Plan 5: Recognition & Milestone Badges

**Status:** Implemented (needs refinement per revised philosophy)
**Priority:** Medium
**Epic:** DLG-BADGE-001 through DLG-BADGE-004
**Reference:** `docs/user-experience.md`

---

## Philosophy

Badges are **recognition of meaningful moments**, not gamification mechanics. They celebrate what someone has done, not pressure them to do more.

### What We Avoid
- **No streaks** - Missing a day is not failure
- **No progress bars** - Don't show "almost there" pressure
- **No "next badge" suggestions** - Don't create FOMO for unearned badges
- **No hierarchy language** - No "Legendary" or "better" badges
- **No recovery mechanics** - Nothing should feel like it can be "lost"

### What We Embrace
- **Milestone markers** - Recognition of genuine achievements
- **Anniversary recognition** - Celebrate time, not consecutive days
- **Impact connection** - Badges tied to real outcomes
- **Equal value** - All badges are meaningful, none are "better"
- **Quiet display** - Badges shown when relevant, not pushed

---

## Overview

A recognition system with 25 badges across 5 categories. Each badge marks a genuine milestone in someone's giving journey. No pressure, no competition, just acknowledgment.

---

## Current State

- 9 badges implemented in `src/lib/badges.ts`
- Basic streak tracking exists (needs removal)
- No badge progress indicators (keep it this way)
- Tier system exists (needs reframing)

---

## Badge Categories (Not Tiers)

Badges are organized by **type of contribution**, not by "level" or "difficulty". All categories are equally valuable.

### Category: Getting Started

Recognition for beginning the journey.

| Badge | Criteria | Icon |
|-------|----------|------|
| First Drop | Made first contribution | 💧 |
| Community Member | Joined first community | 👥 |
| Profile Complete | Added photo and bio | ✨ |
| Time Giver | Watched first ad to support a project | ⏰ |
| Welcome Friend | Referred a friend who signed up | 🔗 |

### Category: Community Connection

Recognition for community participation.

| Badge | Criteria | Icon |
|-------|----------|------|
| Neighbor | Active in a community for 3+ months | 🏠 |
| Conversation Starter | Contributed to community discussions | 💬 |
| Community Founder | Started a community that others joined | 🌱 |
| Growing Together | Part of a community that reached 100 members | 🏛️ |
| Bridge Builder | Active in 3+ different communities | 🌉 |

### Category: Project Impact

Recognition for supporting projects.

| Badge | Criteria | Icon |
|-------|----------|------|
| First Cascade | Part of a project that reached full funding | 🌈 |
| Ten Projects | Contributed to 10 different projects | 🎯 |
| Cascade Witness | Part of 5 fully-funded projects | 🌊 |
| Impact Seen | Received an update from a funded project | 👁️ |
| Cascade Veteran | Part of 10 fully-funded projects | 🏆 |

### Category: Sharing & Growth

Recognition for spreading the word.

| Badge | Criteria | Icon |
|-------|----------|------|
| Story Sharer | Shared a project with others | 📢 |
| Ripple Effect | Shared a project that got new backers | 🦋 |
| Storyteller | Shared an impact story that reached others | 📖 |
| Community Grower | Invited friends who became active | 🌟 |
| Movement Maker | Helped bring 10+ people to Deluge | ⭐ |

### Category: Giving Journey

Recognition for sustained participation (anniversaries, not streaks).

| Badge | Criteria | Icon |
|-------|----------|------|
| Three Months | Active on Deluge for 3 months | 🌿 |
| Six Months | Active on Deluge for 6 months | 🌳 |
| One Year | Active on Deluge for 1 year | 🎂 |
| Two Years | Active on Deluge for 2 years | 💎 |
| Founding Member | Joined during Deluge's first year | 🗿 |

**Note:** "Active" means any participation (contribution, community activity, ad watching) during the period—NOT consecutive days.

---

## Schema Changes

```prisma
model Badge {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  category    String   // getting_started, community, impact, sharing, journey
  icon        String   // emoji or icon name

  // Criteria stored as JSON for flexibility
  criteriaType  String   // milestone, anniversary, count
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

// REMOVED: BadgeProgress model - we don't track "almost earned"
// REMOVED: Streak model - no streak tracking
```

---

## What We Removed

### Removed: Streak System
- ❌ Week Streak badge
- ❌ Month Streak badge
- ❌ `currentStreak` tracking
- ❌ `gracePeriodUsed` field
- ❌ Streak recovery UI
- ❌ "Days in a row" concept

**Replaced with:** Anniversary badges that recognize time on platform without requiring consecutive activity.

### Removed: Progress Tracking
- ❌ BadgeProgress model
- ❌ `getNextBadges()` function
- ❌ Progress bars showing "7 of 10"
- ❌ "Almost there" notifications

**Replaced with:** Badges appear when earned, with no preview of what's coming.

### Removed: Tier Hierarchy
- ❌ Tier 1-5 numbering
- ❌ "Legendary" tier name
- ❌ Implication that higher tiers are "better"

**Replaced with:** Categories by type (community, impact, etc.) with equal value.

---

## New Library Files

### `src/lib/badges.ts` (revised)
- Complete 25 badge definitions
- `checkBadgeEligibility(userId, badgeSlug)`
- `awardBadge(userId, badgeSlug)`
- `checkAllBadges(userId)` — Returns newly earned
- `getUserBadges(userId)` — Returns earned badges only

### `src/lib/anniversaries.ts` (new)
- `checkAnniversaries(userId)` — Check time-based milestones
- `getAccountAge(userId)` — How long on platform
- No streak logic, just calendar time

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/badges` | GET | List user's earned badges |
| `/api/badges/[slug]` | GET | Badge details |
| `/api/badges/featured` | PUT | Set featured badges for profile |

**Removed:**
- ❌ `/api/badges/progress` — No progress tracking
- ❌ `/api/streaks` — No streaks
- ❌ `/api/streaks/[type]/recover` — No recovery needed

---

## UI Components

### Keep (with adjustments)
- `src/components/badges/badge-card.tsx` — Display a badge
- `src/components/badges/badge-showcase.tsx` — Profile badge display
- `src/components/badges/badge-notification.tsx` — Celebration when earned

### Remove
- ❌ `src/components/badges/badge-progress.tsx` — No progress bars
- ❌ `src/components/badges/legendary-badge.tsx` — No hierarchy
- ❌ `src/components/streaks/streak-indicator.tsx` — No streaks
- ❌ `src/components/streaks/streak-recovery.tsx` — No recovery

### Add
- `src/components/badges/badge-celebration.tsx` — Warm celebration when badge earned
- `src/components/badges/anniversary-marker.tsx` — Time-based recognition

---

## Badge Earning Triggers

| Trigger Point | Badges to Check |
|---------------|-----------------|
| After contribution | first_drop, ten_projects |
| After joining community | community_member, bridge_builder |
| After profile update | profile_complete |
| After ad watch | time_giver |
| After referral signup | welcome_friend, community_grower, movement_maker |
| After project funds | first_cascade, cascade_witness, cascade_veteran |
| After share tracked | story_sharer, ripple_effect, storyteller |
| After community activity | neighbor, conversation_starter |
| After community grows | growing_together, community_founder |
| After receiving update | impact_seen |
| On login (check anniversaries) | three_months, six_months, one_year, two_years |

---

## Implementation Order

1. Remove streak-related schema and code
2. Remove BadgeProgress model and related code
3. Update badge definitions (remove streak badges)
4. Add anniversary badges
5. Rename tiers to categories
6. Update badge UI components
7. Remove progress-related UI
8. Update badge earning logic
9. Test all badge triggers

---

## Success Criteria

- [x] 25 badges defined and earnable
- [x] No streak tracking anywhere
- [x] No progress bars or "almost there" indicators
- [x] No hierarchy language (legendary, tier numbers)
- [x] Anniversary badges work based on account age
- [x] Users can feature badges on profile
- [x] Badge earning triggers warm celebration
- [x] Badges feel like recognition, not goals to chase

---

## Design Principles for Badge Celebrations

When showing a badge was earned:

**Do:**
- "You've been part of Deluge for a year! 🎂"
- "Look at that—10 projects have had your support."
- "Your community just hit 100 members. You were there from the start."

**Don't:**
- "You're 80% of the way to your next badge!"
- "Keep your streak alive!"
- "Only 3 more to unlock Legendary status!"
- "You're falling behind—others have earned this badge."

---

## Estimated Effort

1 implementation session (mostly removal/simplification)

