# Plan 18: Project Verification & Auditing

## Overview

Build trust through transparent project verification, outcome auditing, and third-party validation. Ensures funded projects deliver promised impact and protects platform integrity.

---

## Phase 1: Verification Framework

### 1A. Verification Levels Schema

**Goal:** Define verification levels and requirements.

**Schema Addition:**

```prisma
model ProjectVerification {
  id              String   @id @default(cuid())
  projectId       String   @unique
  level           String   @default("unverified") // unverified, basic, verified, audited
  organizationVerified Boolean @default(false)
  documentsVerified Boolean @default(false)
  outcomeVerified  Boolean @default(false)
  lastVerifiedAt   DateTime?
  lastVerifiedBy   String?
  expiresAt        DateTime?
  notes            String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  project  Project              @relation(fields: [projectId], references: [id], onDelete: Cascade)
  checks   VerificationCheck[]
  audits   ProjectAudit[]
}

model VerificationCheck {
  id              String   @id @default(cuid())
  verificationId  String
  checkType       String   // identity, documents, location, organization, outcome
  status          String   @default("pending") // pending, passed, failed, expired
  evidence        Json?    // Submitted evidence
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewNotes     String?
  expiresAt       DateTime?
  createdAt       DateTime @default(now())

  verification ProjectVerification @relation(fields: [verificationId], references: [id], onDelete: Cascade)

  @@index([verificationId, checkType])
  @@index([status])
}
```

**Verification Levels:**
- **Unverified**: Basic project, proposer account only
- **Basic**: Identity verified, basic documents
- **Verified**: Organization verified, full documentation
- **Audited**: Third-party audit completed

**Files:**
- `src/lib/verification/index.ts` - Verification logic
- `src/lib/verification/levels.ts` - Level definitions
- `src/lib/verification/checks.ts` - Check types and requirements
- `src/app/api/projects/[id]/verification/route.ts`

### 1B. Verification Badges

**Goal:** Display verification status prominently.

**Files:**
- `src/components/verification/verification-badge.tsx` - Badge component
- `src/components/verification/verification-tooltip.tsx` - Detail on hover
- Update project cards and detail pages to show badges

---

## Phase 2: Identity & Organization Verification

### 2A. Proposer Identity Verification

**Goal:** Verify project proposers are who they claim.

**Schema Addition:**

```prisma
model IdentityVerification {
  id              String   @id @default(cuid())
  userId          String
  type            String   // personal, business
  status          String   @default("pending") // pending, verified, rejected, expired
  provider        String?  // stripe_identity, manual
  providerRef     String?  // External verification ID
  documentType    String?  // drivers_license, passport, ein
  verifiedName    String?
  verifiedAddress String?
  verifiedAt      DateTime?
  expiresAt       DateTime?
  rejectionReason String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}
```

**Files:**
- `src/lib/verification/identity.ts` - Identity verification
- `src/lib/verification/providers/stripe-identity.ts` - Stripe Identity integration
- `src/app/api/verification/identity/route.ts`
- `src/components/verification/identity-verification-flow.tsx`
- `src/components/verification/document-upload.tsx`

### 2B. Organization Verification

**Goal:** Verify 501c3 status and organization legitimacy.

**Schema Addition:**

```prisma
model OrganizationVerification {
  id              String   @id @default(cuid())
  projectId       String?
  businessId      String?  // For business directory
  organizationName String
  ein             String?
  registrationNumber String?
  registrationType String?  // 501c3, 501c4, government, llc
  verificationStatus String @default("pending")
  verifiedAt      DateTime?
  documents       Json?    // IRS determination letter, etc.
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([ein])
  @@index([verificationStatus])
}
```

**Files:**
- `src/lib/verification/organization.ts` - Org verification
- `src/lib/verification/ein-lookup.ts` - IRS EIN validation
- `src/app/api/verification/organization/route.ts`
- `src/components/verification/org-verification-form.tsx`

---

## Phase 3: Outcome Verification

### 3A. Outcome Tracking

**Goal:** Verify projects deliver promised outcomes.

**Schema Addition:**

```prisma
model OutcomeVerification {
  id              String   @id @default(cuid())
  projectId       String
  outcomeType     String   // completion, impact_metric, milestone
  description     String
  targetValue     Float?
  actualValue     Float?
  evidence        Json?    // Photos, receipts, documents
  status          String   @default("pending") // pending, verified, disputed, unverified
  verifiedBy      String?
  verifiedAt      DateTime?
  verificationMethod String? // self_reported, community, third_party
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, status])
}
```

**Files:**
- `src/lib/verification/outcomes.ts` - Outcome verification
- `src/app/api/projects/[id]/outcomes/route.ts`
- `src/components/verification/outcome-form.tsx`
- `src/components/verification/outcome-evidence.tsx`
- `src/components/verification/outcome-timeline.tsx`

### 3B. Community Verification

**Goal:** Community members can verify outcomes they witnessed.

**Schema Addition:**

```prisma
model CommunityVerification {
  id              String   @id @default(cuid())
  outcomeId       String
  userId          String
  relationship    String   // beneficiary, witness, neighbor, volunteer
  verification    String   // confirmed, disputed
  comment         String?
  evidence        Json?
  createdAt       DateTime @default(now())

  outcome OutcomeVerification @relation(fields: [outcomeId], references: [id], onDelete: Cascade)

  @@unique([outcomeId, userId])
  @@index([outcomeId])
}
```

**Files:**
- `src/lib/verification/community.ts` - Community verification
- `src/app/api/outcomes/[id]/verify/route.ts`
- `src/components/verification/community-verify-modal.tsx`
- `src/components/verification/verification-count.tsx`

---

## Phase 4: Third-Party Audits

### 4A. Audit Framework

**Goal:** Enable professional third-party audits.

**Schema Addition:**

```prisma
model ProjectAudit {
  id              String   @id @default(cuid())
  verificationId  String
  auditorId       String   // User who conducted audit
  auditorOrg      String?  // Auditing organization
  auditType       String   // financial, impact, compliance
  scope           String   // What was audited
  findings        Json     // Audit findings
  rating          String?  // pass, conditional, fail
  reportUrl       String?
  startDate       DateTime
  completedDate   DateTime?
  status          String   @default("in_progress") // scheduled, in_progress, completed, cancelled
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  verification ProjectVerification @relation(fields: [verificationId], references: [id], onDelete: Cascade)

  @@index([verificationId])
  @@index([status])
}

model Auditor {
  id              String   @id @default(cuid())
  userId          String   @unique
  organization    String
  credentials     String[]
  specialties     String[] // Categories they can audit
  status          String   @default("pending") // pending, approved, suspended
  approvedAt      DateTime?
  auditsCompleted Int      @default(0)
  averageRating   Float?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
}
```

**Files:**
- `src/lib/verification/audits.ts` - Audit management
- `src/app/api/audits/route.ts`
- `src/app/api/auditors/route.ts`
- `src/components/verification/audit-report.tsx`
- `src/components/verification/request-audit-modal.tsx`

### 4B. Auditor Network

**Goal:** Build network of qualified auditors.

**Files:**
- `src/app/admin/auditors/page.tsx` - Manage auditors
- `src/app/(app)/auditors/apply/page.tsx` - Apply to be auditor
- `src/components/verification/auditor-card.tsx`
- `src/components/verification/auditor-profile.tsx`

---

## Phase 5: Fraud Prevention

### 5A. Red Flag Detection

**Goal:** Automatically detect suspicious projects.

**Schema Addition:**

```prisma
model ProjectFlag {
  id          String   @id @default(cuid())
  projectId   String
  type        String   // duplicate, suspicious_funding, unresponsive, misuse
  severity    String   // low, medium, high, critical
  description String
  evidence    Json?
  status      String   @default("open") // open, investigating, resolved, dismissed
  reportedBy  String?  // User ID or "system"
  resolvedBy  String?
  resolvedAt  DateTime?
  resolution  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, status])
  @@index([severity, status])
}
```

**Red Flag Triggers:**
- Similar project titles/descriptions (potential duplicates)
- Unusual funding patterns
- Proposer unresponsive to verification requests
- Community disputes on outcomes
- Multiple projects never completed

**Files:**
- `src/lib/verification/fraud-detection.ts` - Detection algorithms
- `src/lib/verification/red-flags.ts` - Flag definitions
- `src/app/api/projects/[id]/flag/route.ts` - Report flag
- `src/components/verification/flag-project-modal.tsx`

### 5B. Investigation Workflow

**Goal:** Process and resolve flags.

**Files:**
- `src/app/admin/flags/page.tsx` - Flag dashboard
- `src/app/admin/flags/[id]/page.tsx` - Investigation view
- `src/components/admin/flag-table.tsx`
- `src/components/admin/investigation-panel.tsx`
- `src/lib/verification/investigation.ts`

---

## Phase 6: Trust & Transparency

### 6A. Trust Score

**Goal:** Calculate and display project trust scores.

**Files:**
- `src/lib/verification/trust-score.ts` - Score calculation
- `src/components/verification/trust-score-badge.tsx`
- `src/components/verification/trust-breakdown.tsx`

**Trust Score Factors:**
- Verification level (40%)
- Proposer history (20%)
- Community verifications (20%)
- Outcome completion rate (20%)

### 6B. Verification Reports

**Goal:** Public transparency on verification activities.

**Files:**
- `src/app/(marketing)/trust/page.tsx` - Trust & transparency page
- `src/components/verification/platform-trust-stats.tsx`
- `src/components/verification/verification-timeline.tsx`
- Integration with `/transparency` page

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Verification Framework | Medium | High |
| 2 | Identity & Organization | Large | High |
| 3 | Outcome Verification | Large | High |
| 4 | Third-Party Audits | Large | Medium |
| 5 | Fraud Prevention | Large | High |
| 6 | Trust & Transparency | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add ProjectVerification, VerificationCheck, IdentityVerification, OrganizationVerification, OutcomeVerification, CommunityVerification, ProjectAudit, Auditor, ProjectFlag

### New Libraries
- `src/lib/verification/index.ts`
- `src/lib/verification/levels.ts`
- `src/lib/verification/checks.ts`
- `src/lib/verification/identity.ts`
- `src/lib/verification/organization.ts`
- `src/lib/verification/ein-lookup.ts`
- `src/lib/verification/outcomes.ts`
- `src/lib/verification/community.ts`
- `src/lib/verification/audits.ts`
- `src/lib/verification/fraud-detection.ts`
- `src/lib/verification/trust-score.ts`

### Pages
- `src/app/(marketing)/trust/page.tsx`
- `src/app/admin/flags/page.tsx`
- `src/app/admin/auditors/page.tsx`
- `src/app/(app)/auditors/apply/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test verification flows end-to-end
4. Verify badge display on all project views
5. Test fraud detection triggers
6. Verify trust score calculations
