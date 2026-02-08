# Plan 31: Pledge & Crowdfunding Campaigns

## Overview

Enable time-bound pledge campaigns where backers commit to fund if a goal is reached. Similar to Kickstarter-style all-or-nothing funding, but adapted for community giving. Pledges only execute when the campaign succeeds.

**Core Principle:** Reduce risk for backers while creating urgency and momentum for project success.

---

## Phase 1: Campaign Foundation

### 1A. Campaign Schema

**Goal:** Structure for pledge-based campaigns.

**Schema Addition:**

```prisma
model PledgeCampaign {
  id              String   @id @default(cuid())
  projectId       String
  creatorId       String
  title           String
  slug            String   @unique
  description     String
  story           Json?    // Rich campaign story
  videoUrl        String?
  coverImageUrl   String?
  goalAmount      Float
  minimumAmount   Float?   // Minimum to consider success
  pledgedAmount   Float    @default(0)
  backerCount     Int      @default(0)
  fundingType     String   @default("all_or_nothing") // all_or_nothing, flexible, milestone
  startDate       DateTime
  endDate         DateTime
  timezone        String   @default("America/Los_Angeles")
  status          String   @default("draft") // draft, active, successful, failed, cancelled
  fundedAt        DateTime?
  settledAt       DateTime? // When pledges were collected
  stretchGoals    Json?    // [{ amount, title, description }]
  faqs            Json?    // [{ question, answer }]
  updates         Int      @default(0) // Update count
  shareCount      Int      @default(0)
  viewCount       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project  Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator  User            @relation(fields: [creatorId], references: [id])
  pledges  Pledge[]
  rewards  CampaignReward[]
  updates  CampaignUpdate[]

  @@index([status, endDate])
  @@index([projectId])
}
```

**Files:**
- `src/lib/campaigns/index.ts` - Campaign CRUD
- `src/app/api/campaigns/route.ts` - List/create
- `src/app/api/campaigns/[slug]/route.ts` - Get/update

### 1B. Campaign Creation

**Goal:** Multi-step campaign builder.

**Files:**
- `src/app/(app)/campaigns/create/page.tsx` - Campaign wizard
- `src/components/campaigns/campaign-wizard.tsx`
- `src/components/campaigns/step-basics.tsx`
- `src/components/campaigns/step-story.tsx`
- `src/components/campaigns/step-rewards.tsx`
- `src/components/campaigns/step-goals.tsx`
- `src/components/campaigns/step-preview.tsx`

### 1C. Campaign Discovery

**Goal:** Browse and find campaigns.

**Files:**
- `src/app/(app)/campaigns/page.tsx` - Browse campaigns
- `src/app/(app)/campaigns/[slug]/page.tsx` - Campaign detail
- `src/components/campaigns/campaign-card.tsx`
- `src/components/campaigns/campaign-grid.tsx`
- `src/components/campaigns/campaign-hero.tsx`
- `src/components/campaigns/campaign-filters.tsx`

---

## Phase 2: Pledge System

### 2A. Pledge Schema

**Goal:** Track pledges and payment authorization.

**Schema Addition:**

```prisma
model Pledge {
  id              String   @id @default(cuid())
  campaignId      String
  userId          String
  rewardId        String?
  amount          Float
  tipAmount       Float    @default(0) // Optional platform tip
  status          String   @default("active") // active, cancelled, collected, failed, refunded
  paymentMethodId String?  // Stored payment method
  paymentIntentId String?  // For collection
  collectedAt     DateTime?
  cancelledAt     DateTime?
  isAnonymous     Boolean  @default(false)
  message         String?  // Public backer message
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  campaign PledgeCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user     User           @relation(fields: [userId], references: [id])
  reward   CampaignReward? @relation(fields: [rewardId], references: [id])

  @@index([campaignId, status])
  @@index([userId, status])
}
```

**Files:**
- `src/lib/campaigns/pledges.ts` - Pledge management
- `src/app/api/campaigns/[slug]/pledge/route.ts`
- `src/app/api/pledges/[id]/route.ts` - Manage pledge
- `src/components/campaigns/pledge-form.tsx`
- `src/components/campaigns/pledge-summary.tsx`

### 2B. Payment Authorization

**Goal:** Authorize payment without charging.

**Files:**
- `src/lib/campaigns/payment-auth.ts` - Payment authorization
- `src/components/campaigns/payment-method-form.tsx`
- `src/components/campaigns/saved-methods.tsx`
- Integration with payment provider (Stripe SetupIntent)

### 2C. Pledge Management

**Goal:** Backers manage their pledges.

**Files:**
- `src/app/(app)/pledges/page.tsx` - My pledges
- `src/components/campaigns/pledge-card.tsx`
- `src/components/campaigns/cancel-pledge-modal.tsx`
- `src/components/campaigns/update-pledge-modal.tsx`

---

## Phase 3: Rewards

### 3A. Reward Tiers

**Goal:** Incentive rewards for backers.

**Schema Addition:**

```prisma
model CampaignReward {
  id              String   @id @default(cuid())
  campaignId      String
  title           String
  description     String
  amount          Float    // Minimum pledge for reward
  quantity        Int?     // null for unlimited
  claimed         Int      @default(0)
  estimatedDelivery DateTime?
  deliveryType    String   @default("digital") // digital, physical, experience
  shippingRequired Boolean @default(false)
  shippingCost    Float?
  imageUrl        String?
  items           Json?    // [{ name, quantity }]
  order           Int      @default(0)
  isVisible       Boolean  @default(true)
  createdAt       DateTime @default(now())

  campaign PledgeCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  pledges  Pledge[]

  @@index([campaignId, amount])
}
```

**Files:**
- `src/lib/campaigns/rewards.ts`
- `src/app/api/campaigns/[slug]/rewards/route.ts`
- `src/components/campaigns/reward-card.tsx`
- `src/components/campaigns/reward-selector.tsx`
- `src/components/campaigns/reward-form.tsx`

### 3B. Reward Fulfillment

**Goal:** Track reward delivery.

**Schema Addition:**

```prisma
model RewardFulfillment {
  id              String   @id @default(cuid())
  pledgeId        String   @unique
  rewardId        String
  status          String   @default("pending") // pending, processing, shipped, delivered
  shippingAddress Json?
  trackingNumber  String?
  trackingUrl     String?
  notes           String?
  fulfilledAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Files:**
- `src/lib/campaigns/fulfillment.ts`
- `src/app/(app)/campaigns/[slug]/manage/fulfillment/page.tsx`
- `src/components/campaigns/fulfillment-table.tsx`
- `src/components/campaigns/shipping-form.tsx`

---

## Phase 4: Campaign Progress

### 4A. Progress Display

**Goal:** Real-time campaign progress.

**Files:**
- `src/components/campaigns/progress-bar.tsx`
- `src/components/campaigns/funding-stats.tsx`
- `src/components/campaigns/backer-count.tsx`
- `src/components/campaigns/time-remaining.tsx`
- `src/components/campaigns/recent-backers.tsx`

### 4B. Stretch Goals

**Goal:** Unlock additional goals when funded.

**Files:**
- `src/lib/campaigns/stretch-goals.ts`
- `src/components/campaigns/stretch-goal-card.tsx`
- `src/components/campaigns/stretch-goals-timeline.tsx`
- `src/components/campaigns/goal-unlocked-celebration.tsx`

### 4C. Campaign Updates

**Goal:** Creator posts updates to backers.

**Schema Addition:**

```prisma
model CampaignUpdate {
  id              String   @id @default(cuid())
  campaignId      String
  authorId        String
  title           String
  content         Json     // Rich content
  isBackersOnly   Boolean  @default(false)
  attachments     String[]
  commentCount    Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  campaign PledgeCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId, createdAt])
}
```

**Files:**
- `src/lib/campaigns/updates.ts`
- `src/app/api/campaigns/[slug]/updates/route.ts`
- `src/components/campaigns/update-card.tsx`
- `src/components/campaigns/update-form.tsx`
- `src/components/campaigns/updates-list.tsx`

---

## Phase 5: Campaign Settlement

### 5A. Success Settlement

**Goal:** Collect pledges when campaign succeeds.

**Files:**
- `src/lib/campaigns/settlement.ts` - Settlement logic
- `src/lib/campaigns/collection.ts` - Charge pledges
- Cron job to check and settle campaigns
- Error handling for failed payments
- Retry logic for transient failures

### 5B. Failure Handling

**Goal:** Handle failed campaigns gracefully.

**Files:**
- `src/lib/campaigns/failure.ts`
- `src/components/campaigns/campaign-failed.tsx`
- Email notifications to backers
- Release payment authorizations

### 5C. Refunds

**Goal:** Process refunds when needed.

**Files:**
- `src/lib/campaigns/refunds.ts`
- `src/app/api/pledges/[id]/refund/route.ts`
- `src/components/campaigns/refund-request.tsx`
- Admin refund management

---

## Phase 6: Social Features

### 6A. Backer Wall

**Goal:** Showcase campaign supporters.

**Files:**
- `src/components/campaigns/backer-wall.tsx`
- `src/components/campaigns/backer-avatar.tsx`
- `src/components/campaigns/backer-message.tsx`
- `src/components/campaigns/top-backers.tsx`

### 6B. Campaign Sharing

**Goal:** Amplify campaign reach.

**Files:**
- `src/lib/campaigns/sharing.ts`
- `src/components/campaigns/share-campaign.tsx`
- `src/components/campaigns/referral-link.tsx`
- `src/components/campaigns/social-preview.tsx`
- Dynamic OG images for campaigns

### 6C. Campaign Comments

**Goal:** Community discussion.

**Schema Addition:**

```prisma
model CampaignComment {
  id          String   @id @default(cuid())
  campaignId  String
  userId      String
  parentId    String?  // For replies
  content     String
  isCreator   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  campaign PledgeCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  parent   CampaignComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies  CampaignComment[] @relation("CommentReplies")

  @@index([campaignId, createdAt])
}
```

**Files:**
- `src/lib/campaigns/comments.ts`
- `src/app/api/campaigns/[slug]/comments/route.ts`
- `src/components/campaigns/comment-section.tsx`
- `src/components/campaigns/comment-form.tsx`

---

## Phase 7: Analytics & Management

### 7A. Creator Dashboard

**Goal:** Campaign management for creators.

**Files:**
- `src/app/(app)/campaigns/[slug]/manage/page.tsx`
- `src/components/campaigns/creator-dashboard.tsx`
- `src/components/campaigns/pledge-analytics.tsx`
- `src/components/campaigns/conversion-funnel.tsx`
- `src/components/campaigns/traffic-sources.tsx`

### 7B. Backer Management

**Goal:** Manage backers and communications.

**Files:**
- `src/app/(app)/campaigns/[slug]/manage/backers/page.tsx`
- `src/components/campaigns/backer-table.tsx`
- `src/components/campaigns/message-backers.tsx`
- `src/components/campaigns/export-backers.tsx`

### 7C. Admin Oversight

**Goal:** Platform-level campaign management.

**Files:**
- `src/app/admin/campaigns/page.tsx`
- `src/app/admin/campaigns/[id]/page.tsx`
- `src/components/admin/campaign-review.tsx`
- `src/components/admin/campaign-flags.tsx`
- `src/components/admin/settlement-queue.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Campaign Foundation | Large | High |
| 2 | Pledge System | Large | High |
| 3 | Rewards | Medium | Medium |
| 4 | Campaign Progress | Medium | High |
| 5 | Settlement | Large | Critical |
| 6 | Social Features | Medium | Medium |
| 7 | Analytics & Management | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add PledgeCampaign, Pledge, CampaignReward, RewardFulfillment, CampaignUpdate, CampaignComment

### New Libraries
- `src/lib/campaigns/index.ts`
- `src/lib/campaigns/pledges.ts`
- `src/lib/campaigns/payment-auth.ts`
- `src/lib/campaigns/rewards.ts`
- `src/lib/campaigns/fulfillment.ts`
- `src/lib/campaigns/stretch-goals.ts`
- `src/lib/campaigns/updates.ts`
- `src/lib/campaigns/settlement.ts`
- `src/lib/campaigns/collection.ts`
- `src/lib/campaigns/failure.ts`
- `src/lib/campaigns/refunds.ts`
- `src/lib/campaigns/sharing.ts`
- `src/lib/campaigns/comments.ts`

### Pages
- `src/app/(app)/campaigns/page.tsx`
- `src/app/(app)/campaigns/[slug]/page.tsx`
- `src/app/(app)/campaigns/create/page.tsx`
- `src/app/(app)/campaigns/[slug]/manage/page.tsx`
- `src/app/(app)/pledges/page.tsx`
- `src/app/admin/campaigns/page.tsx`

---

## Funding Types

| Type | Description | Success Criteria |
|------|-------------|------------------|
| **All-or-Nothing** | Pledges only collected if goal reached | 100% of goal |
| **Flexible** | Pledges collected regardless of goal | Any amount |
| **Milestone** | Pledges collected at percentage milestones | 25%, 50%, 75%, 100% |

---

## Fee Structure

| Fee Type | Rate | Notes |
|----------|------|-------|
| Platform fee | 5% | On successful campaigns only |
| Payment processing | 2.9% + $0.30 | Per pledge |
| Failed campaign | $0 | No fees if campaign fails |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test campaign creation flow
4. Verify pledge authorization
5. Test settlement process
6. Verify reward fulfillment tracking
7. Test refund handling

