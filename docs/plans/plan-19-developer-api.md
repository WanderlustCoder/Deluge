# Plan 19: Developer API & Integrations

## Overview

Build a public API and integration ecosystem for developers, partners, and third-party applications. Enables external tools to interact with Deluge, expanding platform reach and utility.

---

## Phase 1: API Foundation

### 1A. API Key Management

**Goal:** Issue and manage API keys for developers.

**Schema Addition:**

```prisma
model ApiKey {
  id              String   @id @default(cuid())
  userId          String
  name            String
  keyHash         String   @unique // Hashed key for lookup
  keyPrefix       String   // First 8 chars for identification
  scopes          String[] // read, write, webhooks, etc.
  rateLimit       Int      @default(1000) // Requests per hour
  status          String   @default("active") // active, revoked, expired
  lastUsedAt      DateTime?
  usageCount      Int      @default(0)
  expiresAt       DateTime?
  createdAt       DateTime @default(now())
  revokedAt       DateTime?
  revokedReason   String?

  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs   ApiRequestLog[]

  @@index([keyHash])
  @@index([userId, status])
}

model ApiRequestLog {
  id          String   @id @default(cuid())
  apiKeyId    String
  endpoint    String
  method      String
  statusCode  Int
  responseTime Int     // ms
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  apiKey ApiKey @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)

  @@index([apiKeyId, createdAt])
  @@index([endpoint, createdAt])
}
```

**Files:**
- `src/lib/api/keys.ts` - Key generation and validation
- `src/lib/api/auth.ts` - API authentication middleware
- `src/app/api/developer/keys/route.ts` - Manage API keys
- `src/app/(app)/developer/keys/page.tsx` - Key management UI
- `src/components/developer/api-key-card.tsx`
- `src/components/developer/create-key-modal.tsx`

### 1B. Rate Limiting

**Goal:** Protect API from abuse.

**Files:**
- `src/lib/api/rate-limiter.ts` - Rate limiting logic
- `src/middleware/api-rate-limit.ts` - Rate limit middleware
- `src/components/developer/rate-limit-status.tsx`

---

## Phase 2: Public API Endpoints

### 2A. Read Endpoints

**Goal:** Public data access for projects, communities, and impact.

**Endpoints:**
```
GET /api/v1/projects
GET /api/v1/projects/:id
GET /api/v1/projects/:id/updates
GET /api/v1/projects/:id/impact
GET /api/v1/communities
GET /api/v1/communities/:id
GET /api/v1/communities/:id/projects
GET /api/v1/stats/platform
GET /api/v1/stats/community/:id
GET /api/v1/categories
```

**Files:**
- `src/app/api/v1/projects/route.ts`
- `src/app/api/v1/projects/[id]/route.ts`
- `src/app/api/v1/projects/[id]/updates/route.ts`
- `src/app/api/v1/projects/[id]/impact/route.ts`
- `src/app/api/v1/communities/route.ts`
- `src/app/api/v1/communities/[id]/route.ts`
- `src/app/api/v1/stats/platform/route.ts`
- `src/app/api/v1/categories/route.ts`

### 2B. Write Endpoints

**Goal:** Allow authenticated actions via API.

**Endpoints:**
```
POST /api/v1/fund - Fund a project
POST /api/v1/loans/:id/fund - Fund a loan
POST /api/v1/projects/:id/follow - Follow project
POST /api/v1/contributions - Record contribution
GET  /api/v1/user/watershed - Get user's watershed
GET  /api/v1/user/contributions - Get user's contributions
```

**Files:**
- `src/app/api/v1/fund/route.ts`
- `src/app/api/v1/loans/[id]/fund/route.ts`
- `src/app/api/v1/user/watershed/route.ts`
- `src/app/api/v1/user/contributions/route.ts`

---

## Phase 3: Webhooks

### 3A. Webhook Registration

**Goal:** Push events to external systems.

**Schema Addition:**

```prisma
model Webhook {
  id              String   @id @default(cuid())
  userId          String
  name            String
  url             String
  secret          String   // For signature verification
  events          String[] // project.funded, loan.repaid, etc.
  status          String   @default("active") // active, paused, failed
  failureCount    Int      @default(0)
  lastTriggeredAt DateTime?
  lastSuccessAt   DateTime?
  lastErrorAt     DateTime?
  lastError       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user     User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  deliveries WebhookDelivery[]

  @@index([userId, status])
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhookId   String
  event       String
  payload     Json
  statusCode  Int?
  responseBody String?
  duration    Int?     // ms
  status      String   @default("pending") // pending, delivered, failed
  attempts    Int      @default(0)
  nextRetry   DateTime?
  createdAt   DateTime @default(now())

  webhook Webhook @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  @@index([webhookId, createdAt])
  @@index([status, nextRetry])
}
```

**Webhook Events:**
- `project.created`, `project.funded`, `project.completed`
- `loan.created`, `loan.funded`, `loan.repaid`, `loan.defaulted`
- `contribution.received`
- `community.milestone`
- `user.badge_earned`

**Files:**
- `src/lib/api/webhooks.ts` - Webhook management
- `src/lib/api/webhook-dispatcher.ts` - Send webhooks
- `src/lib/api/webhook-signature.ts` - HMAC signature
- `src/app/api/developer/webhooks/route.ts`
- `src/app/api/developer/webhooks/[id]/route.ts`
- `src/components/developer/webhook-form.tsx`
- `src/components/developer/webhook-logs.tsx`

### 3B. Webhook Retry System

**Goal:** Reliable delivery with exponential backoff.

**Files:**
- `src/lib/api/webhook-retry.ts` - Retry logic
- `src/lib/api/webhook-processor.ts` - Process pending webhooks
- Cron job for retry processing

---

## Phase 4: OAuth & Third-Party Apps

### 4A. OAuth Provider

**Goal:** Allow third-party apps to authenticate users.

**Schema Addition:**

```prisma
model OAuthApp {
  id              String   @id @default(cuid())
  userId          String   // App owner
  name            String
  description     String?
  logoUrl         String?
  websiteUrl      String?
  redirectUris    String[]
  clientId        String   @unique
  clientSecretHash String
  scopes          String[] // Allowed scopes
  status          String   @default("pending") // pending, approved, suspended
  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  authorizations OAuthAuthorization[]

  @@index([clientId])
}

model OAuthAuthorization {
  id          String   @id @default(cuid())
  appId       String
  userId      String
  scopes      String[]
  accessToken String   @unique
  refreshToken String?  @unique
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime @default(now())

  app  OAuthApp @relation(fields: [appId], references: [id], onDelete: Cascade)
  user User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([accessToken])
  @@index([userId, appId])
}
```

**Files:**
- `src/lib/api/oauth.ts` - OAuth flow implementation
- `src/app/api/oauth/authorize/route.ts`
- `src/app/api/oauth/token/route.ts`
- `src/app/api/oauth/revoke/route.ts`
- `src/app/(app)/oauth/authorize/page.tsx` - Consent screen
- `src/components/oauth/authorization-form.tsx`
- `src/components/oauth/scope-list.tsx`

### 4B. App Directory

**Goal:** Showcase third-party integrations.

**Files:**
- `src/app/(app)/apps/page.tsx` - Browse apps
- `src/app/(app)/apps/[id]/page.tsx` - App detail
- `src/components/apps/app-card.tsx`
- `src/components/apps/connect-button.tsx`

---

## Phase 5: Embeds & Widgets

### 5A. Embeddable Widgets

**Goal:** Embed Deluge on external sites.

**Widget Types:**
- Project funding widget
- Donation button
- Impact counter
- Community stats
- Funding progress bar

**Files:**
- `src/app/embed/project/[id]/route.tsx` - Project widget
- `src/app/embed/donate/route.tsx` - Donation button
- `src/app/embed/impact/[type]/route.tsx` - Impact widgets
- `src/lib/api/embed.ts` - Embed configuration
- `src/components/embed/project-widget.tsx`
- `src/components/embed/donate-button.tsx`
- `src/components/embed/impact-counter.tsx`

### 5B. Widget Customization

**Goal:** Allow style customization for brand matching.

**Files:**
- `src/app/(app)/developer/widgets/page.tsx` - Widget builder
- `src/components/developer/widget-customizer.tsx`
- `src/components/developer/widget-preview.tsx`
- `src/components/developer/embed-code.tsx`

---

## Phase 6: Developer Portal

### 6A. Documentation

**Goal:** Comprehensive API documentation.

**Files:**
- `src/app/(marketing)/developers/page.tsx` - Developer home
- `src/app/(marketing)/developers/docs/page.tsx` - API docs
- `src/app/(marketing)/developers/docs/[...slug]/page.tsx` - Doc pages
- `src/lib/api/openapi.ts` - OpenAPI spec generation
- `src/components/docs/api-reference.tsx`
- `src/components/docs/code-example.tsx`
- `src/components/docs/endpoint-card.tsx`

### 6B. API Playground

**Goal:** Interactive API testing.

**Files:**
- `src/app/(app)/developer/playground/page.tsx`
- `src/components/developer/api-tester.tsx`
- `src/components/developer/request-builder.tsx`
- `src/components/developer/response-viewer.tsx`

### 6C. Developer Dashboard

**Goal:** API usage analytics.

**Files:**
- `src/app/(app)/developer/page.tsx` - Developer home
- `src/components/developer/usage-chart.tsx`
- `src/components/developer/endpoint-stats.tsx`
- `src/components/developer/error-log.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | API Foundation | Medium | High |
| 2 | Public API Endpoints | Large | High |
| 3 | Webhooks | Large | High |
| 4 | OAuth & Third-Party Apps | Large | Medium |
| 5 | Embeds & Widgets | Medium | Medium |
| 6 | Developer Portal | Large | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add ApiKey, ApiRequestLog, Webhook, WebhookDelivery, OAuthApp, OAuthAuthorization

### New Libraries
- `src/lib/api/keys.ts`
- `src/lib/api/auth.ts`
- `src/lib/api/rate-limiter.ts`
- `src/lib/api/webhooks.ts`
- `src/lib/api/webhook-dispatcher.ts`
- `src/lib/api/webhook-signature.ts`
- `src/lib/api/webhook-retry.ts`
- `src/lib/api/oauth.ts`
- `src/lib/api/embed.ts`
- `src/lib/api/openapi.ts`

### API Routes (v1)
- `src/app/api/v1/projects/route.ts`
- `src/app/api/v1/communities/route.ts`
- `src/app/api/v1/stats/route.ts`
- `src/app/api/v1/fund/route.ts`
- `src/app/api/v1/user/route.ts`
- `src/app/api/developer/keys/route.ts`
- `src/app/api/developer/webhooks/route.ts`
- `src/app/api/oauth/*.ts`

### Pages
- `src/app/(app)/developer/page.tsx`
- `src/app/(app)/developer/keys/page.tsx`
- `src/app/(app)/developer/widgets/page.tsx`
- `src/app/(app)/developer/playground/page.tsx`
- `src/app/(marketing)/developers/page.tsx`
- `src/app/(marketing)/developers/docs/page.tsx`
- `src/app/(app)/apps/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test API key creation and authentication
4. Verify rate limiting works correctly
5. Test webhook delivery and retry
6. Verify OAuth flow end-to-end
7. Test embed widgets render correctly
