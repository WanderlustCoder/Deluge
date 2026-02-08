# Plan 22: Institutional Partnerships

## Overview

White-label platform for cities, universities, foundations, and other institutions. Enables large organizations to run their own branded giving platforms powered by Deluge infrastructure. Targets the $10-50K/year institutional partnership revenue stream.

---

## Phase 1: Multi-Tenant Foundation

### 1A. Institution Schema

**Goal:** Support isolated institutional tenants.

**Schema Addition:**

```prisma
model Institution {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique // subdomain: boise.deluge.fund
  type            String   // city, university, foundation, nonprofit, corporate
  description     String?
  logoUrl         String?
  faviconUrl      String?
  primaryColor    String   @default("#0D47A1")
  secondaryColor  String   @default("#00897B")
  customDomain    String?  @unique // e.g., give.boise.gov
  adminEmail      String
  tier            String   @default("standard") // standard, premium, enterprise
  features        String[] // Enabled features
  limits          Json     // { "projects": 100, "users": 5000 }
  contractStart   DateTime
  contractEnd     DateTime?
  monthlyFee      Float?
  status          String   @default("active") // pending, active, suspended, expired
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  admins          InstitutionAdmin[]
  communities     Community[]        // Communities under this institution
  projects        Project[]          // Projects under this institution
  customPages     InstitutionPage[]
  reports         InstitutionReport[]
  settings        InstitutionSettings?

  @@index([status])
  @@index([customDomain])
}

model InstitutionAdmin {
  id            String   @id @default(cuid())
  institutionId String
  userId        String
  role          String   @default("admin") // owner, admin, editor, viewer
  permissions   String[]
  invitedBy     String?
  createdAt     DateTime @default(now())

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([institutionId, userId])
  @@index([userId])
}

model InstitutionSettings {
  id                String   @id @default(cuid())
  institutionId     String   @unique
  allowPublicProjects Boolean @default(true)
  requireApproval   Boolean  @default(true)
  enableLoans       Boolean  @default(true)
  enableCommunities Boolean  @default(true)
  customCategories  String[]
  defaultWatershed  Float    @default(0) // Seed amount for new users
  emailFromName     String?
  emailReplyTo      String?
  socialLinks       Json?
  customFooter      String?
  customCss         String?
  analyticsId       String?  // Google Analytics, etc.
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/institutions/index.ts` - Institution management
- `src/lib/institutions/tenant.ts` - Tenant resolution
- `src/middleware/institution.ts` - Resolve tenant from domain/subdomain
- `src/app/api/admin/institutions/route.ts` - Super admin CRUD

### 1B. Tenant Resolution

**Goal:** Route requests to correct institution.

**Files:**
- `src/lib/institutions/resolver.ts` - Resolve from request
- `src/lib/institutions/context.ts` - Institution context
- `src/hooks/use-institution.ts` - Client-side hook
- Update middleware to inject institution context

---

## Phase 2: White-Label Branding

### 2A. Theme Customization

**Goal:** Institution-specific branding.

**Files:**
- `src/lib/institutions/branding.ts` - Generate CSS variables
- `src/components/institutions/themed-layout.tsx`
- `src/components/institutions/branded-logo.tsx`
- `src/app/institution/[slug]/layout.tsx` - Branded layout

### 2B. Custom Pages

**Goal:** Institution-specific content pages.

**Schema Addition:**

```prisma
model InstitutionPage {
  id            String   @id @default(cuid())
  institutionId String
  slug          String
  title         String
  content       Json     // Rich content blocks
  isPublished   Boolean  @default(false)
  order         Int      @default(0)
  showInNav     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)

  @@unique([institutionId, slug])
  @@index([institutionId, isPublished])
}
```

**Files:**
- `src/app/institution/[slug]/[page]/page.tsx` - Custom pages
- `src/app/api/institutions/[id]/pages/route.ts`
- `src/components/institutions/page-editor.tsx`
- `src/components/institutions/content-blocks.tsx`

### 2C. Custom Domain Support

**Goal:** Institutions use their own domains.

**Files:**
- `src/lib/institutions/domains.ts` - Domain management
- `src/app/api/admin/institutions/[id]/domain/route.ts`
- SSL certificate provisioning documentation

---

## Phase 3: Institution Admin Portal

### 3A. Admin Dashboard

**Goal:** Institution admins manage their platform.

**Files:**
- `src/app/institution/[slug]/admin/page.tsx` - Admin home
- `src/app/institution/[slug]/admin/layout.tsx` - Admin layout
- `src/components/institutions/admin/stats-overview.tsx`
- `src/components/institutions/admin/recent-activity.tsx`
- `src/components/institutions/admin/quick-actions.tsx`

### 3B. User Management

**Goal:** Manage institution users.

**Files:**
- `src/app/institution/[slug]/admin/users/page.tsx`
- `src/app/api/institutions/[id]/users/route.ts`
- `src/components/institutions/admin/user-table.tsx`
- `src/components/institutions/admin/invite-users.tsx`
- `src/components/institutions/admin/bulk-import.tsx`

### 3C. Project Management

**Goal:** Review and manage institution projects.

**Files:**
- `src/app/institution/[slug]/admin/projects/page.tsx`
- `src/app/api/institutions/[id]/projects/route.ts`
- `src/components/institutions/admin/project-review.tsx`
- `src/components/institutions/admin/featured-projects.tsx`

---

## Phase 4: Institution-Specific Features

### 4A. University Features

**Goal:** Features specific to universities.

**Schema Addition:**

```prisma
model UniversitySettings {
  id              String   @id @default(cuid())
  institutionId   String   @unique
  alumniAccess    Boolean  @default(true)
  studentVerification Boolean @default(false)
  departmentCodes String[] // For categorization
  graduationYears Json     // Active graduation years
  greekLife       Boolean  @default(false)
  athletics       Boolean  @default(false)

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

**Features:**
- Class year giving challenges
- Department/college competition
- Alumni directories
- Student org projects
- Reunion giving

**Files:**
- `src/lib/institutions/university.ts`
- `src/components/institutions/university/class-challenge.tsx`
- `src/components/institutions/university/department-leaderboard.tsx`

### 4B. City/Government Features

**Goal:** Features for municipal governments.

**Schema Addition:**

```prisma
model CitySettings {
  id              String   @id @default(cuid())
  institutionId   String   @unique
  neighborhoods   String[] // Official neighborhood list
  councilDistricts Json    // District boundaries
  budgetIntegration Boolean @default(false)
  publicMeetings  Boolean  @default(false)

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

**Features:**
- Neighborhood-based giving
- Council district projects
- City matching funds
- Public project proposals
- Budget participation

**Files:**
- `src/lib/institutions/city.ts`
- `src/components/institutions/city/neighborhood-map.tsx`
- `src/components/institutions/city/district-projects.tsx`

### 4C. Foundation Features

**Goal:** Features for grantmaking foundations.

**Schema Addition:**

```prisma
model FoundationSettings {
  id              String   @id @default(cuid())
  institutionId   String   @unique
  grantCycles     Json     // Grant cycle configurations
  fundTypes       String[] // DAF, scholarship, project, general
  minimumGrant    Float    @default(1000)
  requiresApplication Boolean @default(true)
  reviewProcess   String   @default("committee") // staff, committee, board

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

**Features:**
- Grant applications
- Review workflows
- Fund management
- Impact reporting
- Donor advised funds

**Files:**
- `src/lib/institutions/foundation.ts`
- `src/components/institutions/foundation/grant-application.tsx`
- `src/components/institutions/foundation/review-queue.tsx`

---

## Phase 5: Data & Reporting

### 5A. Institution Reports

**Goal:** Generate institution-specific reports.

**Schema Addition:**

```prisma
model InstitutionReport {
  id            String   @id @default(cuid())
  institutionId String
  type          String   // monthly, quarterly, annual, custom
  period        String   // "2024-Q1", "2024-01", etc.
  data          Json     // Aggregated metrics
  pdfUrl        String?
  generatedAt   DateTime @default(now())

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)

  @@unique([institutionId, type, period])
  @@index([institutionId])
}
```

**Files:**
- `src/lib/institutions/reports.ts`
- `src/lib/pdf/institution-report-template.ts`
- `src/app/institution/[slug]/admin/reports/page.tsx`
- `src/components/institutions/admin/report-generator.tsx`

### 5B. Analytics Dashboard

**Goal:** Deep analytics for institutions.

**Files:**
- `src/app/institution/[slug]/admin/analytics/page.tsx`
- `src/components/institutions/admin/giving-trends.tsx`
- `src/components/institutions/admin/user-engagement.tsx`
- `src/components/institutions/admin/project-performance.tsx`
- `src/components/institutions/admin/geographic-heatmap.tsx`

### 5C. Data Export

**Goal:** Export institution data.

**Files:**
- `src/lib/institutions/export.ts`
- `src/app/api/institutions/[id]/export/route.ts`
- `src/components/institutions/admin/export-wizard.tsx`

---

## Phase 6: Integration & APIs

### 6A. SSO Integration

**Goal:** Single sign-on for institutions.

**Schema Addition:**

```prisma
model InstitutionSSO {
  id            String   @id @default(cuid())
  institutionId String   @unique
  provider      String   // saml, oidc, google, microsoft
  config        Json     // Provider-specific config
  entityId      String?
  metadataUrl   String?
  isEnabled     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  institution Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/institutions/sso.ts`
- `src/app/api/auth/institution/[slug]/route.ts`
- `src/app/institution/[slug]/auth/sso/page.tsx`
- `src/components/institutions/sso-config.tsx`

### 6B. Data Sync APIs

**Goal:** Sync data with institution systems.

**Files:**
- `src/app/api/institutions/[id]/sync/users/route.ts`
- `src/app/api/institutions/[id]/sync/projects/route.ts`
- `src/lib/institutions/sync.ts`
- Webhook integration for bi-directional sync

### 6C. Embedded Widgets

**Goal:** Embed institution giving on their sites.

**Files:**
- `src/app/embed/institution/[slug]/route.tsx`
- `src/components/institutions/embed/giving-widget.tsx`
- `src/components/institutions/embed/project-showcase.tsx`
- `src/components/institutions/embed/impact-counter.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Multi-Tenant Foundation | Large | Critical |
| 2 | White-Label Branding | Large | High |
| 3 | Admin Portal | Large | High |
| 4 | Institution-Specific | Large | Medium |
| 5 | Data & Reporting | Medium | High |
| 6 | Integration & APIs | Large | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Institution, InstitutionAdmin, InstitutionSettings, InstitutionPage, InstitutionReport, UniversitySettings, CitySettings, FoundationSettings, InstitutionSSO

### New Libraries
- `src/lib/institutions/index.ts`
- `src/lib/institutions/tenant.ts`
- `src/lib/institutions/resolver.ts`
- `src/lib/institutions/branding.ts`
- `src/lib/institutions/domains.ts`
- `src/lib/institutions/university.ts`
- `src/lib/institutions/city.ts`
- `src/lib/institutions/foundation.ts`
- `src/lib/institutions/reports.ts`
- `src/lib/institutions/export.ts`
- `src/lib/institutions/sso.ts`
- `src/lib/institutions/sync.ts`

### Pages
- `src/app/institution/[slug]/page.tsx`
- `src/app/institution/[slug]/admin/page.tsx`
- `src/app/institution/[slug]/admin/users/page.tsx`
- `src/app/institution/[slug]/admin/projects/page.tsx`
- `src/app/institution/[slug]/admin/reports/page.tsx`
- `src/app/institution/[slug]/admin/analytics/page.tsx`
- `src/app/admin/institutions/page.tsx` - Super admin

---

## Pricing Tiers

| Tier | Monthly Fee | Features |
|------|-------------|----------|
| **Standard** | $500/mo | Up to 1K users, basic branding, standard reports |
| **Premium** | $2K/mo | Up to 10K users, custom domain, SSO, advanced analytics |
| **Enterprise** | $5K+/mo | Unlimited users, API access, dedicated support, custom features |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test tenant resolution from subdomain
4. Verify branding applies correctly
5. Test admin permissions
6. Verify reports generate correctly
7. Test SSO flow end-to-end
