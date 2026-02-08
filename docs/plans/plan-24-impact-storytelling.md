# Plan 24: Impact Storytelling & Social Proof

## Overview

Collect, curate, and showcase success stories, testimonials, and impact narratives. Builds trust, inspires action, and provides social proof that Deluge delivers on its promise of community impact.

---

## Phase 1: Story Collection

### 1A. Story Schema

**Goal:** Structure for collecting impact stories.

**Schema Addition:**

```prisma
model ImpactStory {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  summary         String   // 280 char tweet-length
  content         Json     // Rich content blocks
  type            String   // beneficiary, giver, community, project
  authorId        String?  // User who submitted
  authorName      String?  // For non-users
  authorRole      String?  // beneficiary, volunteer, funder, organizer
  projectId       String?
  communityId     String?
  loanId          String?
  mediaUrls       String[] // Photos, videos
  videoUrl        String?
  quotes          Json?    // Pull quotes
  impactMetrics   Json?    // { "people_helped": 50 }
  location        String?
  tags            String[]
  isFeatured      Boolean  @default(false)
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  status          String   @default("draft") // draft, review, published, archived
  viewCount       Int      @default(0)
  shareCount      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project   Project?   @relation(fields: [projectId], references: [id])
  community Community? @relation(fields: [communityId], references: [id])

  @@index([type, status])
  @@index([isFeatured])
  @@index([projectId])
  @@index([communityId])
}
```

**Files:**
- `src/lib/stories/index.ts` - Story management
- `src/app/api/stories/route.ts` - List/create stories
- `src/app/api/stories/[slug]/route.ts` - Get/update story

### 1B. Story Submission

**Goal:** Users and admins submit stories.

**Files:**
- `src/app/(app)/stories/submit/page.tsx` - Submit form
- `src/components/stories/story-form.tsx`
- `src/components/stories/rich-editor.tsx`
- `src/components/stories/media-uploader.tsx`
- `src/components/stories/quote-highlighter.tsx`

### 1C. Story Prompts

**Goal:** Guide users to share their stories.

**Schema Addition:**

```prisma
model StoryPrompt {
  id          String   @id @default(cuid())
  trigger     String   // project_completed, loan_repaid, badge_earned
  targetType  String   // giver, borrower, beneficiary
  promptText  String
  followUpQuestions String[]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@index([trigger, isActive])
}
```

**Files:**
- `src/lib/stories/prompts.ts` - Prompt triggers
- `src/components/stories/story-prompt-modal.tsx`
- Integration with project completion, loan repayment, etc.

---

## Phase 2: Testimonials

### 2A. Testimonial Collection

**Goal:** Collect short-form testimonials.

**Schema Addition:**

```prisma
model Testimonial {
  id              String   @id @default(cuid())
  content         String   // Short testimonial text
  authorId        String?
  authorName      String
  authorTitle     String?  // "Parent in Boise"
  authorImageUrl  String?
  rating          Float?   // 1-5 stars
  type            String   // platform, project, community, loan
  entityId        String?  // Related entity ID
  isVerified      Boolean  @default(false)
  isFeatured      Boolean  @default(false)
  isPublished     Boolean  @default(false)
  displayOrder    Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([type, isPublished])
  @@index([isFeatured])
}
```

**Files:**
- `src/lib/stories/testimonials.ts`
- `src/app/api/testimonials/route.ts`
- `src/components/stories/testimonial-form.tsx`
- `src/components/stories/testimonial-card.tsx`

### 2B. Review Requests

**Goal:** Proactively request testimonials.

**Files:**
- `src/lib/stories/review-requests.ts`
- Email templates for testimonial requests
- `src/components/stories/quick-testimonial.tsx`
- Integration with key user moments

---

## Phase 3: Story Display

### 3A. Stories Hub

**Goal:** Dedicated stories section.

**Files:**
- `src/app/(marketing)/stories/page.tsx` - Stories home
- `src/app/(marketing)/stories/[slug]/page.tsx` - Story detail
- `src/components/stories/stories-grid.tsx`
- `src/components/stories/story-card.tsx`
- `src/components/stories/story-hero.tsx`
- `src/components/stories/story-content.tsx`

### 3B. Embedded Stories

**Goal:** Show stories throughout the platform.

**Files:**
- `src/components/stories/inline-story.tsx`
- `src/components/stories/testimonial-carousel.tsx`
- `src/components/stories/featured-story-banner.tsx`
- `src/components/stories/related-stories.tsx`

**Integration Points:**
- Homepage hero
- Project detail pages
- Community pages
- Loan pages
- Checkout/funding confirmation

### 3C. Video Stories

**Goal:** Support video testimonials.

**Files:**
- `src/components/stories/video-player.tsx`
- `src/components/stories/video-testimonial.tsx`
- `src/components/stories/video-gallery.tsx`
- Video upload and processing integration

---

## Phase 4: Impact Visualization

### 4A. Impact Counter

**Goal:** Real-time platform impact display.

**Schema Addition:**

```prisma
model PlatformImpact {
  id              String   @id @default(cuid())
  metric          String   @unique // total_funded, projects_completed, etc.
  value           Float
  displayValue    String?  // Formatted value
  lastUpdated     DateTime @default(now())
}
```

**Files:**
- `src/lib/stories/impact-counter.ts`
- `src/components/stories/impact-counter.tsx`
- `src/components/stories/animated-counter.tsx`
- `src/components/stories/impact-milestone.tsx`

### 4B. Impact Maps

**Goal:** Visualize geographic impact.

**Files:**
- `src/components/stories/impact-map.tsx`
- `src/components/stories/community-dots.tsx`
- `src/components/stories/project-markers.tsx`
- `src/app/api/stories/map-data/route.ts`

### 4C. Before/After Comparisons

**Goal:** Visual project transformations.

**Schema Addition:**

```prisma
model BeforeAfter {
  id          String   @id @default(cuid())
  projectId   String
  title       String?
  beforeImage String
  afterImage  String
  beforeDate  DateTime?
  afterDate   DateTime?
  caption     String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}
```

**Files:**
- `src/components/stories/before-after-slider.tsx`
- `src/components/stories/before-after-gallery.tsx`
- `src/app/api/projects/[id]/before-after/route.ts`

---

## Phase 5: Social Proof

### 5A. Trust Indicators

**Goal:** Display trust-building elements.

**Files:**
- `src/components/stories/trust-bar.tsx` - Platform stats
- `src/components/stories/backer-count.tsx`
- `src/components/stories/recent-activity.tsx`
- `src/components/stories/community-endorsement.tsx`

### 5B. Social Sharing

**Goal:** Optimize story sharing.

**Files:**
- `src/lib/stories/sharing.ts`
- `src/components/stories/share-story.tsx`
- `src/components/stories/og-image-generator.tsx`
- Dynamic OG images for stories

### 5C. Embeddable Impact

**Goal:** Share impact on external sites.

**Files:**
- `src/app/embed/story/[slug]/route.tsx`
- `src/app/embed/testimonial/[id]/route.tsx`
- `src/app/embed/impact-counter/route.tsx`
- `src/components/stories/embed-code.tsx`

---

## Phase 6: Curation & Management

### 6A. Admin Story Management

**Goal:** Curate and manage stories.

**Files:**
- `src/app/admin/stories/page.tsx` - Story list
- `src/app/admin/stories/[id]/page.tsx` - Edit story
- `src/components/admin/story-review.tsx`
- `src/components/admin/testimonial-manager.tsx`
- `src/components/admin/featured-picker.tsx`

### 6B. Story Analytics

**Goal:** Track story performance.

**Schema Addition:**

```prisma
model StoryView {
  id        String   @id @default(cuid())
  storyId   String
  userId    String?
  source    String?  // direct, social, email
  createdAt DateTime @default(now())

  @@index([storyId, createdAt])
}

model StoryShare {
  id        String   @id @default(cuid())
  storyId   String
  platform  String   // twitter, facebook, email, copy
  userId    String?
  createdAt DateTime @default(now())

  @@index([storyId, platform])
}
```

**Files:**
- `src/lib/stories/analytics.ts`
- `src/app/admin/stories/analytics/page.tsx`
- `src/components/admin/story-performance.tsx`

### 6C. Story Campaigns

**Goal:** Coordinated story collection efforts.

**Schema Addition:**

```prisma
model StoryCampaign {
  id          String   @id @default(cuid())
  name        String
  description String?
  theme       String?  // "Back to School", "Year in Review"
  startDate   DateTime
  endDate     DateTime
  targetCount Int?
  currentCount Int     @default(0)
  status      String   @default("active")
  createdAt   DateTime @default(now())

  @@index([status, startDate])
}
```

**Files:**
- `src/lib/stories/campaigns.ts`
- `src/app/admin/stories/campaigns/page.tsx`
- `src/components/stories/campaign-banner.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Story Collection | Medium | High |
| 2 | Testimonials | Medium | High |
| 3 | Story Display | Large | High |
| 4 | Impact Visualization | Medium | Medium |
| 5 | Social Proof | Medium | High |
| 6 | Curation & Management | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add ImpactStory, StoryPrompt, Testimonial, PlatformImpact, BeforeAfter, StoryView, StoryShare, StoryCampaign

### New Libraries
- `src/lib/stories/index.ts`
- `src/lib/stories/prompts.ts`
- `src/lib/stories/testimonials.ts`
- `src/lib/stories/review-requests.ts`
- `src/lib/stories/impact-counter.ts`
- `src/lib/stories/sharing.ts`
- `src/lib/stories/analytics.ts`
- `src/lib/stories/campaigns.ts`

### Pages
- `src/app/(marketing)/stories/page.tsx`
- `src/app/(marketing)/stories/[slug]/page.tsx`
- `src/app/(app)/stories/submit/page.tsx`
- `src/app/admin/stories/page.tsx`
- `src/app/admin/stories/[id]/page.tsx`
- `src/app/admin/stories/analytics/page.tsx`
- `src/app/admin/stories/campaigns/page.tsx`

---

## Content Strategy

### Story Types to Collect
1. **Beneficiary stories**: "How this playground changed our neighborhood"
2. **Giver journeys**: "My first year on Deluge"
3. **Loan success stories**: "From microloan to thriving bakery"
4. **Community transformations**: "How Meridian came together"
5. **Volunteer experiences**: "50 hours that made a difference"

### Story Collection Triggers
- Project reaches 100% funding
- Project marked complete
- Loan fully repaid
- User anniversary
- Badge earned
- Community milestone

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test story submission flow
4. Verify testimonial collection
5. Test story display and sharing
6. Verify impact counters update correctly
7. Test admin curation tools
