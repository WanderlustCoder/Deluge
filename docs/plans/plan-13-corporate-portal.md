# Plan 13: Corporate Employee Portal

## Overview

White-label employer dashboards for corporate giving programs. Enables companies to offer Deluge as an employee benefit, track team giving, and generate ESG reports. Targets the "Corporate campaign management" revenue stream from the business model.

---

## Phase 1: Corporate Account Structure

### 1A. Corporate Entity Schema

**Goal:** Model corporate accounts with employee relationships.

**Schema Addition:**

```prisma
model CorporateAccount {
  id                String   @id @default(cuid())
  name              String   // Company name
  slug              String   @unique
  logoUrl           String?
  primaryColor      String?  // Brand color
  secondaryColor    String?
  adminEmail        String
  tier              String   @default("starter") // starter, growth, enterprise
  employeeLimit     Int?
  matchingBudget    Float    @default(0)
  matchingSpent     Float    @default(0)
  matchingRatio     Float    @default(1) // 1:1, 2:1, etc.
  matchingCategories String[] // Empty = all categories
  billingEmail      String?
  contractStart     DateTime?
  contractEnd       DateTime?
  status            String   @default("active") // active, suspended, expired
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  employees       CorporateEmployee[]
  campaigns       CorporateCampaign[]
  reports         CorporateReport[]
  matchingHistory CorporateMatchingRecord[]

  @@index([status])
}

model CorporateEmployee {
  id                String   @id @default(cuid())
  corporateAccountId String
  userId            String   @unique
  employeeId        String?  // Internal employee ID (optional)
  department        String?
  isAdmin           Boolean  @default(false)
  joinedAt          DateTime @default(now())
  status            String   @default("active") // active, inactive

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([corporateAccountId, employeeId])
  @@index([corporateAccountId, status])
}
```

**Files:**
- `src/lib/corporate.ts` - Corporate account management
- `src/app/api/corporate/route.ts` - List/create corporate accounts (admin)
- `src/app/api/corporate/[slug]/route.ts` - Get corporate account

### 1B. Employee Enrollment

**Goal:** Employees join via company invite or SSO.

**Schema Addition:**

```prisma
model CorporateInvite {
  id                String   @id @default(cuid())
  corporateAccountId String
  email             String
  token             String   @unique
  expiresAt         DateTime
  usedAt            DateTime?
  usedBy            String?
  createdAt         DateTime @default(now())

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)

  @@index([corporateAccountId])
  @@index([token])
}
```

**Files:**
- `src/lib/corporate-invites.ts` - Invite logic
- `src/app/api/corporate/[slug]/invite/route.ts` - Send invites
- `src/app/api/corporate/join/[token]/route.ts` - Accept invite
- `src/app/(app)/corporate/join/[token]/page.tsx` - Join page

---

## Phase 2: Corporate Dashboard

### 2A. Admin Dashboard

**Goal:** Corporate admins see company-wide giving activity.

**Files:**
- `src/app/(app)/corporate/page.tsx` - Corporate dashboard home
- `src/app/(app)/corporate/layout.tsx` - Corporate layout with nav
- `src/components/corporate/dashboard-stats.tsx` - Key metrics
- `src/components/corporate/employee-activity-feed.tsx` - Recent activity
- `src/components/corporate/top-projects.tsx` - Most funded projects

**Dashboard Metrics:**
- Total employee contributions
- Matching funds used / remaining
- Active employees this month
- Projects supported
- Communities impacted

### 2B. Employee Management

**Goal:** Manage employee roster and permissions.

**Files:**
- `src/app/(app)/corporate/employees/page.tsx` - Employee list
- `src/app/api/corporate/[slug]/employees/route.ts`
- `src/components/corporate/employee-table.tsx`
- `src/components/corporate/invite-employees-modal.tsx`
- `src/components/corporate/bulk-invite.tsx` - CSV upload

---

## Phase 3: Corporate Matching

### 3A. Matching Configuration

**Goal:** Configure company matching rules.

**Schema Addition:**

```prisma
model CorporateMatchingRecord {
  id                String   @id @default(cuid())
  corporateAccountId String
  userId            String
  originalAmount    Float
  matchedAmount     Float
  projectId         String?
  loanId            String?
  category          String?
  matchDate         DateTime @default(now())

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)

  @@index([corporateAccountId, matchDate])
  @@index([userId])
}
```

**Files:**
- `src/lib/corporate-matching.ts` - Matching logic
- `src/app/api/corporate/[slug]/matching/route.ts` - Configure matching
- `src/components/corporate/matching-config.tsx` - Config UI
- `src/components/corporate/matching-budget.tsx` - Budget tracker

### 3B. Matching Integration

**Goal:** Apply corporate matching when employees fund projects.

**Integration Points:**
- Update `/api/fund/route.ts` - Check for corporate matching
- Update `/api/loans/[id]/fund/route.ts` - Apply matching to loans

**Files:**
- Update fund route to check corporate employee status
- `src/lib/corporate-matching.ts` - Calculate and apply match
- `src/components/fund/matching-indicator.tsx` - Show matching to user

---

## Phase 4: Corporate Campaigns

### 4A. Internal Campaigns

**Goal:** Companies run themed giving campaigns for employees.

**Schema Addition:**

```prisma
model CorporateCampaign {
  id                String   @id @default(cuid())
  corporateAccountId String
  name              String
  description       String?
  startDate         DateTime
  endDate           DateTime
  targetAmount      Float?
  currentAmount     Float    @default(0)
  matchingBonus     Float?   // Extra matching during campaign
  featuredProjects  String[] // Project IDs to highlight
  categories        String[] // Focus categories
  status            String   @default("draft") // draft, active, completed
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)

  @@index([corporateAccountId, status])
  @@index([status, startDate])
}
```

**Files:**
- `src/app/(app)/corporate/campaigns/page.tsx` - Campaign list
- `src/app/(app)/corporate/campaigns/[id]/page.tsx` - Campaign detail
- `src/app/(app)/corporate/campaigns/new/page.tsx` - Create campaign
- `src/app/api/corporate/[slug]/campaigns/route.ts`
- `src/components/corporate/campaign-card.tsx`
- `src/components/corporate/campaign-progress.tsx`

### 4B. Campaign Participation

**Goal:** Employees see and participate in active campaigns.

**Files:**
- `src/components/corporate/active-campaigns-banner.tsx`
- `src/components/corporate/campaign-leaderboard.tsx` - Department rankings
- Employee dashboard integration

---

## Phase 5: ESG Reporting

### 5A. Impact Reports

**Goal:** Generate ESG-ready impact reports.

**Schema Addition:**

```prisma
model CorporateReport {
  id                String   @id @default(cuid())
  corporateAccountId String
  type              String   // monthly, quarterly, annual, custom
  startDate         DateTime
  endDate           DateTime
  data              Json     // Aggregated metrics
  pdfUrl            String?
  generatedAt       DateTime @default(now())

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)

  @@index([corporateAccountId, type])
}
```

**Report Contents:**
- Total employee giving
- Matching funds deployed
- Projects/communities supported
- Category breakdown
- Department participation rates
- UN SDG alignment
- Carbon offset equivalent (if applicable)

**Files:**
- `src/lib/corporate-reports.ts` - Report generation
- `src/lib/pdf/corporate-report-template.ts`
- `src/app/api/corporate/[slug]/reports/route.ts`
- `src/app/(app)/corporate/reports/page.tsx`
- `src/components/corporate/report-card.tsx`

### 5B. SDG Mapping

**Goal:** Map project categories to UN Sustainable Development Goals.

**Files:**
- `src/lib/sdg-mapping.ts` - Category to SDG mapping
- `src/components/corporate/sdg-breakdown.tsx`
- `src/components/corporate/sdg-badge.tsx`

---

## Phase 6: White-Label Features

### 6A. Branded Experience

**Goal:** Corporate-branded giving portal.

**Features:**
- Custom logo and colors
- Branded email templates
- Custom landing page (`/give/[company-slug]`)
- Embedded widget for intranet

**Files:**
- `src/app/(corporate)/give/[slug]/page.tsx` - Branded landing
- `src/lib/corporate-branding.ts` - Brand asset helpers
- `src/components/corporate/branded-header.tsx`

### 6B. SSO Integration

**Goal:** SAML/OIDC SSO for enterprise customers.

**Files:**
- `src/lib/corporate-sso.ts` - SSO configuration
- Update auth to support corporate SSO
- `src/app/api/auth/corporate/[slug]/route.ts`

**Note:** SSO is enterprise tier only. Mark as future phase.

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Corporate Account Structure | Large | High |
| 2 | Corporate Dashboard | Large | High |
| 3 | Corporate Matching | Medium | High |
| 4 | Corporate Campaigns | Medium | Medium |
| 5 | ESG Reporting | Medium | High |
| 6 | White-Label Features | Large | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add CorporateAccount, CorporateEmployee, CorporateInvite, CorporateMatchingRecord, CorporateCampaign, CorporateReport

### New Libraries
- `src/lib/corporate.ts`
- `src/lib/corporate-invites.ts`
- `src/lib/corporate-matching.ts`
- `src/lib/corporate-reports.ts`
- `src/lib/sdg-mapping.ts`
- `src/lib/corporate-branding.ts`
- `src/lib/pdf/corporate-report-template.ts`

### API Routes
- `src/app/api/corporate/route.ts`
- `src/app/api/corporate/[slug]/route.ts`
- `src/app/api/corporate/[slug]/employees/route.ts`
- `src/app/api/corporate/[slug]/invite/route.ts`
- `src/app/api/corporate/[slug]/matching/route.ts`
- `src/app/api/corporate/[slug]/campaigns/route.ts`
- `src/app/api/corporate/[slug]/reports/route.ts`
- `src/app/api/corporate/join/[token]/route.ts`

### UI Components
- `src/components/corporate/dashboard-stats.tsx`
- `src/components/corporate/employee-table.tsx`
- `src/components/corporate/invite-employees-modal.tsx`
- `src/components/corporate/matching-config.tsx`
- `src/components/corporate/matching-budget.tsx`
- `src/components/corporate/campaign-card.tsx`
- `src/components/corporate/campaign-progress.tsx`
- `src/components/corporate/report-card.tsx`
- `src/components/corporate/sdg-breakdown.tsx`

### Pages
- `src/app/(app)/corporate/page.tsx`
- `src/app/(app)/corporate/layout.tsx`
- `src/app/(app)/corporate/employees/page.tsx`
- `src/app/(app)/corporate/campaigns/page.tsx`
- `src/app/(app)/corporate/campaigns/[id]/page.tsx`
- `src/app/(app)/corporate/campaigns/new/page.tsx`
- `src/app/(app)/corporate/reports/page.tsx`
- `src/app/(app)/corporate/join/[token]/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test corporate account creation and employee enrollment
4. Verify matching calculations apply correctly
5. Test report generation with sample data
