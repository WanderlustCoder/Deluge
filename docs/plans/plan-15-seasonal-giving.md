# Plan 15: Seasonal & Event-Driven Giving

## Overview

Capitalize on natural giving moments (holidays, disasters, local events) with themed campaigns, giving calendars, and occasion-based features. Makes Deluge the go-to platform for meaningful giving during life's special moments.

---

## Phase 1: Giving Occasions

### 1A. Occasion Schema

**Goal:** Define giving occasions that trigger special features.

**Schema Addition:**

```prisma
model GivingOccasion {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  type          String   // holiday, awareness, disaster, personal, local
  description   String?
  startDate     DateTime
  endDate       DateTime
  imageUrl      String?
  iconName      String?  // Lucide icon name
  color         String?  // Theme color
  isRecurring   Boolean  @default(false)
  recurrenceRule String? // iCal RRULE for annual events
  matchingBonus Float?   // Extra matching during occasion
  featuredProjects String[] // Curated project IDs
  categories    String[] // Relevant categories
  isGlobal      Boolean  @default(true) // vs community-specific
  communityId   String?  // For local occasions
  status        String   @default("active") // draft, active, completed
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status, startDate])
  @@index([type])
}
```

**Pre-loaded Occasions:**
- Giving Tuesday (Nov)
- Earth Day (Apr 22)
- Back to School (Aug)
- Winter Holidays (Dec)
- MLK Day of Service (Jan)
- National Volunteer Week (Apr)
- Local Giving Day (varies)

**Files:**
- `src/lib/occasions.ts` - Occasion logic and helpers
- `src/lib/occasion-seed.ts` - Pre-load standard occasions
- `src/app/api/occasions/route.ts` - List occasions
- `src/app/api/occasions/[slug]/route.ts` - Get occasion

### 1B. Occasion Landing Pages

**Goal:** Dedicated pages for each occasion.

**Files:**
- `src/app/(app)/occasions/page.tsx` - Browse occasions
- `src/app/(app)/occasions/[slug]/page.tsx` - Occasion detail
- `src/components/occasions/occasion-card.tsx`
- `src/components/occasions/occasion-hero.tsx`
- `src/components/occasions/occasion-projects.tsx`

---

## Phase 2: Personal Occasions

### 2A. Gift Giving

**Goal:** Give to projects in someone's honor/memory.

**Schema Addition:**

```prisma
model GiftContribution {
  id            String   @id @default(cuid())
  contributorId String
  recipientName String
  recipientEmail String?
  occasionType  String   // birthday, memorial, celebration, thank_you
  message       String?
  amount        Float
  projectId     String?
  communityId   String?
  isAnonymous   Boolean  @default(false)
  notificationSent Boolean @default(false)
  notificationDate DateTime?
  certificateUrl String?
  createdAt     DateTime @default(now())

  contributor User @relation(fields: [contributorId], references: [id], onDelete: Cascade)

  @@index([contributorId])
  @@index([notificationDate])
}
```

**Files:**
- `src/lib/gift-giving.ts` - Gift contribution logic
- `src/app/api/gifts/route.ts` - Create gift
- `src/app/api/gifts/[id]/route.ts` - Get gift
- `src/app/(app)/give/gift/page.tsx` - Gift giving flow
- `src/components/gifts/gift-form.tsx`
- `src/components/gifts/gift-preview.tsx`
- `src/components/gifts/gift-certificate.tsx`

### 2B. Gift Certificates

**Goal:** Generate shareable certificates for gift recipients.

**Files:**
- `src/lib/pdf/gift-certificate-template.ts`
- `src/app/api/gifts/[id]/certificate/route.ts`
- `src/components/gifts/certificate-share.tsx`
- Email template for gift notifications

### 2C. Birthday Fundraisers

**Goal:** Users create fundraisers for their birthday.

**Schema Addition:**

```prisma
model BirthdayFundraiser {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  communityId String?
  targetAmount Float?
  currentAmount Float  @default(0)
  birthday    DateTime
  message     String?
  isActive    Boolean  @default(true)
  shareUrl    String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([birthday])
}
```

**Files:**
- `src/lib/birthday-fundraisers.ts`
- `src/app/api/birthday-fundraiser/route.ts`
- `src/app/(app)/birthday/page.tsx` - Create fundraiser
- `src/app/(marketing)/birthday/[shareId]/page.tsx` - Public fundraiser page
- `src/components/birthday/birthday-form.tsx`
- `src/components/birthday/birthday-progress.tsx`

---

## Phase 3: Disaster Response

### 3A. Emergency Campaigns

**Goal:** Rapid response to local/national emergencies.

**Schema Addition:**

```prisma
model EmergencyCampaign {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  description     String
  type            String   // natural_disaster, crisis, emergency
  location        String?
  affectedArea    Json?    // GeoJSON
  startDate       DateTime @default(now())
  endDate         DateTime?
  targetAmount    Float?
  currentAmount   Float    @default(0)
  verifiedOrgs    String[] // Verified relief organization IDs
  status          String   @default("active") // active, resolved, closed
  updateFrequency String   @default("daily") // How often updates are posted
  createdBy       String   // Admin who created
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  updates EmergencyUpdate[]

  @@index([status])
}

model EmergencyUpdate {
  id          String   @id @default(cuid())
  campaignId  String
  title       String
  content     String
  authorId    String
  createdAt   DateTime @default(now())

  campaign EmergencyCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId, createdAt])
}
```

**Files:**
- `src/lib/emergency.ts` - Emergency campaign logic
- `src/app/api/emergency/route.ts`
- `src/app/api/emergency/[slug]/route.ts`
- `src/app/(app)/emergency/page.tsx` - Active emergencies
- `src/app/(app)/emergency/[slug]/page.tsx` - Emergency detail
- `src/components/emergency/emergency-banner.tsx` - Site-wide alert
- `src/components/emergency/emergency-card.tsx`
- `src/components/emergency/update-timeline.tsx`
- `src/app/admin/emergency/page.tsx` - Admin management

### 3B. Verified Relief Organizations

**Goal:** Ensure emergency donations go to legitimate orgs.

**Files:**
- Add verification status to BusinessListing or create separate model
- `src/lib/relief-orgs.ts` - Verification logic
- `src/components/emergency/verified-org-card.tsx`

---

## Phase 4: Giving Calendar

### 4A. Personal Giving Calendar

**Goal:** Schedule and track giving throughout the year.

**Schema Addition:**

```prisma
model ScheduledGift {
  id            String   @id @default(cuid())
  userId        String
  occasionId    String?  // Link to GivingOccasion
  customOccasion String? // User-defined occasion
  scheduledDate DateTime
  amount        Float
  projectId     String?
  communityId   String?
  recipientName String?  // For gift contributions
  recipientEmail String?
  message       String?
  status        String   @default("scheduled") // scheduled, completed, skipped, failed
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, scheduledDate])
  @@index([scheduledDate, status])
}
```

**Files:**
- `src/lib/giving-calendar.ts` - Calendar logic
- `src/lib/scheduled-gifts-processor.ts` - Process scheduled gifts
- `src/app/api/calendar/route.ts`
- `src/app/(app)/calendar/page.tsx` - Giving calendar view
- `src/components/calendar/calendar-view.tsx`
- `src/components/calendar/schedule-gift-modal.tsx`
- `src/components/calendar/upcoming-gifts.tsx`

### 4B. Calendar Reminders

**Goal:** Notify users of upcoming scheduled giving.

**Files:**
- Add calendar notification types
- Email templates for reminders
- `src/components/calendar/reminder-preferences.tsx`

---

## Phase 5: Seasonal Campaigns

### 5A. Platform-Wide Campaigns

**Goal:** Deluge runs seasonal giving campaigns.

**Schema Addition:**

```prisma
model SeasonalCampaign {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  tagline         String?
  description     String
  startDate       DateTime
  endDate         DateTime
  platformGoal    Float?
  platformProgress Float   @default(0)
  matchingPartner String?
  matchingRatio   Float?
  heroImageUrl    String?
  themeColor      String?
  featuredProjects String[]
  badges          String[] // Special badges for this campaign
  status          String   @default("draft")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, startDate])
}
```

**Example Campaigns:**
- "30 Days of Giving" (December)
- "Spring into Action" (Earth Day week)
- "Back to School Boost" (August)
- "Giving Tuesday Challenge" (November)

**Files:**
- `src/lib/seasonal-campaigns.ts`
- `src/app/api/campaigns/seasonal/route.ts`
- `src/app/(app)/campaigns/[slug]/page.tsx`
- `src/components/campaigns/campaign-hero.tsx`
- `src/components/campaigns/platform-progress.tsx`
- `src/components/campaigns/campaign-badge.tsx`
- `src/app/admin/campaigns/page.tsx` - Admin management

### 5B. Community Seasonal Challenges

**Goal:** Communities compete during seasonal campaigns.

**Files:**
- Integration with existing challenges system
- `src/components/campaigns/community-rankings.tsx`
- `src/components/campaigns/challenge-card.tsx`

---

## Phase 6: Occasion Matching

### 6A. Occasion-Based Matching

**Goal:** Corporate sponsors provide extra matching during occasions.

**Files:**
- Update `src/lib/matching.ts` - Check for occasion matching
- `src/lib/occasion-matching.ts` - Occasion-specific logic
- `src/components/occasions/matching-indicator.tsx`
- `src/components/occasions/sponsor-attribution.tsx`

### 6B. Occasion Impact Reports

**Goal:** Generate reports for occasion-based giving.

**Files:**
- `src/lib/occasion-reports.ts`
- `src/app/api/occasions/[slug]/report/route.ts`
- `src/components/occasions/impact-summary.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Giving Occasions | Medium | High |
| 2 | Personal Occasions | Large | High |
| 3 | Disaster Response | Large | Medium |
| 4 | Giving Calendar | Medium | Medium |
| 5 | Seasonal Campaigns | Medium | High |
| 6 | Occasion Matching | Small | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add GivingOccasion, GiftContribution, BirthdayFundraiser, EmergencyCampaign, EmergencyUpdate, ScheduledGift, SeasonalCampaign

### New Libraries
- `src/lib/occasions.ts`
- `src/lib/occasion-seed.ts`
- `src/lib/gift-giving.ts`
- `src/lib/birthday-fundraisers.ts`
- `src/lib/emergency.ts`
- `src/lib/relief-orgs.ts`
- `src/lib/giving-calendar.ts`
- `src/lib/scheduled-gifts-processor.ts`
- `src/lib/seasonal-campaigns.ts`
- `src/lib/occasion-matching.ts`
- `src/lib/occasion-reports.ts`
- `src/lib/pdf/gift-certificate-template.ts`

### API Routes
- `src/app/api/occasions/route.ts`
- `src/app/api/occasions/[slug]/route.ts`
- `src/app/api/gifts/route.ts`
- `src/app/api/gifts/[id]/route.ts`
- `src/app/api/gifts/[id]/certificate/route.ts`
- `src/app/api/birthday-fundraiser/route.ts`
- `src/app/api/emergency/route.ts`
- `src/app/api/emergency/[slug]/route.ts`
- `src/app/api/calendar/route.ts`
- `src/app/api/campaigns/seasonal/route.ts`

### UI Components
- `src/components/occasions/occasion-card.tsx`
- `src/components/occasions/occasion-hero.tsx`
- `src/components/occasions/occasion-projects.tsx`
- `src/components/gifts/gift-form.tsx`
- `src/components/gifts/gift-preview.tsx`
- `src/components/gifts/gift-certificate.tsx`
- `src/components/gifts/certificate-share.tsx`
- `src/components/birthday/birthday-form.tsx`
- `src/components/birthday/birthday-progress.tsx`
- `src/components/emergency/emergency-banner.tsx`
- `src/components/emergency/emergency-card.tsx`
- `src/components/emergency/update-timeline.tsx`
- `src/components/calendar/calendar-view.tsx`
- `src/components/calendar/schedule-gift-modal.tsx`
- `src/components/campaigns/campaign-hero.tsx`
- `src/components/campaigns/platform-progress.tsx`

### Pages
- `src/app/(app)/occasions/page.tsx`
- `src/app/(app)/occasions/[slug]/page.tsx`
- `src/app/(app)/give/gift/page.tsx`
- `src/app/(app)/birthday/page.tsx`
- `src/app/(marketing)/birthday/[shareId]/page.tsx`
- `src/app/(app)/emergency/page.tsx`
- `src/app/(app)/emergency/[slug]/page.tsx`
- `src/app/(app)/calendar/page.tsx`
- `src/app/(app)/campaigns/[slug]/page.tsx`
- `src/app/admin/emergency/page.tsx`
- `src/app/admin/campaigns/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test occasion creation and display
4. Test gift contribution flow and certificate generation
5. Test emergency campaign creation and updates
6. Test scheduled gift processing
7. Verify seasonal campaign progress tracking
