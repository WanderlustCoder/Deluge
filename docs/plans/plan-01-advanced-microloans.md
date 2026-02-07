# Plan 1: Advanced Microloan System (Tiers 2-5)

**Status:** Complete
**Priority:** High
**Epic:** DLG-LOAN-001 through DLG-LOAN-008
**Reference:** `docs/loan-system.md`

---

## Overview

Complete the full 5-tier microloan system. Currently only Tier 1 ($100 max, 6-month term) is implemented. This plan adds credit progression, stretch goals, refinancing, and default/recovery handling.

---

## Current State

- Tier 1 loans ($100 max, 6-month term) work end-to-end
- Basic loan apply/browse/fund/repay flow exists
- Sponsorship system for over-limit loans exists
- No credit progression, no higher tiers, no refinancing, no stretch goals

---

## Schema Changes

```prisma
// Add to Loan model
model Loan {
  // ... existing fields ...
  tier              Int       @default(1)  // 1-5
  stretchGoals      LoanStretchGoal[]
  refinances        LoanRefinance[]
  recoveryStartedAt DateTime?
  defaultedAt       DateTime?
}

model LoanStretchGoal {
  id          String   @id @default(cuid())
  loanId      String
  priority    Int      // 1, 2, or 3
  amount      Float
  purpose     String
  funded      Boolean  @default(false)
  createdAt   DateTime @default(now())

  loan        Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)

  @@index([loanId])
}

model LoanRefinance {
  id              String   @id @default(cuid())
  loanId          String
  previousPayment Float
  newPayment      Float
  previousTerm    Int      // months remaining before
  newTerm         Int      // months remaining after
  fee             Float    // 1% or $10 min
  refinancedAt    DateTime @default(now())

  loan            Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)

  @@index([loanId])
}

model LoanDeadlineExtension {
  id            String   @id @default(cuid())
  loanId        String
  sponsorId     String
  extensionDays Int
  extendedAt    DateTime @default(now())

  loan          Loan     @relation(fields: [loanId], references: [id], onDelete: Cascade)
  sponsor       User     @relation(fields: [sponsorId], references: [id])

  @@index([loanId])
}

// Add to User model for credit tracking
model User {
  // ... existing fields ...
  loanTier          Int       @default(1)
  loanCreditLimit   Float     @default(100)
  loansRepaidOnTime Int       @default(0)
  latePaymentCount  Int       @default(0)
}
```

---

## New Constants

Add to `src/lib/constants.ts`:

```typescript
export const LOAN_TIERS = {
  1: { maxAmount: 100, maxTermMonths: 6, fundingDeadlineDays: 7 },
  2: { maxAmount: 500, maxTermMonths: 12, fundingDeadlineDays: 14 },
  3: { maxAmount: 1000, maxTermMonths: 18, fundingDeadlineDays: 21 },
  4: { maxAmount: 2000, maxTermMonths: 24, fundingDeadlineDays: 30 },
  5: { maxAmount: 5000, maxTermMonths: 24, fundingDeadlineDays: 45 },
} as const;

export const TIER_REQUIREMENTS = {
  1: { loansRepaid: 0, maxLatePayments: Infinity },
  2: { loansRepaid: 1, maxLatePayments: 0 },
  3: { loansRepaid: 2, maxLatePayments: 1 },
  4: { loansRepaid: 3, maxLatePayments: 1 },
  5: { loansRepaid: 5, maxLatePayments: 2 },
} as const;

export const REFINANCING = {
  minLoanBalance: 1000,
  feePercent: 0.01,
  minFee: 10,
} as const;

export const DEFAULT_TIMELINE = {
  lateDays: 30,        // 1-30 days = "late"
  atRiskDays: 90,      // 31-90 days = "at risk"
  defaultDays: 90,     // 90+ days = "defaulted"
  recoveryPayments: 3, // 3 consecutive on-time payments to recover
} as const;

export const STRETCH_GOALS = {
  maxCount: 3,
} as const;
```

---

## New Library Files

### `src/lib/loan-tiers.ts`

```typescript
// calculateUserTier(userId) — Determine tier based on repayment history
// canApplyForAmount(userId, amount) — Check if user can request this amount
// getNextTierRequirements(userId) — What user needs for next tier
// updateUserTierAfterRepayment(userId) — Called after loan completion
```

### `src/lib/refinancing.ts`

```typescript
// canRefinance(loanId) — Check if loan is eligible ($1K+ balance)
// calculateRefinanceFee(remainingBalance) — 1% or $10 min
// processRefinance(loanId, newMonthlyPayment) — Execute refinance
```

### `src/lib/default-recovery.ts`

```typescript
// checkLoanStatus(loanId) — Determine if late/at-risk/defaulted
// processDefaultTransition(loanId) — Handle status change
// startRecovery(loanId) — Begin recovery tracking
// checkRecoveryProgress(loanId) — 3 consecutive payments check
// completeRecovery(loanId) — Exit default, halve credit
```

### `src/lib/stretch-goals.ts`

```typescript
// addStretchGoal(loanId, priority, amount, purpose)
// calculateFundingDistribution(loanId, totalRaised) — Primary first, then stretches
// resolveStretchGoals(loanId) — At deadline, determine what's funded
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/loans/tiers` | GET | Get user's current tier and progression |
| `/api/loans/[id]/stretch-goals` | POST | Add stretch goal to loan application |
| `/api/loans/[id]/stretch-goals` | GET | Get loan's stretch goals |
| `/api/loans/[id]/refinance` | POST | Request refinance |
| `/api/loans/[id]/refinance` | GET | Get refinance options/eligibility |
| `/api/loans/[id]/extend-deadline` | POST | Sponsor extends deadline |
| `/api/admin/loans/at-risk` | GET | List at-risk and defaulted loans |
| `/api/admin/loans/[id]/status` | PATCH | Admin override loan status |

---

## UI Changes

### Loan Application (`/loans/apply`)
- Show user's current tier and credit limit
- Add stretch goals section (up to 3)
- Calculate funding deadline based on tier
- Show requirements for next tier

### Loan Detail (`/loans/[id]`)
- Display stretch goals with funding status
- Show deadline with extension count
- Refinance button for eligible loans (borrower view)
- Extend deadline button (sponsor view)
- Status badge: On Time / Late / At Risk / Defaulted / Recovering

### New Pages
- `/loans/[id]/refinance` — Refinance flow for borrower
- `/admin/loans/at-risk` — Admin dashboard for troubled loans

### Account Page Enhancement
- Credit tier display with progress to next tier
- Loan history summary

---

## Implementation Order

1. Schema migration + constants
2. `loan-tiers.ts` — Credit progression logic
3. Update loan application to support tiers + stretch goals
4. `stretch-goals.ts` — Stretch goal funding logic
5. Update loan funding to handle stretch goals
6. `refinancing.ts` — Refinance system
7. Refinance UI + API
8. `default-recovery.ts` — Default handling
9. Admin at-risk dashboard
10. Deadline extensions for sponsors
11. Integration testing

---

## Success Criteria

- [x] Users can unlock Tier 2-5 through on-time repayment
- [x] Stretch goals fund in priority order after primary
- [x] $1K+ loans can refinance to avoid default
- [x] Loans transition: late → at risk → defaulted → recovering → active
- [x] Sponsors can extend funding deadlines (up to 2 extensions)
- [x] Credit is halved after default recovery
- [x] Admin can view and manage at-risk loans

---

## Estimated Effort

2-3 implementation sessions
