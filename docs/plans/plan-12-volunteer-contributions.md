# Plan 12: Volunteer Hours & In-Kind Contributions

## Overview

Enable non-monetary contributions through volunteer time tracking and in-kind donations. Expands participation beyond financial giving and captures the full scope of community contribution.

---

## Phase 1: Volunteer Hours Tracking

### 1A. Volunteer Opportunity Schema

**Goal:** Projects can request volunteers, users can log hours.

**Schema Addition:**

```prisma
model VolunteerOpportunity {
  id              String   @id @default(cuid())
  projectId       String
  title           String
  description     String
  hoursNeeded     Float?   // Target hours (optional)
  hoursLogged     Float    @default(0)
  skillsRequired  String[] // e.g., ["construction", "teaching", "admin"]
  location        String?
  isRemote        Boolean  @default(false)
  startDate       DateTime?
  endDate         DateTime?
  status          String   @default("open") // open, filled, closed
  maxVolunteers   Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project  Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  signups  VolunteerSignup[]
  logs     VolunteerLog[]

  @@index([projectId, status])
  @@index([status, startDate])
}

model VolunteerSignup {
  id            String   @id @default(cuid())
  opportunityId String
  userId        String
  status        String   @default("interested") // interested, confirmed, completed, cancelled
  message       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  opportunity VolunteerOpportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([opportunityId, userId])
}

model VolunteerLog {
  id            String   @id @default(cuid())
  opportunityId String
  userId        String
  hours         Float
  date          DateTime
  description   String?
  verified      Boolean  @default(false)
  verifiedBy    String?
  verifiedAt    DateTime?
  createdAt     DateTime @default(now())

  opportunity VolunteerOpportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([opportunityId])
}
```

**Files:**
- `src/lib/volunteer.ts` - Volunteer management logic
- `src/app/api/volunteer/opportunities/route.ts` - List/create opportunities
- `src/app/api/volunteer/opportunities/[id]/route.ts` - Single opportunity
- `src/app/api/volunteer/opportunities/[id]/signup/route.ts` - Sign up
- `src/app/api/volunteer/log/route.ts` - Log hours

### 1B. Volunteer UI

**Goal:** Interface for finding and logging volunteer work.

**Files:**
- `src/app/(app)/volunteer/page.tsx` - Browse opportunities
- `src/app/(app)/volunteer/[id]/page.tsx` - Opportunity detail
- `src/components/volunteer/opportunity-card.tsx`
- `src/components/volunteer/signup-modal.tsx`
- `src/components/volunteer/log-hours-modal.tsx`
- `src/components/volunteer/hours-summary.tsx`

---

## Phase 2: Skills Marketplace

### 2A. User Skills Profile

**Goal:** Users list skills they can contribute.

**Schema Addition:**

```prisma
model UserSkill {
  id          String   @id @default(cuid())
  userId      String
  skill       String
  level       String   @default("intermediate") // beginner, intermediate, expert
  description String?
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, skill])
  @@index([skill])
}
```

**Skill Categories:**
- Technical: web development, graphic design, video editing
- Professional: accounting, legal, marketing, writing
- Trade: construction, plumbing, electrical, landscaping
- Education: tutoring, mentoring, training
- Administrative: data entry, organization, event planning

**Files:**
- `src/lib/skills.ts` - Skills constants and matching
- `src/app/api/account/skills/route.ts`
- `src/components/account/skills-editor.tsx`

### 2B. Skills Matching

**Goal:** Match projects with skilled volunteers.

**Files:**
- `src/lib/volunteer-matching.ts` - Match algorithm
- `src/app/api/volunteer/matches/route.ts` - Get matches for user
- `src/components/volunteer/skill-match-card.tsx`
- `src/components/volunteer/suggested-opportunities.tsx`

---

## Phase 3: In-Kind Donations

### 3A. Material Donations

**Goal:** Track non-monetary contributions to projects.

**Schema Addition:**

```prisma
model InKindDonation {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  type        String   // materials, equipment, space, services
  description String
  value       Float?   // Estimated value (optional)
  status      String   @default("offered") // offered, accepted, received, declined
  receivedAt  DateTime?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId, status])
  @@index([userId])
}

model ProjectNeed {
  id          String   @id @default(cuid())
  projectId   String
  type        String   // materials, equipment, space, services, volunteer_hours
  description String
  quantity    Int?
  estimatedValue Float?
  fulfilled   Boolean  @default(false)
  fulfilledBy String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, fulfilled])
}
```

**Files:**
- `src/lib/in-kind.ts` - In-kind donation logic
- `src/app/api/projects/[id]/needs/route.ts` - Project needs
- `src/app/api/projects/[id]/in-kind/route.ts` - Offer donation
- `src/components/projects/needs-list.tsx`
- `src/components/projects/offer-donation-modal.tsx`

### 3B. Donation Receipts

**Goal:** Generate receipts for in-kind donations (tax purposes).

**Files:**
- Update `src/lib/receipts.ts` - Add in-kind receipt type
- `src/lib/pdf/in-kind-receipt-template.ts`
- `src/app/api/in-kind/[id]/receipt/route.ts`

---

## Phase 4: Volunteer Impact

### 4A. Volunteer Leaderboards

**Goal:** Community-level volunteer recognition (not individual).

**Metrics:**
- Total hours logged per community
- Projects with most volunteer support
- Skills contributed per community

**Files:**
- `src/lib/volunteer-stats.ts` - Aggregate stats
- `src/app/api/volunteer/stats/route.ts`
- `src/components/volunteer/community-volunteer-stats.tsx`

### 4B. Volunteer Badges

**Goal:** Recognize volunteer contributions.

**New Badges:**
- First Hour: Log first volunteer hour
- Time Giver: 10 volunteer hours
- Dedicated Volunteer: 50 hours
- Community Pillar: 100 hours
- Skilled Contributor: Use specialized skill on project

**Files:**
- Update `src/lib/badges.ts` - Add volunteer badges
- Badge check integration in hour logging

### 4C. Volunteer Impact on Profile

**Goal:** Show volunteer contributions on user profile.

**Files:**
- `src/components/account/volunteer-stats.tsx`
- Update `/account` page to show volunteer summary
- `src/components/account/volunteer-history.tsx`

---

## Phase 5: Verification System

### 5A. Hour Verification

**Goal:** Project leads verify volunteer hours.

**Flow:**
1. Volunteer logs hours
2. Project lead gets notification
3. Project lead approves/adjusts/rejects
4. Verified hours count toward badges

**Files:**
- `src/app/api/volunteer/log/[id]/verify/route.ts`
- `src/components/volunteer/verify-hours-modal.tsx`
- `src/components/volunteer/pending-verification-list.tsx`

### 5B. Verified Volunteer Badge

**Goal:** Mark users with verified volunteer hours.

**Schema Update:**

Add to User:
```prisma
totalVerifiedHours Float @default(0)
```

**Files:**
- Update `src/lib/volunteer.ts` - Track verified totals
- `src/components/ui/verified-volunteer-badge.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Volunteer Hours Tracking | Large | High |
| 2 | Skills Marketplace | Medium | Medium |
| 3 | In-Kind Donations | Medium | Medium |
| 4 | Volunteer Impact | Medium | Medium |
| 5 | Verification System | Medium | High |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add VolunteerOpportunity, VolunteerSignup, VolunteerLog, UserSkill, InKindDonation, ProjectNeed

### New Libraries
- `src/lib/volunteer.ts`
- `src/lib/volunteer-matching.ts`
- `src/lib/volunteer-stats.ts`
- `src/lib/skills.ts`
- `src/lib/in-kind.ts`
- `src/lib/pdf/in-kind-receipt-template.ts`

### API Routes
- `src/app/api/volunteer/opportunities/route.ts`
- `src/app/api/volunteer/opportunities/[id]/route.ts`
- `src/app/api/volunteer/opportunities/[id]/signup/route.ts`
- `src/app/api/volunteer/log/route.ts`
- `src/app/api/volunteer/log/[id]/verify/route.ts`
- `src/app/api/volunteer/matches/route.ts`
- `src/app/api/volunteer/stats/route.ts`
- `src/app/api/account/skills/route.ts`
- `src/app/api/projects/[id]/needs/route.ts`
- `src/app/api/projects/[id]/in-kind/route.ts`
- `src/app/api/in-kind/[id]/receipt/route.ts`

### UI Components
- `src/components/volunteer/opportunity-card.tsx`
- `src/components/volunteer/signup-modal.tsx`
- `src/components/volunteer/log-hours-modal.tsx`
- `src/components/volunteer/hours-summary.tsx`
- `src/components/volunteer/skill-match-card.tsx`
- `src/components/volunteer/suggested-opportunities.tsx`
- `src/components/volunteer/verify-hours-modal.tsx`
- `src/components/volunteer/pending-verification-list.tsx`
- `src/components/volunteer/community-volunteer-stats.tsx`
- `src/components/account/skills-editor.tsx`
- `src/components/account/volunteer-stats.tsx`
- `src/components/account/volunteer-history.tsx`
- `src/components/projects/needs-list.tsx`
- `src/components/projects/offer-donation-modal.tsx`

### Pages
- `src/app/(app)/volunteer/page.tsx`
- `src/app/(app)/volunteer/[id]/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test opportunity creation and signup flow
4. Test hour logging and verification
5. Verify badge awards for volunteer milestones
