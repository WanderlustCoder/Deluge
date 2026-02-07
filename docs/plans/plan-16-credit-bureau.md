# Plan 16: Credit Bureau Reporting

## Overview

Report microloan repayment to credit bureaus (Experian, TransUnion, Equifax), transforming Deluge microloans into a real credit-building pathway. This is explicitly called out in the business model as a Year 3-4 feature with estimated cost of $75-120K.

---

## Phase 1: Compliance Foundation

### 1A. FCRA Compliance Infrastructure

**Goal:** Build the legal and technical foundation for credit reporting.

**Schema Addition:**

```prisma
model CreditReportingConsent {
  id              String   @id @default(cuid())
  userId          String
  loanId          String
  consentGiven    Boolean
  consentDate     DateTime
  consentVersion  String   // Version of consent form
  ipAddress       String?
  userAgent       String?
  withdrawnAt     DateTime?
  withdrawnReason String?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  loan Loan @relation(fields: [loanId], references: [id], onDelete: Cascade)

  @@unique([userId, loanId])
  @@index([loanId])
}

model CreditReportingStatus {
  id              String   @id @default(cuid())
  loanId          String   @unique
  isReporting     Boolean  @default(false)
  bureaus         String[] // experian, transunion, equifax
  firstReportDate DateTime?
  lastReportDate  DateTime?
  reportingErrors Json?    // Track any reporting issues
  status          String   @default("pending") // pending, active, completed, error
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  loan Loan @relation(fields: [loanId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/credit-reporting/consent.ts` - Consent management
- `src/lib/credit-reporting/compliance.ts` - FCRA compliance checks
- `src/app/api/credit-reporting/consent/route.ts` - Record consent

### 1B. Consent Flow

**Goal:** Borrowers opt-in to credit reporting at loan origination.

**Files:**
- `src/components/loans/credit-consent-modal.tsx` - Consent form
- `src/components/loans/credit-consent-checkbox.tsx` - Inline consent
- Update loan application flow to include consent step
- `src/lib/credit-reporting/consent-versions.ts` - Version tracking

---

## Phase 2: Metro 2 Format Integration

### 2A. Metro 2 Data Formatting

**Goal:** Format loan data in Metro 2 standard (industry credit reporting format).

**Schema Addition:**

```prisma
model Metro2Record {
  id              String   @id @default(cuid())
  loanId          String
  recordType      String   // header, base, trailer
  reportingPeriod DateTime
  accountStatus   String   // 11=current, 71=30days, 78=60days, etc.
  paymentHistory  String   // 24-month payment pattern
  currentBalance  Float
  amountPastDue   Float    @default(0)
  dateOpened      DateTime
  scheduledPayment Float
  actualPayment   Float?
  rawData         String   // The formatted Metro 2 record
  submitted       Boolean  @default(false)
  submittedAt     DateTime?
  accepted        Boolean?
  rejectionReason String?
  createdAt       DateTime @default(now())

  loan Loan @relation(fields: [loanId], references: [id], onDelete: Cascade)

  @@index([loanId, reportingPeriod])
  @@index([submitted, reportingPeriod])
}
```

**Files:**
- `src/lib/credit-reporting/metro2/index.ts` - Main formatter
- `src/lib/credit-reporting/metro2/header.ts` - Header segment
- `src/lib/credit-reporting/metro2/base.ts` - Base segment (account info)
- `src/lib/credit-reporting/metro2/trailer.ts` - Trailer segment
- `src/lib/credit-reporting/metro2/constants.ts` - Status codes, field specs
- `src/lib/credit-reporting/metro2/validation.ts` - Record validation

### 2B. Payment History Tracking

**Goal:** Track 24-month payment pattern for credit history.

**Files:**
- `src/lib/credit-reporting/payment-history.ts` - Build payment pattern
- Update repayment processing to track on-time/late status
- `src/lib/credit-reporting/status-codes.ts` - Map loan status to Metro 2 codes

---

## Phase 3: Bureau Integration

### 3A. Bureau API Connections

**Goal:** Connect to credit bureau data furnisher APIs.

**Schema Addition:**

```prisma
model BureauConnection {
  id              String   @id @default(cuid())
  bureau          String   @unique // experian, transunion, equifax
  furnisherId     String   // Deluge's furnisher ID with this bureau
  apiEndpoint     String
  apiKeyEncrypted String   // Encrypted API credentials
  status          String   @default("pending") // pending, active, suspended
  lastSubmission  DateTime?
  lastSuccess     DateTime?
  lastError       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model BureauSubmission {
  id              String   @id @default(cuid())
  bureau          String
  reportingPeriod DateTime
  recordCount     Int
  fileReference   String   // Submission file ID
  status          String   @default("pending") // pending, submitted, accepted, rejected
  submittedAt     DateTime?
  responseAt      DateTime?
  acceptedCount   Int?
  rejectedCount   Int?
  errorDetails    Json?
  createdAt       DateTime @default(now())

  @@index([bureau, reportingPeriod])
  @@index([status])
}
```

**Files:**
- `src/lib/credit-reporting/bureaus/index.ts` - Bureau abstraction
- `src/lib/credit-reporting/bureaus/experian.ts` - Experian API
- `src/lib/credit-reporting/bureaus/transunion.ts` - TransUnion API
- `src/lib/credit-reporting/bureaus/equifax.ts` - Equifax API
- `src/lib/credit-reporting/submission.ts` - Submit records to bureaus

### 3B. Monthly Reporting Job

**Goal:** Automated monthly submission to bureaus.

**Files:**
- `src/lib/credit-reporting/monthly-report.ts` - Generate monthly report
- `src/lib/credit-reporting/scheduler.ts` - Cron job setup
- `src/app/api/admin/credit-reporting/submit/route.ts` - Manual trigger

---

## Phase 4: Dispute Resolution

### 4A. Dispute Handling System

**Goal:** FCRA requires 30-day dispute resolution.

**Schema Addition:**

```prisma
model CreditDispute {
  id              String   @id @default(cuid())
  loanId          String
  userId          String
  disputeType     String   // balance, payment_history, account_status, identity
  description     String
  evidence        Json?    // Uploaded documents
  status          String   @default("open") // open, investigating, resolved, escalated
  resolution      String?
  resolvedAt      DateTime?
  resolvedBy      String?
  bureauNotified  Boolean  @default(false)
  bureauNotifiedAt DateTime?
  dueDate         DateTime // 30 days from creation
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  loan Loan @relation(fields: [loanId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  notes CreditDisputeNote[]

  @@index([status, dueDate])
  @@index([loanId])
  @@index([userId])
}

model CreditDisputeNote {
  id        String   @id @default(cuid())
  disputeId String
  authorId  String
  content   String
  isInternal Boolean @default(true)
  createdAt DateTime @default(now())

  dispute CreditDispute @relation(fields: [disputeId], references: [id], onDelete: Cascade)

  @@index([disputeId])
}
```

**Files:**
- `src/lib/credit-reporting/disputes.ts` - Dispute management
- `src/app/api/credit-disputes/route.ts` - Submit dispute
- `src/app/api/credit-disputes/[id]/route.ts` - Dispute detail
- `src/app/api/admin/credit-disputes/route.ts` - Admin list
- `src/components/credit/dispute-form.tsx`
- `src/components/credit/dispute-status.tsx`

### 4B. Dispute Admin Dashboard

**Goal:** Admin interface for managing disputes.

**Files:**
- `src/app/admin/credit-disputes/page.tsx` - Dispute list
- `src/app/admin/credit-disputes/[id]/page.tsx` - Dispute detail
- `src/components/admin/dispute-table.tsx`
- `src/components/admin/dispute-resolution-form.tsx`
- `src/components/admin/dispute-timeline.tsx`

---

## Phase 5: Borrower Credit Dashboard

### 5A. Credit Progress Tracking

**Goal:** Show borrowers their credit-building progress.

**Files:**
- `src/app/(app)/credit/page.tsx` - Credit dashboard
- `src/components/credit/reporting-status.tsx` - Show what's being reported
- `src/components/credit/payment-history-chart.tsx` - Visual payment history
- `src/components/credit/credit-tips.tsx` - Educational content

### 5B. Credit Score Estimation

**Goal:** Estimate impact of on-time payments.

**Files:**
- `src/lib/credit-reporting/score-estimation.ts` - Estimate impact
- `src/components/credit/score-impact-card.tsx`
- `src/components/credit/progress-milestones.tsx`

---

## Phase 6: Reporting & Analytics

### 6A. Admin Reporting Dashboard

**Goal:** Monitor credit reporting health.

**Files:**
- `src/app/admin/credit-reporting/page.tsx` - Reporting dashboard
- `src/components/admin/credit/submission-history.tsx`
- `src/components/admin/credit/error-log.tsx`
- `src/components/admin/credit/bureau-status.tsx`
- `src/app/api/admin/credit-reporting/stats/route.ts`

### 6B. Impact Metrics

**Goal:** Track platform-wide credit building impact.

**Metrics:**
- Total accounts reported
- Average payment history length
- Estimated credit score improvements
- Dispute rates and resolution times

**Files:**
- `src/lib/credit-reporting/analytics.ts`
- `src/components/admin/credit/impact-metrics.tsx`
- Update transparency page with credit impact

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Compliance Foundation | Medium | Critical |
| 2 | Metro 2 Format | Large | Critical |
| 3 | Bureau Integration | Large | Critical |
| 4 | Dispute Resolution | Large | Critical |
| 5 | Borrower Dashboard | Medium | High |
| 6 | Reporting & Analytics | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add CreditReportingConsent, CreditReportingStatus, Metro2Record, BureauConnection, BureauSubmission, CreditDispute, CreditDisputeNote

### New Libraries
- `src/lib/credit-reporting/consent.ts`
- `src/lib/credit-reporting/compliance.ts`
- `src/lib/credit-reporting/metro2/*.ts`
- `src/lib/credit-reporting/bureaus/*.ts`
- `src/lib/credit-reporting/submission.ts`
- `src/lib/credit-reporting/monthly-report.ts`
- `src/lib/credit-reporting/disputes.ts`
- `src/lib/credit-reporting/score-estimation.ts`
- `src/lib/credit-reporting/analytics.ts`

### API Routes
- `src/app/api/credit-reporting/consent/route.ts`
- `src/app/api/credit-disputes/route.ts`
- `src/app/api/credit-disputes/[id]/route.ts`
- `src/app/api/admin/credit-reporting/submit/route.ts`
- `src/app/api/admin/credit-reporting/stats/route.ts`
- `src/app/api/admin/credit-disputes/route.ts`

### Pages
- `src/app/(app)/credit/page.tsx`
- `src/app/admin/credit-reporting/page.tsx`
- `src/app/admin/credit-disputes/page.tsx`
- `src/app/admin/credit-disputes/[id]/page.tsx`

---

## Legal & Compliance Notes

**FCRA Requirements:**
- Accuracy: Must report accurately; errors create legal liability
- Dispute resolution: Must investigate and resolve within 30 days
- Data format: Metro 2 format (industry standard)
- Consent: Borrower must consent at loan origination
- Opt-out: Borrowers can withdraw consent (stops future reporting)

**Estimated Costs (from business model):**
- Legal review: $15-25K
- Bureau setup fees: $10-20K
- Engineering: $50-75K
- Ongoing compliance: $5-10K/year

**Timeline:** Year 3-4 implementation per business model roadmap.

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Legal review of consent flow
4. Test Metro 2 formatting with bureau validation tools
5. Verify dispute workflow meets 30-day requirement
