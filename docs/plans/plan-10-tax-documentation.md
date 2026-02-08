# Plan 10: Tax & Giving Documentation

## Overview

Provide users with comprehensive giving records for tax purposes, donation receipts, and year-end summaries. Makes Deluge contributions tax-friendly and positions the platform as a legitimate charitable giving channel.

---

## Phase 1: Contribution Records & Receipts

### 1A. Individual Contribution Receipts

**Goal:** Generate downloadable receipts for each contribution.

**Schema Addition:**

```prisma
model ContributionReceipt {
  id              String   @id @default(cuid())
  userId          String
  contributionId  String?  // For cash contributions
  allocationId    String?  // For project funding
  type            String   // cash, ad_funded, referral, matching
  amount          Float
  date            DateTime
  projectName     String?
  communityName   String?
  receiptNumber   String   @unique
  downloadedAt    DateTime?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([receiptNumber])
}
```

**Files:**
- `src/lib/receipts.ts` - Receipt generation and numbering
- `src/app/api/receipts/[id]/route.ts` - Get individual receipt
- `src/app/api/receipts/route.ts` - List user's receipts
- `src/components/receipts/receipt-card.tsx` - Receipt display component

### 1B. Receipt PDF Generation

**Goal:** Generate professional PDF receipts for download.

**Files:**
- `src/lib/pdf/receipt-template.ts` - PDF template using @react-pdf/renderer
- `src/app/api/receipts/[id]/pdf/route.ts` - Generate PDF download
- `src/components/receipts/download-receipt-button.tsx`

---

## Phase 2: Year-End Giving Summary

### 2A. Annual Giving Report

**Goal:** Comprehensive yearly summary of all giving activity.

**Schema Addition:**

```prisma
model AnnualGivingSummary {
  id                  String   @id @default(cuid())
  userId              String
  year                Int
  totalCashContributed Float   @default(0)
  totalAdFunded       Float   @default(0)
  totalReferralCredits Float  @default(0)
  totalMatchingReceived Float @default(0)
  totalAllocated      Float   @default(0)
  projectsFunded      Int     @default(0)
  loansFunded         Int     @default(0)
  loansRepaid         Float   @default(0)
  communitiesSupported Int    @default(0)
  generatedAt         DateTime?
  pdfUrl              String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, year])
}
```

**Files:**
- `src/lib/annual-summary.ts` - Calculate annual totals
- `src/lib/pdf/annual-summary-template.ts` - PDF template
- `src/app/api/giving-summary/[year]/route.ts` - Get/generate summary
- `src/app/api/giving-summary/[year]/pdf/route.ts` - Download PDF

### 2B. Year-End Summary Page

**Goal:** Dedicated page for viewing and downloading annual summaries.

**Files:**
- `src/app/(app)/account/giving-history/page.tsx` - Giving history page
- `src/components/giving/annual-summary-card.tsx` - Year summary display
- `src/components/giving/giving-timeline.tsx` - Visual timeline of giving

---

## Phase 3: Tax Categorization

### 3A. Project Tax Status

**Goal:** Track which projects/orgs qualify for tax-deductible donations.

**Schema Update:**

Add to `Project`:
```prisma
taxDeductible     Boolean  @default(false)
ein               String?  // Employer Identification Number
orgName           String?  // Legal organization name
orgType           String?  // 501c3, 501c4, government, etc.
```

**Files:**
- `src/lib/tax-status.ts` - Tax deductibility helpers
- Admin project form update to capture tax info

### 3B. Deduction Summary

**Goal:** Separate deductible vs non-deductible contributions in reports.

**Update AnnualGivingSummary:**
```prisma
deductibleAmount    Float   @default(0)
nonDeductibleAmount Float   @default(0)
```

**Files:**
- Update `src/lib/annual-summary.ts` - Calculate by tax status
- `src/components/giving/deduction-breakdown.tsx` - Show breakdown

---

## Phase 4: Automated Tax Documents

### 4A. Form Generation Preparation

**Goal:** Prepare infrastructure for automated tax form generation.

**Files:**
- `src/lib/tax-forms/index.ts` - Tax form generation utilities
- `src/lib/tax-forms/form-data.ts` - Extract required data
- Document requirements for potential 1099 scenarios

### 4B. Email Notifications

**Goal:** Notify users when tax documents are ready.

**Files:**
- Email template for year-end summary availability
- Email template for updated receipts
- Integration with notification preferences

---

## Phase 5: Family Tax Reports

### 5A. Combined Family Summary

**Goal:** Generate combined reports for family accounts.

**Schema Addition:**

```prisma
model FamilyAnnualSummary {
  id                  String   @id @default(cuid())
  familyId            String
  year                Int
  totalFamilyGiving   Float    @default(0)
  memberBreakdown     Json     // Per-member totals
  projectsFunded      Int      @default(0)
  generatedAt         DateTime?
  pdfUrl              String?
  createdAt           DateTime @default(now())

  family Family @relation(fields: [familyId], references: [id], onDelete: Cascade)

  @@unique([familyId, year])
}
```

**Files:**
- `src/lib/family-tax-summary.ts` - Aggregate family giving
- `src/app/api/family/giving-summary/[year]/route.ts`
- `src/components/family/family-giving-summary.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Contribution Receipts | Medium | High |
| 2 | Year-End Summary | Medium | High |
| 3 | Tax Categorization | Small | Medium |
| 4 | Automated Documents | Medium | Low |
| 5 | Family Tax Reports | Small | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add ContributionReceipt, AnnualGivingSummary, FamilyAnnualSummary, update Project

### New Libraries
- `src/lib/receipts.ts`
- `src/lib/annual-summary.ts`
- `src/lib/tax-status.ts`
- `src/lib/family-tax-summary.ts`
- `src/lib/pdf/receipt-template.ts`
- `src/lib/pdf/annual-summary-template.ts`

### API Routes
- `src/app/api/receipts/route.ts`
- `src/app/api/receipts/[id]/route.ts`
- `src/app/api/receipts/[id]/pdf/route.ts`
- `src/app/api/giving-summary/[year]/route.ts`
- `src/app/api/giving-summary/[year]/pdf/route.ts`
- `src/app/api/family/giving-summary/[year]/route.ts`

### UI Components
- `src/components/receipts/receipt-card.tsx`
- `src/components/receipts/download-receipt-button.tsx`
- `src/components/giving/annual-summary-card.tsx`
- `src/components/giving/giving-timeline.tsx`
- `src/components/giving/deduction-breakdown.tsx`
- `src/components/family/family-giving-summary.tsx`

### Pages
- `src/app/(app)/account/giving-history/page.tsx`

---

## Dependencies

- `@react-pdf/renderer` - PDF generation
- Existing: Prisma, NextAuth

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Generate test receipts and verify PDF output
4. Verify year-end summary calculations match transaction history
