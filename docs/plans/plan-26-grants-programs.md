# Plan 26: Grants & Large Funding Programs

## Overview

Formal grant application and management system for larger funding amounts ($5K+). Enables foundations, corporations, and institutions to run structured grantmaking programs through Deluge with applications, review workflows, and reporting requirements.

---

## Phase 1: Grant Program Foundation

### 1A. Grant Program Schema

**Goal:** Define grant programs with application cycles.

**Schema Addition:**

```prisma
model GrantProgram {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String
  funderId        String   // User/org providing funds
  funderType      String   // individual, corporate, foundation, institution
  totalBudget     Float
  remainingBudget Float
  minGrant        Float    @default(1000)
  maxGrant        Float    @default(50000)
  categories      String[]
  eligibility     Json     // Eligibility criteria
  focusAreas      String[]
  geographicFocus String[] // Regions, communities
  applicationStart DateTime
  applicationEnd   DateTime
  reviewStart     DateTime?
  awardDate       DateTime?
  reportingRequired Boolean @default(true)
  reportingFrequency String? // monthly, quarterly, final
  status          String   @default("draft") // draft, open, reviewing, awarded, completed
  isPublic        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  applications GrantApplication[]
  awards       GrantAward[]
  reviewers    GrantReviewer[]
  reports      GrantReport[]

  @@index([status, applicationEnd])
  @@index([funderId])
}

model GrantReviewer {
  id          String   @id @default(cuid())
  programId   String
  userId      String
  role        String   @default("reviewer") // lead, reviewer, advisor
  assignedAt  DateTime @default(now())

  program GrantProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([programId, userId])
}
```

**Files:**
- `src/lib/grants/programs.ts` - Program management
- `src/app/api/grants/programs/route.ts`
- `src/app/api/grants/programs/[slug]/route.ts`

### 1B. Grant Discovery

**Goal:** Browse and find grant opportunities.

**Files:**
- `src/app/(app)/grants/page.tsx` - Browse grants
- `src/app/(app)/grants/[slug]/page.tsx` - Program detail
- `src/components/grants/program-card.tsx`
- `src/components/grants/eligibility-checker.tsx`
- `src/components/grants/program-timeline.tsx`

---

## Phase 2: Application System

### 2A. Application Schema

**Goal:** Structured grant applications.

**Schema Addition:**

```prisma
model GrantApplication {
  id              String   @id @default(cuid())
  programId       String
  applicantId     String
  projectTitle    String
  projectSummary  String
  requestedAmount Float
  proposedBudget  Json     // Line-item budget
  timeline        Json     // Project timeline
  teamMembers     Json     // Team information
  impactStatement String
  measurableOutcomes Json  // Specific outcomes
  attachments     String[] // Supporting documents
  answers         Json     // Custom question responses
  status          String   @default("draft") // draft, submitted, under_review, approved, rejected, withdrawn
  submittedAt     DateTime?
  lastSavedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  program  GrantProgram    @relation(fields: [programId], references: [id], onDelete: Cascade)
  applicant User           @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  reviews  GrantReview[]
  feedback GrantFeedback[]

  @@unique([programId, applicantId])
  @@index([programId, status])
  @@index([applicantId])
}

model GrantQuestion {
  id          String   @id @default(cuid())
  programId   String
  question    String
  type        String   // text, textarea, select, multiselect, file, number
  options     String[] // For select/multiselect
  isRequired  Boolean  @default(true)
  maxLength   Int?
  helpText    String?
  order       Int      @default(0)
  section     String?  // Group questions into sections
  createdAt   DateTime @default(now())

  @@index([programId, order])
}
```

**Files:**
- `src/lib/grants/applications.ts` - Application logic
- `src/app/(app)/grants/[slug]/apply/page.tsx` - Application form
- `src/app/api/grants/applications/route.ts`
- `src/components/grants/application-form.tsx`
- `src/components/grants/budget-builder.tsx`
- `src/components/grants/timeline-editor.tsx`
- `src/components/grants/file-uploader.tsx`

### 2B. Application Workflow

**Goal:** Save drafts, submit, track status.

**Files:**
- `src/app/(app)/grants/my-applications/page.tsx`
- `src/components/grants/application-status.tsx`
- `src/components/grants/draft-indicator.tsx`
- Auto-save functionality

---

## Phase 3: Review Process

### 3A. Review System

**Goal:** Structured application review.

**Schema Addition:**

```prisma
model GrantReview {
  id            String   @id @default(cuid())
  applicationId String
  reviewerId    String
  scores        Json     // { "impact": 4, "feasibility": 3, ... }
  overallScore  Float
  strengths     String?
  weaknesses    String?
  recommendation String  // fund, fund_with_conditions, decline, needs_discussion
  isComplete    Boolean  @default(false)
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  application GrantApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([applicationId, reviewerId])
  @@index([applicationId])
}

model GrantRubric {
  id          String   @id @default(cuid())
  programId   String   @unique
  criteria    Json     // [{ name, description, weight, levels }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Files:**
- `src/lib/grants/reviews.ts` - Review logic
- `src/app/(app)/grants/review/page.tsx` - Reviewer dashboard
- `src/app/(app)/grants/review/[id]/page.tsx` - Review application
- `src/components/grants/review-form.tsx`
- `src/components/grants/scoring-rubric.tsx`
- `src/components/grants/review-summary.tsx`

### 3B. Committee Decisions

**Goal:** Final funding decisions.

**Files:**
- `src/app/(app)/grants/[slug]/committee/page.tsx`
- `src/components/grants/application-comparison.tsx`
- `src/components/grants/decision-panel.tsx`
- `src/components/grants/award-recommendation.tsx`

---

## Phase 4: Awards & Disbursement

### 4A. Grant Awards

**Goal:** Issue and track grant awards.

**Schema Addition:**

```prisma
model GrantAward {
  id              String   @id @default(cuid())
  programId       String
  applicationId   String   @unique
  recipientId     String
  awardedAmount   Float
  conditions      String?  // Conditions for funding
  disbursementSchedule Json // [{ date, amount, status }]
  totalDisbursed  Float    @default(0)
  status          String   @default("pending") // pending, active, completed, terminated
  awardedAt       DateTime @default(now())
  startDate       DateTime
  endDate         DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  program     GrantProgram     @relation(fields: [programId], references: [id], onDelete: Cascade)
  application GrantApplication @relation(fields: [applicationId], references: [id])
  disbursements GrantDisbursement[]

  @@index([programId, status])
  @@index([recipientId])
}

model GrantDisbursement {
  id          String   @id @default(cuid())
  awardId     String
  amount      Float
  scheduledDate DateTime
  disbursedAt DateTime?
  status      String   @default("scheduled") // scheduled, pending, disbursed, failed
  notes       String?
  createdAt   DateTime @default(now())

  award GrantAward @relation(fields: [awardId], references: [id], onDelete: Cascade)

  @@index([awardId, status])
}
```

**Files:**
- `src/lib/grants/awards.ts` - Award management
- `src/lib/grants/disbursements.ts` - Payment processing
- `src/app/(app)/grants/awards/page.tsx` - Recipient view
- `src/components/grants/award-letter.tsx`
- `src/components/grants/disbursement-schedule.tsx`

### 4B. Award Notifications

**Goal:** Notify applicants of decisions.

**Files:**
- Email templates for approval/rejection
- `src/components/grants/decision-notification.tsx`
- `src/lib/grants/notifications.ts`

---

## Phase 5: Reporting & Compliance

### 5A. Progress Reports

**Goal:** Grantees submit required reports.

**Schema Addition:**

```prisma
model GrantReport {
  id              String   @id @default(cuid())
  awardId         String
  programId       String
  type            String   // progress, final, financial
  periodStart     DateTime
  periodEnd       DateTime
  content         Json     // Report content
  attachments     String[]
  status          String   @default("draft") // draft, submitted, approved, revision_requested
  submittedAt     DateTime?
  reviewedAt      DateTime?
  reviewedBy      String?
  feedback        String?
  dueDate         DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  program GrantProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([awardId, type])
  @@index([programId, status])
}

model GrantReportTemplate {
  id          String   @id @default(cuid())
  programId   String
  type        String   // progress, final, financial
  sections    Json     // Report sections and questions
  createdAt   DateTime @default(now())

  @@unique([programId, type])
}
```

**Files:**
- `src/lib/grants/reports.ts` - Report management
- `src/app/(app)/grants/awards/[id]/report/page.tsx`
- `src/components/grants/report-form.tsx`
- `src/components/grants/financial-report.tsx`
- `src/components/grants/outcomes-report.tsx`

### 5B. Compliance Tracking

**Goal:** Track grantee compliance.

**Files:**
- `src/lib/grants/compliance.ts`
- `src/app/(app)/grants/[slug]/compliance/page.tsx`
- `src/components/grants/compliance-dashboard.tsx`
- `src/components/grants/deadline-tracker.tsx`
- `src/components/grants/report-reminder.tsx`

---

## Phase 6: Funder Dashboard

### 6A. Program Management

**Goal:** Funders manage their grant programs.

**Files:**
- `src/app/(app)/grants/manage/page.tsx` - Funder dashboard
- `src/app/(app)/grants/manage/[slug]/page.tsx` - Program management
- `src/app/(app)/grants/manage/new/page.tsx` - Create program
- `src/components/grants/program-form.tsx`
- `src/components/grants/question-builder.tsx`
- `src/components/grants/rubric-builder.tsx`

### 6B. Portfolio Analytics

**Goal:** Track grant portfolio performance.

**Files:**
- `src/lib/grants/analytics.ts`
- `src/app/(app)/grants/manage/analytics/page.tsx`
- `src/components/grants/portfolio-overview.tsx`
- `src/components/grants/impact-aggregator.tsx`
- `src/components/grants/geographic-distribution.tsx`

### 6C. Funder Reports

**Goal:** Generate reports for funders.

**Files:**
- `src/lib/grants/funder-reports.ts`
- `src/lib/pdf/grant-portfolio-template.ts`
- `src/app/api/grants/programs/[slug]/report/route.ts`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Grant Program Foundation | Large | High |
| 2 | Application System | Large | High |
| 3 | Review Process | Large | High |
| 4 | Awards & Disbursement | Large | High |
| 5 | Reporting & Compliance | Large | Medium |
| 6 | Funder Dashboard | Large | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add GrantProgram, GrantReviewer, GrantApplication, GrantQuestion, GrantReview, GrantRubric, GrantAward, GrantDisbursement, GrantReport, GrantReportTemplate

### New Libraries
- `src/lib/grants/programs.ts`
- `src/lib/grants/applications.ts`
- `src/lib/grants/reviews.ts`
- `src/lib/grants/awards.ts`
- `src/lib/grants/disbursements.ts`
- `src/lib/grants/reports.ts`
- `src/lib/grants/compliance.ts`
- `src/lib/grants/analytics.ts`
- `src/lib/grants/funder-reports.ts`
- `src/lib/grants/notifications.ts`

### Pages
- `src/app/(app)/grants/page.tsx`
- `src/app/(app)/grants/[slug]/page.tsx`
- `src/app/(app)/grants/[slug]/apply/page.tsx`
- `src/app/(app)/grants/my-applications/page.tsx`
- `src/app/(app)/grants/review/page.tsx`
- `src/app/(app)/grants/awards/page.tsx`
- `src/app/(app)/grants/manage/page.tsx`

---

## Grant Types Supported

| Type | Amount Range | Use Case |
|------|--------------|----------|
| **Micro-grants** | $1K-$5K | Quick community projects |
| **Project grants** | $5K-$25K | Standard community initiatives |
| **Capacity grants** | $10K-$50K | Organizational development |
| **Multi-year grants** | $25K-$100K+ | Sustained programs |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test application submission flow
4. Verify review scoring and aggregation
5. Test disbursement scheduling
6. Verify report submission and review
