# Plan 35: Multi-Currency & Global Expansion

## Overview

Enable Deluge to operate in multiple currencies and regions. Support international giving, localized payment methods, and region-specific compliance. Prepare the platform for global expansion while maintaining community-first values.

**Core Principle:** Enable giving across borders while respecting local regulations and payment preferences.

---

## Phase 1: Currency Foundation

### 1A. Currency Schema

**Goal:** Multi-currency infrastructure.

**Schema Addition:**

```prisma
model Currency {
  id          String   @id @default(cuid())
  code        String   @unique // USD, EUR, GBP, CAD
  name        String   // US Dollar, Euro, British Pound
  symbol      String   // $, \u20ac, \u00a3
  decimals    Int      @default(2)
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  order       Int      @default(0)
}

model ExchangeRate {
  id          String   @id @default(cuid())
  fromCurrency String
  toCurrency   String
  rate        Float
  source      String   // api_provider, manual
  validFrom   DateTime
  validUntil  DateTime?
  createdAt   DateTime @default(now())

  @@unique([fromCurrency, toCurrency, validFrom])
  @@index([fromCurrency, toCurrency, validFrom])
}

model UserCurrencyPreference {
  id          String   @id @default(cuid())
  userId      String   @unique
  displayCurrency String @default("USD")
  paymentCurrency String @default("USD")
  autoConvert Boolean  @default(true)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/currency/index.ts` - Currency utilities
- `src/lib/currency/exchange.ts` - Rate fetching
- `src/lib/currency/conversion.ts` - Conversion logic
- `src/app/api/currency/rates/route.ts`

### 1B. Exchange Rate Provider

**Goal:** Automated rate updates.

**Files:**
- `src/lib/currency/providers/index.ts` - Provider interface
- `src/lib/currency/providers/openexchangerates.ts`
- `src/lib/currency/providers/currencyapi.ts`
- `src/lib/currency/providers/fallback.ts`
- Cron job for hourly updates

### 1C. Display Formatting

**Goal:** Locale-aware currency display.

**Files:**
- `src/lib/currency/format.ts` - Formatting utilities
- `src/components/currency/currency-display.tsx`
- `src/components/currency/currency-input.tsx`
- `src/components/currency/currency-selector.tsx`
- `src/hooks/use-currency.ts`

---

## Phase 2: Multi-Currency Transactions

### 2A. Transaction Currency

**Goal:** Track original and converted amounts.

**Schema Addition:**

```prisma
model TransactionCurrency {
  id              String   @id @default(cuid())
  transactionId   String
  transactionType String   // allocation, loan_share, donation
  originalAmount  Float
  originalCurrency String
  convertedAmount Float
  convertedCurrency String
  exchangeRate    Float
  rateTimestamp   DateTime
  createdAt       DateTime @default(now())

  @@unique([transactionId, transactionType])
}
```

**Files:**
- `src/lib/currency/transactions.ts`
- Update fund route with currency handling
- Update loan funding with currency
- `src/components/fund/currency-notice.tsx`

### 2B. Multi-Currency Checkout

**Goal:** Pay in preferred currency.

**Files:**
- `src/components/checkout/currency-options.tsx`
- `src/components/checkout/conversion-preview.tsx`
- `src/components/checkout/exchange-disclaimer.tsx`
- Integration with payment provider currency support

### 2C. Settlement Currency

**Goal:** Settle to projects in local currency.

**Files:**
- `src/lib/currency/settlement.ts`
- `src/lib/currency/payout.ts`
- Project payout currency configuration
- FX fee handling

---

## Phase 3: Regional Configuration

### 3A. Region Schema

**Goal:** Region-specific settings.

**Schema Addition:**

```prisma
model Region {
  id              String   @id @default(cuid())
  code            String   @unique // US, CA, GB, EU
  name            String
  currency        String   // Default currency
  timezone        String
  dateFormat      String   @default("MM/DD/YYYY")
  numberFormat    String   // 1,000.00 vs 1.000,00
  taxIdLabel      String?  // EIN, CRN, ABN
  taxIdFormat     String?  // Validation regex
  isActive        Boolean  @default(true)
  launchDate      DateTime?
  config          Json?    // Region-specific config

  @@index([isActive])
}

model UserRegion {
  id          String   @id @default(cuid())
  userId      String   @unique
  regionCode  String
  detectedAt  DateTime @default(now())
  confirmedAt DateTime?
  overrideRegion String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/regions/index.ts`
- `src/lib/regions/detection.ts` - Geo detection
- `src/lib/regions/config.ts` - Region config
- `src/middleware/region.ts` - Region middleware

### 3B. Localized Content

**Goal:** Region-specific content.

**Files:**
- `src/lib/regions/content.ts`
- `src/components/regions/region-switcher.tsx`
- `src/components/regions/local-projects.tsx`
- Region-based project filtering

### 3C. Regional Compliance

**Goal:** Meet regional requirements.

**Files:**
- `src/lib/regions/compliance/index.ts`
- `src/lib/regions/compliance/gdpr.ts` - EU
- `src/lib/regions/compliance/ccpa.ts` - California
- `src/lib/regions/compliance/pipeda.ts` - Canada
- Consent management by region

---

## Phase 4: International Payments

### 4A. Payment Methods

**Goal:** Region-specific payment options.

**Schema Addition:**

```prisma
model PaymentMethod {
  id          String   @id @default(cuid())
  code        String   @unique // card, bank_transfer, paypal, ideal, sepa
  name        String
  type        String   // card, bank, wallet, local
  regions     String[] // Supported regions
  currencies  String[] // Supported currencies
  minAmount   Float?
  maxAmount   Float?
  isActive    Boolean  @default(true)
  config      Json?

  @@index([type, isActive])
}

model UserPaymentMethod {
  id              String   @id @default(cuid())
  userId          String
  methodCode      String
  isDefault       Boolean  @default(false)
  metadata        Json?    // Provider-specific data
  lastUsedAt      DateTime?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Files:**
- `src/lib/payments/methods/index.ts`
- `src/lib/payments/methods/card.ts`
- `src/lib/payments/methods/sepa.ts` - EU bank
- `src/lib/payments/methods/ideal.ts` - Netherlands
- `src/lib/payments/methods/bacs.ts` - UK
- `src/components/payments/method-selector.tsx`

### 4B. Cross-Border Transfers

**Goal:** Handle international transfers.

**Files:**
- `src/lib/payments/cross-border.ts`
- `src/lib/payments/wire-transfer.ts`
- `src/components/payments/transfer-details.tsx`
- `src/components/payments/iban-input.tsx`

### 4C. Payout Configuration

**Goal:** Nonprofit payout settings.

**Schema Addition:**

```prisma
model PayoutAccount {
  id              String   @id @default(cuid())
  organizationId  String
  country         String
  currency        String
  accountType     String   // bank, paypal, wise
  accountDetails  Json     // Encrypted bank details
  isVerified      Boolean  @default(false)
  verifiedAt      DateTime?
  isDefault       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
}
```

**Files:**
- `src/lib/payments/payout-accounts.ts`
- `src/components/organizations/payout-setup.tsx`
- `src/components/organizations/bank-form.tsx`
- Verification workflow

---

## Phase 5: Tax & Compliance

### 5A. International Tax Handling

**Goal:** Region-appropriate tax treatment.

**Schema Addition:**

```prisma
model TaxJurisdiction {
  id              String   @id @default(cuid())
  code            String   @unique
  name            String
  country         String
  taxType         String   // vat, gst, sales_tax, none
  rate            Float?
  threshold       Float?   // Registration threshold
  registrationReq Boolean  @default(false)
  rules           Json?    // Complex rules
  isActive        Boolean  @default(true)
}

model OrganizationTaxStatus {
  id              String   @id @default(cuid())
  organizationId  String
  jurisdictionId  String
  taxExempt       Boolean  @default(false)
  taxId           String?
  exemptionDoc    String?
  verifiedAt      DateTime?
  expiresAt       DateTime?
  createdAt       DateTime @default(now())

  @@unique([organizationId, jurisdictionId])
}
```

**Files:**
- `src/lib/tax/jurisdictions.ts`
- `src/lib/tax/exemptions.ts`
- `src/lib/tax/calculations.ts`
- `src/components/tax/exemption-upload.tsx`

### 5B. Receipt Generation

**Goal:** Region-appropriate receipts.

**Files:**
- `src/lib/tax/receipts/index.ts`
- `src/lib/tax/receipts/us.ts` - 501c3 receipts
- `src/lib/tax/receipts/uk.ts` - Gift Aid
- `src/lib/tax/receipts/eu.ts` - VAT receipts
- `src/lib/tax/receipts/ca.ts` - Canadian receipts
- Templates per jurisdiction

### 5C. Regulatory Reporting

**Goal:** Compliance reporting.

**Files:**
- `src/lib/compliance/reporting.ts`
- `src/lib/compliance/audit-trail.ts`
- `src/app/admin/compliance/page.tsx`
- `src/components/admin/compliance-report.tsx`

---

## Phase 6: Localization Infrastructure

### 6A. Language Support

**Goal:** Multi-language platform.

**Files:**
- Enhanced i18n from Plan 25
- `src/lib/i18n/languages.ts`
- `messages/en.json`
- `messages/es.json`
- `messages/fr.json`
- `messages/de.json`
- `messages/pt.json`

### 6B. Content Translation

**Goal:** Translate user content.

**Files:**
- `src/lib/i18n/auto-translate.ts`
- `src/lib/i18n/translation-review.ts`
- `src/components/i18n/translation-toggle.tsx`
- `src/components/i18n/original-language.tsx`

### 6C. Regional Marketing

**Goal:** Region-specific marketing pages.

**Files:**
- `src/app/[region]/page.tsx` - Regional landing
- `src/app/[region]/projects/page.tsx`
- `src/components/marketing/region-hero.tsx`
- Region-specific SEO

---

## Phase 7: Global Operations

### 7A. Regional Admin

**Goal:** Region-specific administration.

**Files:**
- `src/app/admin/regions/page.tsx`
- `src/app/admin/regions/[code]/page.tsx`
- `src/components/admin/region-config.tsx`
- `src/components/admin/region-metrics.tsx`

### 7B. Cross-Region Analytics

**Goal:** Global vs regional reporting.

**Files:**
- `src/lib/analytics/global.ts`
- `src/app/admin/analytics/global/page.tsx`
- `src/components/analytics/region-comparison.tsx`
- `src/components/analytics/currency-breakdown.tsx`

### 7C. Launch Management

**Goal:** Manage regional launches.

**Schema Addition:**

```prisma
model RegionLaunch {
  id          String   @id @default(cuid())
  regionCode  String   @unique
  status      String   @default("planning") // planning, beta, soft_launch, launched
  betaUsers   String[] // Beta tester IDs
  launchDate  DateTime?
  checklist   Json?    // Launch checklist items
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Files:**
- `src/lib/regions/launch.ts`
- `src/app/admin/regions/launch/page.tsx`
- `src/components/admin/launch-checklist.tsx`
- `src/components/admin/beta-management.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Currency Foundation | Large | High |
| 2 | Multi-Currency Transactions | Large | High |
| 3 | Regional Configuration | Medium | Medium |
| 4 | International Payments | Large | High |
| 5 | Tax & Compliance | Large | High |
| 6 | Localization Infrastructure | Medium | Medium |
| 7 | Global Operations | Medium | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Currency, ExchangeRate, UserCurrencyPreference, TransactionCurrency, Region, UserRegion, PaymentMethod, UserPaymentMethod, PayoutAccount, TaxJurisdiction, OrganizationTaxStatus, RegionLaunch

### New Libraries
- `src/lib/currency/index.ts`
- `src/lib/currency/exchange.ts`
- `src/lib/currency/conversion.ts`
- `src/lib/currency/format.ts`
- `src/lib/currency/providers/*.ts`
- `src/lib/regions/index.ts`
- `src/lib/regions/detection.ts`
- `src/lib/regions/compliance/*.ts`
- `src/lib/payments/methods/*.ts`
- `src/lib/payments/cross-border.ts`
- `src/lib/tax/jurisdictions.ts`
- `src/lib/tax/receipts/*.ts`

### Pages
- `src/app/[region]/page.tsx`
- `src/app/admin/regions/page.tsx`
- `src/app/admin/compliance/page.tsx`
- `src/app/admin/analytics/global/page.tsx`

---

## Supported Regions (Initial)

| Region | Currency | Launch Phase |
|--------|----------|--------------|
| United States | USD | Active |
| Canada | CAD | Phase 1 |
| United Kingdom | GBP | Phase 1 |
| European Union | EUR | Phase 2 |
| Australia | AUD | Phase 2 |
| New Zealand | NZD | Phase 3 |

---

## Payment Methods by Region

| Method | US | CA | UK | EU | AU |
|--------|----|----|----|----|-----|
| Card | Yes | Yes | Yes | Yes | Yes |
| ACH/Bank | Yes | Yes | - | - | - |
| SEPA | - | - | - | Yes | - |
| BACS | - | - | Yes | - | - |
| PayPal | Yes | Yes | Yes | Yes | Yes |
| Apple Pay | Yes | Yes | Yes | Yes | Yes |
| iDEAL | - | - | - | NL | - |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Verify exchange rate updates
4. Test multi-currency checkout
5. Verify regional payment methods
6. Test tax receipt generation
7. Validate compliance features

