# Plan 32: Gift Cards & Store Credit

## Overview

Enable users to purchase, send, and redeem Deluge gift cards. Create a store credit system for refunds, rewards, and promotional purposes. Gift cards make giving giftable and expand the platform's reach.

**Core Principle:** Make charitable giving giftable while keeping funds within the giving ecosystem.

---

## Phase 1: Gift Card Foundation

### 1A. Gift Card Schema

**Goal:** Structure for gift cards.

**Schema Addition:**

```prisma
model GiftCard {
  id              String   @id @default(cuid())
  code            String   @unique
  purchaserId     String?  // null for platform-issued
  recipientEmail  String?
  recipientName   String?
  amount          Float
  balance         Float
  currency        String   @default("USD")
  type            String   @default("standard") // standard, promotional, reward, refund
  status          String   @default("active") // pending, active, redeemed, expired, cancelled
  designId        String?
  personalMessage String?
  deliveryMethod  String   @default("email") // email, print, physical
  deliveryDate    DateTime?
  deliveredAt     DateTime?
  redeemedBy      String?
  redeemedAt      DateTime?
  expiresAt       DateTime?
  purchasedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  purchaser    User?              @relation("PurchasedGiftCards", fields: [purchaserId], references: [id])
  redeemer     User?              @relation("RedeemedGiftCards", fields: [redeemedBy], references: [id])
  design       GiftCardDesign?    @relation(fields: [designId], references: [id])
  transactions GiftCardTransaction[]

  @@index([code])
  @@index([recipientEmail])
  @@index([purchaserId])
  @@index([status])
}

model GiftCardDesign {
  id          String   @id @default(cuid())
  name        String
  category    String   // birthday, holiday, thank_you, general, seasonal
  imageUrl    String
  thumbnailUrl String?
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  giftCards GiftCard[]

  @@index([category, isActive])
}
```

**Files:**
- `src/lib/giftcards/index.ts` - Gift card management
- `src/lib/giftcards/codes.ts` - Code generation
- `src/app/api/giftcards/route.ts` - List/create
- `src/app/api/giftcards/[code]/route.ts` - Get/update

### 1B. Gift Card Purchase

**Goal:** Buy gift cards.

**Files:**
- `src/app/(app)/giftcards/page.tsx` - Gift card store
- `src/app/(app)/giftcards/purchase/page.tsx` - Purchase flow
- `src/components/giftcards/amount-selector.tsx`
- `src/components/giftcards/design-picker.tsx`
- `src/components/giftcards/recipient-form.tsx`
- `src/components/giftcards/message-editor.tsx`
- `src/components/giftcards/checkout.tsx`

### 1C. Gift Card Delivery

**Goal:** Deliver gift cards to recipients.

**Files:**
- `src/lib/giftcards/delivery.ts` - Delivery logic
- `src/lib/giftcards/email-templates.ts` - Email designs
- `src/components/giftcards/print-view.tsx` - Printable version
- `src/components/giftcards/digital-card.tsx` - Digital display
- Scheduled delivery for future dates

---

## Phase 2: Redemption

### 2A. Code Redemption

**Goal:** Redeem gift card codes.

**Files:**
- `src/app/(app)/giftcards/redeem/page.tsx`
- `src/app/api/giftcards/redeem/route.ts`
- `src/components/giftcards/redeem-form.tsx`
- `src/components/giftcards/redeem-success.tsx`
- `src/lib/giftcards/redemption.ts`

### 2B. Balance Management

**Goal:** Track and use gift card balance.

**Schema Addition:**

```prisma
model GiftCardTransaction {
  id          String   @id @default(cuid())
  giftCardId  String
  userId      String
  type        String   // redemption, usage, refund
  amount      Float
  balanceBefore Float
  balanceAfter Float
  reference   String?  // Related transaction ID
  description String?
  createdAt   DateTime @default(now())

  giftCard GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)

  @@index([giftCardId, createdAt])
  @@index([userId])
}
```

**Files:**
- `src/lib/giftcards/balance.ts`
- `src/app/(app)/account/giftcards/page.tsx` - My gift cards
- `src/components/giftcards/balance-display.tsx`
- `src/components/giftcards/transaction-history.tsx`

### 2C. Payment Integration

**Goal:** Use gift card balance at checkout.

**Files:**
- `src/lib/giftcards/payment.ts` - Apply to transactions
- `src/components/giftcards/apply-giftcard.tsx`
- `src/components/giftcards/payment-split.tsx` - Split payment
- Integration with fund route

---

## Phase 3: Store Credit

### 3A. Credit System

**Goal:** Platform-issued credits.

**Schema Addition:**

```prisma
model StoreCredit {
  id              String   @id @default(cuid())
  userId          String
  balance         Float    @default(0)
  lifetimeEarned  Float    @default(0)
  lifetimeSpent   Float    @default(0)
  updatedAt       DateTime @updatedAt

  user         User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions StoreCreditTransaction[]

  @@unique([userId])
}

model StoreCreditTransaction {
  id          String   @id @default(cuid())
  creditId    String
  type        String   // earned, spent, expired, adjusted
  source      String   // refund, reward, promotion, referral, adjustment
  amount      Float
  balanceBefore Float
  balanceAfter Float
  reference   String?  // Related entity ID
  description String?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  credit StoreCredit @relation(fields: [creditId], references: [id], onDelete: Cascade)

  @@index([creditId, createdAt])
}
```

**Files:**
- `src/lib/credits/index.ts` - Credit management
- `src/lib/credits/transactions.ts`
- `src/app/api/credits/route.ts`

### 3B. Credit Sources

**Goal:** Ways to earn credit.

**Files:**
- `src/lib/credits/sources/refunds.ts` - Refund to credit
- `src/lib/credits/sources/rewards.ts` - Badge/achievement rewards
- `src/lib/credits/sources/promotions.ts` - Promotional credits
- `src/lib/credits/sources/referrals.ts` - Referral bonuses
- Integration with existing reward systems

### 3C. Credit Display

**Goal:** Show credit balance.

**Files:**
- `src/app/(app)/account/credits/page.tsx` - Credit dashboard
- `src/components/credits/credit-balance.tsx`
- `src/components/credits/credit-history.tsx`
- `src/components/credits/expiring-credits.tsx`

---

## Phase 4: Corporate Gift Cards

### 4A. Bulk Purchase

**Goal:** Businesses buy gift cards in bulk.

**Schema Addition:**

```prisma
model GiftCardOrder {
  id              String   @id @default(cuid())
  purchaserId     String
  organizationName String?
  quantity        Int
  denomination    Float
  totalAmount     Float
  discountPercent Float?
  discountAmount  Float?
  paymentStatus   String   @default("pending")
  paymentRef      String?
  status          String   @default("pending") // pending, processing, completed, cancelled
  deliveryType    String   @default("codes") // codes, physical, email
  notes           String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?

  giftCards GiftCard[]

  @@index([purchaserId])
  @@index([status])
}
```

**Files:**
- `src/app/(app)/giftcards/bulk/page.tsx`
- `src/app/api/giftcards/bulk/route.ts`
- `src/components/giftcards/bulk-order-form.tsx`
- `src/components/giftcards/quantity-discount.tsx`

### 4B. Corporate Portal

**Goal:** Manage corporate gift card programs.

**Files:**
- `src/app/(app)/giftcards/corporate/page.tsx`
- `src/components/giftcards/order-history.tsx`
- `src/components/giftcards/code-distribution.tsx`
- `src/components/giftcards/usage-report.tsx`
- CSV export for codes

### 4C. Custom Branding

**Goal:** Co-branded gift cards.

**Files:**
- `src/lib/giftcards/branding.ts`
- `src/components/giftcards/brand-customizer.tsx`
- `src/components/giftcards/logo-upload.tsx`
- Custom design generation

---

## Phase 5: Promotional Campaigns

### 5A. Promo Codes

**Goal:** Discount and bonus codes.

**Schema Addition:**

```prisma
model PromoCode {
  id              String   @id @default(cuid())
  code            String   @unique
  type            String   // discount, bonus_credit, free_card
  value           Float    // Percentage or fixed amount
  valueType       String   @default("fixed") // fixed, percentage
  minPurchase     Float?
  maxDiscount     Float?
  usageLimit      Int?     // Total uses allowed
  usageCount      Int      @default(0)
  userLimit       Int?     // Uses per user
  validFrom       DateTime
  validUntil      DateTime
  isActive        Boolean  @default(true)
  applicableTo    String[] // product types
  createdBy       String
  createdAt       DateTime @default(now())

  usages PromoCodeUsage[]

  @@index([code, isActive])
}

model PromoCodeUsage {
  id          String   @id @default(cuid())
  promoCodeId String
  userId      String
  orderId     String?
  discount    Float
  createdAt   DateTime @default(now())

  promoCode PromoCode @relation(fields: [promoCodeId], references: [id], onDelete: Cascade)

  @@unique([promoCodeId, userId, orderId])
}
```

**Files:**
- `src/lib/promos/index.ts`
- `src/app/api/promos/validate/route.ts`
- `src/components/giftcards/promo-input.tsx`
- `src/app/admin/promos/page.tsx`

### 5B. Promotional Gift Cards

**Goal:** Issue promotional gift cards.

**Files:**
- `src/lib/giftcards/promotional.ts`
- `src/app/admin/giftcards/promotional/page.tsx`
- `src/components/admin/issue-promo-cards.tsx`
- `src/components/admin/promo-distribution.tsx`

### 5C. Partner Programs

**Goal:** Partner-issued gift cards.

**Files:**
- `src/lib/giftcards/partners.ts`
- `src/app/api/partners/giftcards/route.ts`
- API for partner integrations

---

## Phase 6: Physical Gift Cards

### 6A. Physical Card Orders

**Goal:** Order physical gift cards.

**Schema Addition:**

```prisma
model PhysicalCardOrder {
  id              String   @id @default(cuid())
  orderId         String   // GiftCardOrder ID
  shippingAddress Json
  shippingMethod  String   // standard, express, overnight
  shippingCost    Float
  trackingNumber  String?
  carrier         String?
  status          String   @default("pending") // pending, printing, shipped, delivered
  printedAt       DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime @default(now())
}
```

**Files:**
- `src/lib/giftcards/physical.ts`
- `src/components/giftcards/shipping-form.tsx`
- `src/components/giftcards/tracking-info.tsx`
- Integration with print fulfillment

### 6B. Card Activation

**Goal:** Activate physical cards.

**Files:**
- `src/lib/giftcards/activation.ts`
- `src/app/api/giftcards/activate/route.ts`
- `src/app/(app)/giftcards/activate/page.tsx`
- `src/components/giftcards/activation-form.tsx`

---

## Phase 7: Admin & Analytics

### 7A. Gift Card Administration

**Goal:** Manage gift card system.

**Files:**
- `src/app/admin/giftcards/page.tsx`
- `src/app/admin/giftcards/[id]/page.tsx`
- `src/components/admin/giftcard-search.tsx`
- `src/components/admin/giftcard-details.tsx`
- `src/components/admin/adjust-balance.tsx`

### 7B. Analytics Dashboard

**Goal:** Gift card metrics.

**Files:**
- `src/lib/giftcards/analytics.ts`
- `src/app/admin/giftcards/analytics/page.tsx`
- `src/components/admin/giftcard-stats.tsx`
- `src/components/admin/redemption-rates.tsx`
- `src/components/admin/breakage-report.tsx` // Unredeemed balance

### 7C. Fraud Prevention

**Goal:** Detect and prevent fraud.

**Files:**
- `src/lib/giftcards/fraud.ts`
- `src/components/admin/suspicious-activity.tsx`
- Rate limiting on redemptions
- Velocity checks

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Gift Card Foundation | Large | High |
| 2 | Redemption | Medium | High |
| 3 | Store Credit | Medium | High |
| 4 | Corporate Gift Cards | Medium | Medium |
| 5 | Promotional Campaigns | Medium | Medium |
| 6 | Physical Gift Cards | Medium | Low |
| 7 | Admin & Analytics | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add GiftCard, GiftCardDesign, GiftCardTransaction, StoreCredit, StoreCreditTransaction, GiftCardOrder, PromoCode, PromoCodeUsage, PhysicalCardOrder

### New Libraries
- `src/lib/giftcards/index.ts`
- `src/lib/giftcards/codes.ts`
- `src/lib/giftcards/delivery.ts`
- `src/lib/giftcards/redemption.ts`
- `src/lib/giftcards/balance.ts`
- `src/lib/giftcards/payment.ts`
- `src/lib/giftcards/branding.ts`
- `src/lib/giftcards/promotional.ts`
- `src/lib/giftcards/physical.ts`
- `src/lib/giftcards/activation.ts`
- `src/lib/giftcards/analytics.ts`
- `src/lib/giftcards/fraud.ts`
- `src/lib/credits/index.ts`
- `src/lib/promos/index.ts`

### Pages
- `src/app/(app)/giftcards/page.tsx`
- `src/app/(app)/giftcards/purchase/page.tsx`
- `src/app/(app)/giftcards/redeem/page.tsx`
- `src/app/(app)/giftcards/bulk/page.tsx`
- `src/app/(app)/account/giftcards/page.tsx`
- `src/app/(app)/account/credits/page.tsx`
- `src/app/admin/giftcards/page.tsx`
- `src/app/admin/promos/page.tsx`

---

## Denominations

| Amount | Discount (Bulk 10+) |
|--------|---------------------|
| $10 | 0% |
| $25 | 0% |
| $50 | 2% |
| $100 | 3% |
| $250 | 5% |
| Custom | Negotiated |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test gift card purchase flow
4. Verify code generation uniqueness
5. Test redemption and balance usage
6. Verify email delivery
7. Test promo code application

