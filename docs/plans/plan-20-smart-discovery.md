# Plan 20: Smart Discovery & Recommendations

## Overview

Build intelligent recommendation systems that help users discover projects, communities, and giving opportunities tailored to their interests, location, and behavior. Makes finding meaningful giving opportunities effortless.

---

## Phase 1: User Interest Profiling

### 1A. Interest Graph

**Goal:** Build comprehensive user interest profiles.

**Schema Addition:**

```prisma
model UserInterestProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  categories      Json     // { "education": 0.8, "environment": 0.6 }
  communities     Json     // { "community_id": weight }
  projectTypes    Json     // { "infrastructure": 0.7 }
  givingPatterns  Json     // { "avg_amount": 25, "frequency": "weekly" }
  locationPrefs   Json     // { "radius_miles": 50, "include_remote": true }
  timePrefs       Json     // { "prefer_urgent": true }
  lastUpdated     DateTime @default(now())
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserInteraction {
  id          String   @id @default(cuid())
  userId      String
  entityType  String   // project, community, loan, business
  entityId    String
  action      String   // view, fund, follow, share, save, dismiss
  weight      Float    @default(1) // Interaction strength
  context     Json?    // { "source": "feed", "duration_sec": 45 }
  createdAt   DateTime @default(now())

  @@index([userId, entityType, createdAt])
  @@index([entityId, action])
}
```

**Files:**
- `src/lib/recommendations/interests.ts` - Interest profile management
- `src/lib/recommendations/signals.ts` - Signal extraction from actions
- `src/app/api/user/interests/route.ts` - Get/update interests
- Middleware to track interactions on page views

### 1B. Explicit Preferences

**Goal:** Let users set explicit preferences.

**Files:**
- `src/app/(app)/account/preferences/page.tsx` - Preferences UI
- `src/components/preferences/category-selector.tsx`
- `src/components/preferences/location-preferences.tsx`
- `src/components/preferences/giving-style.tsx`

---

## Phase 2: Recommendation Engine

### 2A. Collaborative Filtering

**Goal:** Recommend based on similar users.

**Schema Addition:**

```prisma
model UserSimilarity {
  id          String   @id @default(cuid())
  userId      String
  similarUserId String
  score       Float    // 0-1 similarity score
  basis       String   // funding, following, category
  calculatedAt DateTime @default(now())

  @@unique([userId, similarUserId, basis])
  @@index([userId, score])
}

model ProjectSimilarity {
  id          String   @id @default(cuid())
  projectId   String
  similarProjectId String
  score       Float
  basis       String   // category, community, backers
  calculatedAt DateTime @default(now())

  @@unique([projectId, similarProjectId])
  @@index([projectId, score])
}
```

**Files:**
- `src/lib/recommendations/collaborative.ts` - Collaborative filtering
- `src/lib/recommendations/similarity.ts` - Similarity calculations
- `src/lib/recommendations/jobs/calculate-similarity.ts` - Background job

### 2B. Content-Based Filtering

**Goal:** Recommend based on content attributes.

**Files:**
- `src/lib/recommendations/content-based.ts` - Content matching
- `src/lib/recommendations/text-similarity.ts` - Description matching
- `src/lib/recommendations/category-matching.ts` - Category-based

### 2C. Hybrid Recommendations

**Goal:** Combine multiple signals for best recommendations.

**Schema Addition:**

```prisma
model Recommendation {
  id          String   @id @default(cuid())
  userId      String
  entityType  String   // project, community, loan
  entityId    String
  score       Float
  reason      String   // "similar_to_funded", "trending_in_area", etc.
  signals     Json     // Contributing signals and weights
  shown       Boolean  @default(false)
  shownAt     DateTime?
  clicked     Boolean  @default(false)
  clickedAt   DateTime?
  converted   Boolean  @default(false) // Funded/joined
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@unique([userId, entityType, entityId])
  @@index([userId, entityType, score])
  @@index([expiresAt])
}
```

**Files:**
- `src/lib/recommendations/hybrid.ts` - Combine strategies
- `src/lib/recommendations/ranker.ts` - Final ranking
- `src/lib/recommendations/generator.ts` - Generate recommendations

---

## Phase 3: Personalized Feeds

### 3A. For You Feed

**Goal:** Main personalized discovery feed.

**Files:**
- `src/app/(app)/discover/page.tsx` - Discovery page
- `src/app/api/discover/for-you/route.ts` - Personalized feed
- `src/components/discover/for-you-feed.tsx`
- `src/components/discover/recommendation-card.tsx`
- `src/components/discover/recommendation-reason.tsx`

### 3B. Category Feeds

**Goal:** Personalized within categories.

**Files:**
- `src/app/(app)/discover/[category]/page.tsx`
- `src/app/api/discover/category/[slug]/route.ts`
- `src/components/discover/category-feed.tsx`

### 3C. Location-Based Feed

**Goal:** Projects near the user.

**Files:**
- `src/app/(app)/discover/nearby/page.tsx`
- `src/app/api/discover/nearby/route.ts`
- `src/components/discover/nearby-feed.tsx`
- `src/components/discover/location-filter.tsx`

---

## Phase 4: Smart Matching

### 4A. Project-User Matching

**Goal:** Match users to their ideal projects.

**Schema Addition:**

```prisma
model MatchScore {
  id          String   @id @default(cuid())
  userId      String
  projectId   String
  score       Float    // 0-1 match quality
  breakdown   Json     // { "category": 0.8, "location": 0.7, "history": 0.9 }
  calculatedAt DateTime @default(now())
  expiresAt   DateTime

  @@unique([userId, projectId])
  @@index([userId, score])
  @@index([projectId, score])
}
```

**Files:**
- `src/lib/recommendations/matching.ts` - Match scoring
- `src/lib/recommendations/match-factors.ts` - Factor calculations
- `src/app/api/projects/[id]/match/route.ts` - User-project match
- `src/components/projects/match-indicator.tsx`

### 4B. Volunteer-Opportunity Matching

**Goal:** Match volunteers to opportunities.

**Files:**
- `src/lib/recommendations/volunteer-matching.ts`
- `src/app/api/volunteer/recommendations/route.ts`
- `src/components/volunteer/recommended-opportunities.tsx`

### 4C. Loan-Funder Matching

**Goal:** Match funders to loans they'd support.

**Files:**
- `src/lib/recommendations/loan-matching.ts`
- `src/app/api/loans/recommendations/route.ts`
- `src/components/loans/recommended-loans.tsx`

---

## Phase 5: Contextual Recommendations

### 5A. Email Digests

**Goal:** Personalized weekly/monthly email recommendations.

**Schema Addition:**

```prisma
model DigestPreferences {
  id          String   @id @default(cuid())
  userId      String   @unique
  frequency   String   @default("weekly") // never, weekly, monthly
  dayOfWeek   Int?     // 0-6 for weekly
  categories  String[] // Focus categories
  includeLoans Boolean @default(true)
  includeVolunteer Boolean @default(true)
  lastSent    DateTime?
  nextSend    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/recommendations/digest.ts` - Generate digest content
- `src/lib/recommendations/digest-sender.ts` - Send emails
- `src/app/api/account/digest/route.ts` - Preferences
- Email template for personalized digest

### 5B. Push Notification Recommendations

**Goal:** Smart push notifications for opportunities.

**Files:**
- `src/lib/recommendations/push-selector.ts` - Select what to notify
- `src/lib/recommendations/notification-timing.ts` - Optimal timing
- Update notification system with recommendation triggers

### 5C. In-App Prompts

**Goal:** Contextual suggestions within the app.

**Files:**
- `src/components/recommendations/inline-suggestion.tsx`
- `src/components/recommendations/after-action-suggestion.tsx`
- `src/components/recommendations/sidebar-recommendations.tsx`

---

## Phase 6: Discovery Features

### 6A. Explore Mode

**Goal:** Gamified discovery experience.

**Files:**
- `src/app/(app)/explore/page.tsx` - Swipe-style exploration
- `src/components/explore/project-card-stack.tsx`
- `src/components/explore/swipe-actions.tsx`
- `src/app/api/explore/next/route.ts` - Get next projects

### 6B. Discovery Challenges

**Goal:** Encourage diverse exploration.

**Schema Addition:**

```prisma
model DiscoveryChallenge {
  id          String   @id @default(cuid())
  userId      String
  type        String   // explore_categories, fund_new_community, etc.
  target      Int
  progress    Int      @default(0)
  reward      String   // badge, watershed_credit
  rewardAmount Float?
  status      String   @default("active") // active, completed, expired
  expiresAt   DateTime
  completedAt DateTime?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}
```

**Files:**
- `src/lib/recommendations/challenges.ts` - Challenge logic
- `src/app/api/discover/challenges/route.ts`
- `src/components/discover/challenge-card.tsx`
- `src/components/discover/challenge-progress.tsx`

### 6C. Serendipity Mode

**Goal:** Introduce unexpected but relevant discoveries.

**Files:**
- `src/lib/recommendations/serendipity.ts` - Random-but-relevant
- `src/components/discover/serendipity-card.tsx`
- Occasionally inject "something different" in feeds

---

## Phase 7: Analytics & Optimization

### 7A. Recommendation Analytics

**Goal:** Track recommendation performance.

**Schema Addition:**

```prisma
model RecommendationMetrics {
  id              String   @id @default(cuid())
  date            DateTime
  algorithm       String   // collaborative, content, hybrid
  entityType      String
  impressions     Int      @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  avgPosition     Float?
  avgScore        Float?
  createdAt       DateTime @default(now())

  @@unique([date, algorithm, entityType])
  @@index([date])
}
```

**Files:**
- `src/lib/recommendations/analytics.ts` - Track performance
- `src/app/admin/recommendations/page.tsx` - Analytics dashboard
- `src/components/admin/recommendation-metrics.tsx`

### 7B. A/B Testing

**Goal:** Test recommendation strategies.

**Files:**
- `src/lib/recommendations/ab-testing.ts` - Experiment framework
- `src/lib/recommendations/experiments.ts` - Define experiments
- `src/app/admin/experiments/page.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | User Interest Profiling | Medium | High |
| 2 | Recommendation Engine | Large | High |
| 3 | Personalized Feeds | Large | High |
| 4 | Smart Matching | Medium | Medium |
| 5 | Contextual Recommendations | Medium | Medium |
| 6 | Discovery Features | Large | Medium |
| 7 | Analytics & Optimization | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add UserInterestProfile, UserInteraction, UserSimilarity, ProjectSimilarity, Recommendation, MatchScore, DigestPreferences, DiscoveryChallenge, RecommendationMetrics

### New Libraries
- `src/lib/recommendations/interests.ts`
- `src/lib/recommendations/signals.ts`
- `src/lib/recommendations/collaborative.ts`
- `src/lib/recommendations/content-based.ts`
- `src/lib/recommendations/hybrid.ts`
- `src/lib/recommendations/ranker.ts`
- `src/lib/recommendations/generator.ts`
- `src/lib/recommendations/matching.ts`
- `src/lib/recommendations/digest.ts`
- `src/lib/recommendations/challenges.ts`
- `src/lib/recommendations/serendipity.ts`
- `src/lib/recommendations/analytics.ts`
- `src/lib/recommendations/ab-testing.ts`

### API Routes
- `src/app/api/user/interests/route.ts`
- `src/app/api/discover/for-you/route.ts`
- `src/app/api/discover/nearby/route.ts`
- `src/app/api/discover/category/[slug]/route.ts`
- `src/app/api/discover/challenges/route.ts`
- `src/app/api/explore/next/route.ts`
- `src/app/api/projects/[id]/match/route.ts`

### Pages
- `src/app/(app)/discover/page.tsx`
- `src/app/(app)/discover/nearby/page.tsx`
- `src/app/(app)/discover/[category]/page.tsx`
- `src/app/(app)/explore/page.tsx`
- `src/app/(app)/account/preferences/page.tsx`
- `src/app/admin/recommendations/page.tsx`

---

## Algorithm Notes

### Interest Score Calculation
```
interest_score =
  0.4 * category_affinity +
  0.3 * historical_behavior +
  0.2 * explicit_preferences +
  0.1 * social_signals
```

### Recommendation Ranking
```
final_score =
  0.35 * relevance_score +
  0.25 * recency_boost +
  0.20 * popularity_score +
  0.10 * urgency_factor +
  0.10 * diversity_bonus
```

### Similarity Metrics
- Users: Jaccard similarity on funded projects
- Projects: Cosine similarity on category vectors + community overlap

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test interest profile updates
4. Verify recommendation relevance manually
5. Check A/B test assignment consistency
6. Monitor recommendation click-through rates
