# Plan 33: Nonprofit Partner Portal

## Overview

Dedicated dashboard for nonprofit organizations to manage their presence on Deluge, track donations, submit projects, and access donor analytics. Streamlines the relationship between Deluge and nonprofit partners.

**Core Principle:** Empower nonprofits with tools to maximize their impact on the platform.

---

## Phase 1: Organization Foundation

### 1A. Organization Schema

**Goal:** Structure for nonprofit organizations.

**Schema Addition:**

```prisma
model NonprofitOrganization {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  legalName       String?
  ein             String?  // Tax ID
  type            String   // 501c3, 501c4, fiscal_sponsor, other
  mission         String
  description     String?
  website         String?
  email           String
  phone           String?
  logoUrl         String?
  coverImageUrl   String?
  address         Json?    // { street, city, state, zip, country }
  focusAreas      String[]
  geographicScope String   @default("local") // local, regional, national, international
  foundedYear     Int?
  annualBudget    String?  // Range: <100k, 100k-500k, 500k-1m, 1m-5m, 5m+
  employeeCount   String?  // Range
  verificationStatus String @default("pending") // pending, verified, rejected
  verifiedAt      DateTime?
  verifiedBy      String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members  OrganizationMember[]
  projects Project[]
  campaigns PledgeCampaign[]
  documents OrganizationDocument[]
  reports   OrganizationReport[]

  @@index([type, verificationStatus])
  @@index([slug])
}

model OrganizationMember {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String
  role            String   @default("member") // owner, admin, member, viewer
  title           String?  // Job title
  permissions     String[] // Specific permissions
  invitedBy       String?
  invitedAt       DateTime?
  joinedAt        DateTime @default(now())
  status          String   @default("active") // invited, active, inactive

  organization NonprofitOrganization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User                   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
}
```

**Files:**
- `src/lib/organizations/index.ts` - Org management
- `src/app/api/organizations/route.ts`
- `src/app/api/organizations/[slug]/route.ts`

### 1B. Organization Registration

**Goal:** Nonprofits register on the platform.

**Files:**
- `src/app/(app)/organizations/register/page.tsx`
- `src/components/organizations/registration-wizard.tsx`
- `src/components/organizations/basic-info-step.tsx`
- `src/components/organizations/verification-step.tsx`
- `src/components/organizations/document-upload-step.tsx`

### 1C. Organization Profile

**Goal:** Public organization profile.

**Files:**
- `src/app/(app)/organizations/[slug]/page.tsx`
- `src/components/organizations/org-header.tsx`
- `src/components/organizations/org-about.tsx`
- `src/components/organizations/org-projects.tsx`
- `src/components/organizations/org-impact.tsx`

---

## Phase 2: Verification System

### 2A. Document Management

**Goal:** Store verification documents.

**Schema Addition:**

```prisma
model OrganizationDocument {
  id              String   @id @default(cuid())
  organizationId  String
  type            String   // ein_letter, 501c3_determination, bylaws, annual_report, audit
  name            String
  fileUrl         String
  fileSize        Int
  mimeType        String
  status          String   @default("pending") // pending, approved, rejected
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewNotes     String?
  expiresAt       DateTime?
  uploadedBy      String
  uploadedAt      DateTime @default(now())

  organization NonprofitOrganization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId, type])
}
```

**Files:**
- `src/lib/organizations/documents.ts`
- `src/app/api/organizations/[slug]/documents/route.ts`
- `src/components/organizations/document-list.tsx`
- `src/components/organizations/document-upload.tsx`

### 2B. Verification Workflow

**Goal:** Admin verification process.

**Files:**
- `src/lib/organizations/verification.ts`
- `src/app/admin/organizations/page.tsx`
- `src/app/admin/organizations/[id]/verify/page.tsx`
- `src/components/admin/verification-checklist.tsx`
- `src/components/admin/ein-validator.tsx`
- Integration with IRS database (optional)

### 2C. Verification Badges

**Goal:** Display verification status.

**Files:**
- `src/components/organizations/verified-badge.tsx`
- `src/components/organizations/verification-status.tsx`
- Display on projects and organization profile

---

## Phase 3: Organization Dashboard

### 3A. Dashboard Home

**Goal:** Overview for organization admins.

**Files:**
- `src/app/(app)/org/[slug]/page.tsx` - Org dashboard
- `src/components/organizations/dashboard-stats.tsx`
- `src/components/organizations/recent-donations.tsx`
- `src/components/organizations/active-projects.tsx`
- `src/components/organizations/quick-actions.tsx`

### 3B. Donation Management

**Goal:** Track and manage donations.

**Schema Addition:**

```prisma
model OrganizationDonation {
  id              String   @id @default(cuid())
  organizationId  String
  projectId       String?
  donorId         String?
  donorName       String?
  donorEmail      String?
  amount          Float
  isAnonymous     Boolean  @default(false)
  source          String   // platform, direct, external
  status          String   @default("completed")
  acknowledgedAt  DateTime?
  createdAt       DateTime @default(now())

  @@index([organizationId, createdAt])
  @@index([projectId])
}
```

**Files:**
- `src/app/(app)/org/[slug]/donations/page.tsx`
- `src/components/organizations/donation-table.tsx`
- `src/components/organizations/donation-filters.tsx`
- `src/components/organizations/donation-export.tsx`

### 3C. Project Management

**Goal:** Manage organization's projects.

**Files:**
- `src/app/(app)/org/[slug]/projects/page.tsx`
- `src/app/(app)/org/[slug]/projects/new/page.tsx`
- `src/app/(app)/org/[slug]/projects/[id]/page.tsx`
- `src/components/organizations/project-list.tsx`
- `src/components/organizations/project-form.tsx`

---

## Phase 4: Donor Relations

### 4A. Donor Database

**Goal:** Track and manage donor relationships.

**Schema Addition:**

```prisma
model DonorRelationship {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String?  // Null for external donors
  externalId      String?  // External CRM ID
  email           String
  firstName       String?
  lastName        String?
  totalDonated    Float    @default(0)
  donationCount   Int      @default(0)
  firstDonation   DateTime?
  lastDonation    DateTime?
  averageDonation Float?
  segment         String?  // major_donor, recurring, lapsed, new
  notes           String?
  tags            String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, email])
  @@index([organizationId, segment])
}
```

**Files:**
- `src/lib/organizations/donors.ts`
- `src/app/(app)/org/[slug]/donors/page.tsx`
- `src/components/organizations/donor-table.tsx`
- `src/components/organizations/donor-detail.tsx`
- `src/components/organizations/donor-segments.tsx`

### 4B. Acknowledgment System

**Goal:** Thank donors efficiently.

**Files:**
- `src/lib/organizations/acknowledgments.ts`
- `src/app/(app)/org/[slug]/acknowledgments/page.tsx`
- `src/components/organizations/acknowledgment-queue.tsx`
- `src/components/organizations/thank-you-template.tsx`
- Bulk thank you emails

### 4C. Recurring Donors

**Goal:** Manage recurring donor relationships.

**Files:**
- `src/app/(app)/org/[slug]/donors/recurring/page.tsx`
- `src/components/organizations/recurring-donors.tsx`
- `src/components/organizations/retention-metrics.tsx`

---

## Phase 5: Reporting & Analytics

### 5A. Organization Reports

**Goal:** Generate required reports.

**Schema Addition:**

```prisma
model OrganizationReport {
  id              String   @id @default(cuid())
  organizationId  String
  type            String   // annual, quarterly, impact, tax
  year            Int
  quarter         Int?
  data            Json
  fileUrl         String?
  status          String   @default("draft") // draft, published
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization NonprofitOrganization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, type, year, quarter])
}
```

**Files:**
- `src/lib/organizations/reports.ts`
- `src/app/(app)/org/[slug]/reports/page.tsx`
- `src/components/organizations/report-generator.tsx`
- `src/components/organizations/annual-report.tsx`
- PDF generation for reports

### 5B. Analytics Dashboard

**Goal:** Deep dive into performance.

**Files:**
- `src/app/(app)/org/[slug]/analytics/page.tsx`
- `src/components/organizations/donation-trends.tsx`
- `src/components/organizations/donor-acquisition.tsx`
- `src/components/organizations/campaign-performance.tsx`
- `src/components/organizations/geographic-breakdown.tsx`

### 5C. Impact Metrics

**Goal:** Track and report impact.

**Files:**
- `src/app/(app)/org/[slug]/impact/page.tsx`
- `src/components/organizations/impact-dashboard.tsx`
- `src/components/organizations/impact-entry.tsx`
- `src/components/organizations/sdg-mapping.tsx`

---

## Phase 6: Team Management

### 6A. Team Members

**Goal:** Manage organization team.

**Files:**
- `src/app/(app)/org/[slug]/team/page.tsx`
- `src/components/organizations/team-list.tsx`
- `src/components/organizations/invite-member.tsx`
- `src/components/organizations/role-selector.tsx`
- `src/components/organizations/permission-matrix.tsx`

### 6B. Activity Log

**Goal:** Track team activity.

**Schema Addition:**

```prisma
model OrganizationActivity {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String
  action          String   // project_created, donation_acknowledged, report_published
  entityType      String?
  entityId        String?
  metadata        Json?
  createdAt       DateTime @default(now())

  @@index([organizationId, createdAt])
}
```

**Files:**
- `src/lib/organizations/activity.ts`
- `src/app/(app)/org/[slug]/activity/page.tsx`
- `src/components/organizations/activity-feed.tsx`

### 6C. Notifications & Alerts

**Goal:** Keep team informed.

**Files:**
- `src/lib/organizations/notifications.ts`
- `src/components/organizations/notification-settings.tsx`
- Email digests for donations
- Alert thresholds (large donations, milestones)

---

## Phase 7: Integrations

### 7A. CRM Integration

**Goal:** Sync with external CRMs.

**Schema Addition:**

```prisma
model OrganizationIntegration {
  id              String   @id @default(cuid())
  organizationId  String
  provider        String   // salesforce, hubspot, bloomerang, neon
  status          String   @default("active")
  config          Json     // Encrypted credentials
  lastSyncAt      DateTime?
  syncStatus      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, provider])
}
```

**Files:**
- `src/lib/organizations/integrations/index.ts`
- `src/lib/organizations/integrations/salesforce.ts`
- `src/lib/organizations/integrations/bloomerang.ts`
- `src/app/(app)/org/[slug]/integrations/page.tsx`
- `src/components/organizations/integration-card.tsx`

### 7B. Accounting Integration

**Goal:** Sync with accounting software.

**Files:**
- `src/lib/organizations/integrations/quickbooks.ts`
- `src/lib/organizations/integrations/xero.ts`
- `src/components/organizations/accounting-sync.tsx`

### 7C. Data Export

**Goal:** Export data for external use.

**Files:**
- `src/lib/organizations/export.ts`
- `src/app/api/organizations/[slug]/export/route.ts`
- `src/components/organizations/export-wizard.tsx`
- CSV, JSON, and Excel exports

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Organization Foundation | Large | High |
| 2 | Verification System | Medium | High |
| 3 | Organization Dashboard | Large | High |
| 4 | Donor Relations | Large | Medium |
| 5 | Reporting & Analytics | Large | Medium |
| 6 | Team Management | Medium | Medium |
| 7 | Integrations | Large | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add NonprofitOrganization, OrganizationMember, OrganizationDocument, OrganizationDonation, DonorRelationship, OrganizationReport, OrganizationActivity, OrganizationIntegration

### New Libraries
- `src/lib/organizations/index.ts`
- `src/lib/organizations/documents.ts`
- `src/lib/organizations/verification.ts`
- `src/lib/organizations/donors.ts`
- `src/lib/organizations/acknowledgments.ts`
- `src/lib/organizations/reports.ts`
- `src/lib/organizations/activity.ts`
- `src/lib/organizations/notifications.ts`
- `src/lib/organizations/export.ts`
- `src/lib/organizations/integrations/*.ts`

### Pages
- `src/app/(app)/organizations/register/page.tsx`
- `src/app/(app)/organizations/[slug]/page.tsx`
- `src/app/(app)/org/[slug]/page.tsx` - Dashboard
- `src/app/(app)/org/[slug]/donations/page.tsx`
- `src/app/(app)/org/[slug]/projects/page.tsx`
- `src/app/(app)/org/[slug]/donors/page.tsx`
- `src/app/(app)/org/[slug]/reports/page.tsx`
- `src/app/(app)/org/[slug]/analytics/page.tsx`
- `src/app/(app)/org/[slug]/team/page.tsx`
- `src/app/(app)/org/[slug]/integrations/page.tsx`
- `src/app/admin/organizations/page.tsx`

---

## Permission Matrix

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| View dashboard | Yes | Yes | Yes | Yes |
| View donations | Yes | Yes | Yes | Yes |
| Acknowledge donors | Yes | Yes | Yes | No |
| Create projects | Yes | Yes | Yes | No |
| Publish projects | Yes | Yes | No | No |
| View donor details | Yes | Yes | No | No |
| Manage team | Yes | Yes | No | No |
| Manage integrations | Yes | Yes | No | No |
| Edit org settings | Yes | Yes | No | No |
| Transfer ownership | Yes | No | No | No |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test organization registration
4. Verify document upload and review
5. Test dashboard functionality
6. Verify donor management
7. Test report generation

