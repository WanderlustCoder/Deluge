# Plan 7: Custodial Float & Financial Transparency

**Status:** Approved
**Priority:** Medium
**Epic:** DLG-TRANS-001 through DLG-TRANS-004
**Reference:** `docs/business-model.md`, `docs/values.md`

---

## Overview

Create radical transparency about how Deluge makes money and how user funds are managed. Full visibility into platform economics is a core commitment.

---

## Current State

- No visibility into platform economics
- No float income tracking
- No transparency dashboard
- Users don't understand "watershed works twice"

---

## Business Model Context

From `docs/business-model.md`:
- Custodial float = interest earned on aggregate watershed balances
- At $11.25M pool (Year 5) @ 4.5% = $506K/year
- User principal always protected, always available

Key quote: *"Your watershed balance funds projects when you deploy it, and keeps the platform free while it sits. Every dollar works twice."*

---

## Schema Changes

```prisma
model FloatSnapshot {
  id              String   @id @default(cuid())

  date            DateTime @unique
  totalWatersheds Float
  totalReserve    Float

  interestRate    Float
  dailyInterest   Float

  createdAt       DateTime @default(now())

  @@index([date])
}

model RevenueRecord {
  id          String   @id @default(cuid())

  date        DateTime
  source      String   // ads, directory, float, corporate, loans, cascade_sponsor, notification_sponsor
  amount      Float

  adViewCount   Int?
  businessCount Int?
  loanVolume    Float?

  createdAt   DateTime @default(now())

  @@index([date, source])
}

model CostRecord {
  id          String   @id @default(cuid())

  date        DateTime
  category    String   // infrastructure, payment_processing, legal, marketing, staffing, other
  description String
  amount      Float

  createdAt   DateTime @default(now())

  @@index([date, category])
}

model TransparencyReport {
  id          String   @id @default(cuid())

  period      String   // "2026-Q1", "2026"
  periodType  String   // quarterly, annual

  totalRevenue      Float
  totalCosts        Float
  netMargin         Float

  revenueBreakdown  String  // JSON

  totalFunded       Float
  totalLoansIssued  Float
  totalUsersActive  Int

  pdfUrl            String?

  publishedAt       DateTime?
  createdAt         DateTime @default(now())

  @@unique([period, periodType])
}

// Add to Watershed
model Watershed {
  // ... existing fields ...
  floatContributed Float @default(0)
}
```

---

## New Library Files

### `src/lib/float-income.ts`
- `captureFloatSnapshot()` — Daily snapshot
- `calculateDailyInterest(date)`
- `getFloatMetrics()`
- `updateUserFloatContribution(userId)`

### `src/lib/revenue-tracking.ts`
- `recordRevenue(source, amount, metadata)`
- `getRevenueBreakdown(startDate, endDate)`
- `getRevenueTrends(period)`

### `src/lib/transparency-reports.ts`
- `generateTransparencyReport(period, periodType)`
- `generateReportPdf(reportId)`
- `publishReport(reportId)`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/transparency` | GET | Public transparency metrics |
| `/api/transparency/float` | GET | Float income details |
| `/api/transparency/revenue` | GET | Revenue breakdown (public) |
| `/api/transparency/reports` | GET | Published reports |
| `/api/transparency/reports/[id]` | GET | Specific report |
| `/api/admin/financials/revenue` | GET | Detailed revenue |
| `/api/admin/financials/costs` | GET/POST | Cost tracking |
| `/api/admin/financials/reports` | GET/POST | Manage reports |
| `/api/admin/financials/reports/[id]/publish` | POST | Publish report |

---

## UI Components

- `src/components/transparency/float-explainer.tsx`
- `src/components/transparency/revenue-breakdown.tsx`
- `src/components/transparency/transparency-hero.tsx`
- `src/components/transparency/report-card.tsx`
- `src/components/admin/revenue-tracker.tsx`
- `src/components/admin/cost-tracker.tsx`
- `src/components/admin/report-generator.tsx`

---

## Float Explainer Content

**How Your Watershed Works Twice:**

1. **First use:** When you deploy funds to projects or loans, your money creates direct impact.

2. **Second use:** While your money sits in your watershed, Deluge holds it in safe, FDIC-insured accounts that earn interest.

3. **The interest belongs to Deluge** — this is standard practice (PayPal, Venmo, Stripe do the same).

4. **Your money is always safe** — 100% available to deploy or withdraw at any time.

5. **The difference:** We tell you about it. Most platforms bury this in fine print.

---

## Cron Jobs

```typescript
// Daily at midnight UTC
async function dailyFloatSnapshot() {
  await captureFloatSnapshot();
  await calculateDailyInterest(new Date());
}

// Monthly on 1st
async function monthlyRevenueAggregation() {
  await aggregateMonthlyRevenue(previousMonth);
}

// Quarterly
async function quarterlyReportGeneration() {
  const report = await generateTransparencyReport(previousQuarter, 'quarterly');
}
```

---

## Implementation Order

1. Schema migration
2. `float-income.ts` — Snapshot and calculation
3. Float explainer component
4. `revenue-tracking.ts` — Revenue by source
5. Revenue recording integration
6. Admin revenue dashboard
7. Cost tracking
8. `transparency-reports.ts`
9. Public transparency page
10. Dashboard float card
11. Cron jobs for snapshots
12. PDF report generation
13. Report publishing flow

---

## Success Criteria

- [ ] Daily float snapshots captured automatically
- [ ] Revenue tracked by source across platform
- [ ] Public transparency page shows revenue breakdown
- [ ] Float explainer educates users
- [ ] Admin can track costs and margins
- [ ] Quarterly reports can be generated and published
- [ ] Reports available as PDF download
- [ ] Dashboard shows "watershed works twice" messaging

---

## Estimated Effort

2 implementation sessions
