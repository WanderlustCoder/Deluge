# Plan 39: Data Privacy & Security

## Overview

Comprehensive privacy and security framework ensuring user data protection, regulatory compliance (GDPR, CCPA), and robust security controls. Build trust through transparency and give users control over their data.

**Core Principle:** Privacy by design, security by default.

---

## Phase 1: Privacy Foundation

### 1A. Consent Management

**Goal:** Track and manage user consent.

**Schema Addition:**

```prisma
model UserConsent {
  id              String   @id @default(cuid())
  userId          String
  consentType     String   // marketing, analytics, third_party, data_sharing
  granted         Boolean
  version         String   // Policy version
  ipAddress       String?
  userAgent       String?
  grantedAt       DateTime?
  revokedAt       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, consentType])
  @@index([userId])
  @@index([consentType, granted])
}

model ConsentPolicy {
  id              String   @id @default(cuid())
  type            String   @unique
  version         String
  title           String
  description     String
  content         String
  isActive        Boolean  @default(true)
  effectiveDate   DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([type, isActive])
}
```

**Files:**
- `src/lib/privacy/consent.ts` - Consent management
- `src/app/api/privacy/consent/route.ts`
- `src/components/privacy/consent-banner.tsx`
- `src/components/privacy/consent-modal.tsx`
- `src/components/privacy/consent-preferences.tsx`

### 1B. Privacy Settings

**Goal:** User privacy controls.

**Schema Addition:**

```prisma
model PrivacySettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  profileVisibility String @default("public") // public, community, private
  showGivingHistory Boolean @default(false)
  showBadges      Boolean  @default(true)
  showCommunities Boolean  @default(true)
  allowTagging    Boolean  @default(true)
  allowMessages   String   @default("followers") // anyone, followers, none
  showOnLeaderboards Boolean @default(true)
  dataRetention   String   @default("indefinite") // 1y, 3y, 5y, indefinite
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/privacy/settings.ts`
- `src/app/(app)/account/privacy/page.tsx`
- `src/components/privacy/privacy-form.tsx`
- `src/components/privacy/visibility-selector.tsx`
- `src/components/privacy/data-retention.tsx`

### 1C. Data Inventory

**Goal:** Track all user data.

**Schema Addition:**

```prisma
model DataCategory {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String
  retention       String   // Duration or "indefinite"
  legalBasis      String   // consent, contract, legal, legitimate_interest
  purposes        String[]
  recipients      String[] // Third parties
  isRequired      Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

**Files:**
- `src/lib/privacy/data-inventory.ts`
- `src/app/(marketing)/privacy/data/page.tsx`
- `src/components/privacy/data-categories.tsx`
- Documentation of all data collected

---

## Phase 2: Data Subject Rights

### 2A. Data Access

**Goal:** Users can access their data.

**Schema Addition:**

```prisma
model DataRequest {
  id              String   @id @default(cuid())
  userId          String
  type            String   // access, export, deletion, rectification, portability
  status          String   @default("pending") // pending, processing, completed, failed
  requestedAt     DateTime @default(now())
  processedAt     DateTime?
  processedBy     String?
  resultUrl       String?  // Download link
  expiresAt       DateTime?
  notes           String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, type])
  @@index([status])
}
```

**Files:**
- `src/lib/privacy/data-access.ts`
- `src/app/(app)/account/privacy/data/page.tsx`
- `src/components/privacy/data-request-form.tsx`
- `src/components/privacy/request-status.tsx`

### 2B. Data Export

**Goal:** Export all user data.

**Files:**
- `src/lib/privacy/export.ts`
- `src/lib/privacy/export/user.ts`
- `src/lib/privacy/export/transactions.ts`
- `src/lib/privacy/export/activity.ts`
- `src/app/api/privacy/export/route.ts`
- JSON and CSV export formats

### 2C. Data Deletion

**Goal:** Right to be forgotten.

**Files:**
- `src/lib/privacy/deletion.ts`
- `src/lib/privacy/deletion/cascade.ts`
- `src/lib/privacy/deletion/anonymize.ts`
- `src/app/api/privacy/delete/route.ts`
- `src/components/privacy/delete-account.tsx`
- `src/components/privacy/deletion-confirmation.tsx`

### 2D. Data Rectification

**Goal:** Correct inaccurate data.

**Files:**
- `src/lib/privacy/rectification.ts`
- `src/components/privacy/rectify-form.tsx`
- Audit trail for changes

---

## Phase 3: Security Infrastructure

### 3A. Authentication Security

**Goal:** Secure authentication.

**Schema Addition:**

```prisma
model SecurityEvent {
  id              String   @id @default(cuid())
  userId          String?
  eventType       String   // login, logout, password_change, 2fa_enabled
  severity        String   @default("info") // info, warning, critical
  ipAddress       String?
  userAgent       String?
  location        Json?    // Geo data
  metadata        Json?
  createdAt       DateTime @default(now())

  @@index([userId, eventType])
  @@index([createdAt])
  @@index([severity])
}

model UserSession {
  id              String   @id @default(cuid())
  userId          String
  token           String   @unique
  deviceName      String?
  deviceType      String?  // desktop, mobile, tablet
  ipAddress       String?
  location        String?
  lastActiveAt    DateTime @default(now())
  expiresAt       DateTime
  isRevoked       Boolean  @default(false)
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRevoked])
  @@index([token])
}
```

**Files:**
- `src/lib/security/auth.ts`
- `src/lib/security/sessions.ts`
- `src/app/(app)/account/security/page.tsx`
- `src/components/security/active-sessions.tsx`
- `src/components/security/revoke-session.tsx`

### 3B. Two-Factor Authentication

**Goal:** 2FA for accounts.

**Schema Addition:**

```prisma
model TwoFactorAuth {
  id              String   @id @default(cuid())
  userId          String   @unique
  method          String   // totp, sms, email
  secret          String?  // Encrypted TOTP secret
  phone           String?
  backupCodes     String[] // Hashed backup codes
  isEnabled       Boolean  @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/security/2fa/index.ts`
- `src/lib/security/2fa/totp.ts`
- `src/lib/security/2fa/sms.ts`
- `src/app/api/security/2fa/route.ts`
- `src/components/security/2fa-setup.tsx`
- `src/components/security/2fa-verify.tsx`
- `src/components/security/backup-codes.tsx`

### 3C. Password Security

**Goal:** Strong password management.

**Files:**
- `src/lib/security/password.ts`
- `src/lib/security/breach-check.ts` - HIBP integration
- `src/components/security/password-strength.tsx`
- `src/components/security/change-password.tsx`
- Password history, complexity requirements

---

## Phase 4: Encryption & Data Protection

### 4A. Encryption at Rest

**Goal:** Encrypt sensitive data.

**Files:**
- `src/lib/security/encryption.ts`
- `src/lib/security/key-management.ts`
- `src/lib/security/field-encryption.ts`
- Encrypted fields for sensitive data

### 4B. Encryption in Transit

**Goal:** Secure data transmission.

**Files:**
- TLS configuration
- API security headers
- `src/middleware/security.ts`
- HSTS, CSP headers

### 4C. PII Handling

**Goal:** Protect personal data.

**Files:**
- `src/lib/security/pii.ts`
- `src/lib/security/masking.ts`
- `src/lib/security/tokenization.ts`
- PII detection and handling

---

## Phase 5: Audit & Compliance

### 5A. Audit Logging

**Goal:** Comprehensive audit trail.

**Schema Addition:**

```prisma
model AuditLog {
  id              String   @id @default(cuid())
  userId          String?
  action          String   // create, read, update, delete
  entityType      String
  entityId        String
  previousState   Json?
  newState        Json?
  ipAddress       String?
  userAgent       String?
  metadata        Json?
  createdAt       DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId, createdAt])
  @@index([action, createdAt])
}
```

**Files:**
- `src/lib/security/audit.ts`
- `src/lib/security/audit-logger.ts`
- `src/app/admin/security/audit/page.tsx`
- `src/components/admin/audit-log-viewer.tsx`
- Automatic audit logging for sensitive actions

### 5B. Compliance Dashboard

**Goal:** Track compliance status.

**Files:**
- `src/lib/compliance/index.ts`
- `src/lib/compliance/gdpr.ts`
- `src/lib/compliance/ccpa.ts`
- `src/app/admin/compliance/page.tsx`
- `src/components/admin/compliance-checklist.tsx`
- `src/components/admin/dsar-queue.tsx`

### 5C. Retention Management

**Goal:** Enforce data retention.

**Files:**
- `src/lib/privacy/retention.ts`
- `src/lib/privacy/retention/scheduler.ts`
- `src/app/admin/privacy/retention/page.tsx`
- Automated data cleanup jobs

---

## Phase 6: Threat Protection

### 6A. Rate Limiting

**Goal:** Prevent abuse.

**Schema Addition:**

```prisma
model RateLimit {
  id              String   @id @default(cuid())
  identifier      String   // IP, user ID, or API key
  endpoint        String
  count           Int      @default(0)
  windowStart     DateTime
  windowEnd       DateTime
  isBlocked       Boolean  @default(false)
  blockedUntil    DateTime?

  @@unique([identifier, endpoint, windowStart])
  @@index([identifier, isBlocked])
}
```

**Files:**
- `src/lib/security/rate-limit.ts`
- `src/middleware/rate-limit.ts`
- `src/app/api/security/rate-limits/route.ts`
- Configurable rate limits per endpoint

### 6B. Fraud Detection

**Goal:** Detect suspicious activity.

**Schema Addition:**

```prisma
model SuspiciousActivity {
  id              String   @id @default(cuid())
  userId          String?
  type            String   // velocity, location, device, pattern
  severity        String   // low, medium, high, critical
  description     String
  indicators      Json
  status          String   @default("pending") // pending, reviewed, false_positive, confirmed
  reviewedBy      String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())

  @@index([userId, status])
  @@index([severity, status])
}
```

**Files:**
- `src/lib/security/fraud/index.ts`
- `src/lib/security/fraud/velocity.ts`
- `src/lib/security/fraud/device.ts`
- `src/lib/security/fraud/pattern.ts`
- `src/app/admin/security/fraud/page.tsx`
- `src/components/admin/fraud-queue.tsx`

### 6C. Security Monitoring

**Goal:** Real-time security monitoring.

**Files:**
- `src/lib/security/monitoring.ts`
- `src/lib/security/alerts.ts`
- `src/app/admin/security/dashboard/page.tsx`
- `src/components/admin/security-overview.tsx`
- `src/components/admin/threat-map.tsx`
- Alert notifications for security events

---

## Phase 7: User Security Features

### 7A. Login Alerts

**Goal:** Notify users of account activity.

**Files:**
- `src/lib/security/login-alerts.ts`
- `src/components/security/new-device-alert.tsx`
- `src/components/security/suspicious-login.tsx`
- Email notifications for new logins

### 7B. Account Recovery

**Goal:** Secure account recovery.

**Schema Addition:**

```prisma
model AccountRecovery {
  id              String   @id @default(cuid())
  userId          String
  type            String   // email, phone, backup_code
  token           String   @unique
  expiresAt       DateTime
  usedAt          DateTime?
  ipAddress       String?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

**Files:**
- `src/lib/security/recovery.ts`
- `src/app/(auth)/recover/page.tsx`
- `src/components/security/recovery-form.tsx`
- `src/components/security/verify-identity.tsx`

### 7C. Security Checkup

**Goal:** User security health check.

**Files:**
- `src/lib/security/checkup.ts`
- `src/app/(app)/account/security/checkup/page.tsx`
- `src/components/security/security-score.tsx`
- `src/components/security/recommendations.tsx`
- `src/components/security/improvement-list.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Privacy Foundation | Large | Critical |
| 2 | Data Subject Rights | Large | Critical |
| 3 | Security Infrastructure | Large | Critical |
| 4 | Encryption & Data Protection | Large | High |
| 5 | Audit & Compliance | Medium | High |
| 6 | Threat Protection | Large | High |
| 7 | User Security Features | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add UserConsent, ConsentPolicy, PrivacySettings, DataCategory, DataRequest, SecurityEvent, UserSession, TwoFactorAuth, AuditLog, RateLimit, SuspiciousActivity, AccountRecovery

### New Libraries
- `src/lib/privacy/consent.ts`
- `src/lib/privacy/settings.ts`
- `src/lib/privacy/export.ts`
- `src/lib/privacy/deletion.ts`
- `src/lib/privacy/retention.ts`
- `src/lib/security/auth.ts`
- `src/lib/security/2fa/*.ts`
- `src/lib/security/encryption.ts`
- `src/lib/security/audit.ts`
- `src/lib/security/fraud/*.ts`
- `src/lib/security/monitoring.ts`

### Pages
- `src/app/(app)/account/privacy/page.tsx`
- `src/app/(app)/account/security/page.tsx`
- `src/app/(marketing)/privacy/data/page.tsx`
- `src/app/admin/security/dashboard/page.tsx`
- `src/app/admin/security/audit/page.tsx`
- `src/app/admin/security/fraud/page.tsx`
- `src/app/admin/compliance/page.tsx`

---

## Compliance Framework

| Regulation | Key Requirements | Status |
|------------|------------------|--------|
| **GDPR** | Consent, access, deletion, portability | Planned |
| **CCPA** | Opt-out, disclosure, deletion | Planned |
| **PCI DSS** | Payment security (via Stripe) | Via provider |
| **SOC 2** | Security controls | Future |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Security audit checklist
4. Penetration testing
5. Privacy impact assessment
6. Compliance review
7. User testing of privacy controls

