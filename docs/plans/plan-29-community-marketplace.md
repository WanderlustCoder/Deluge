# Plan 29: Community Marketplace

## Overview

Enable community members to exchange goods, services, and skills locally. A hyper-local marketplace that keeps value circulating within communities while generating revenue for community projects through optional transaction fees.

**Core Principle:** Community-first commerce that strengthens local economies and funds local projects.

---

## Phase 1: Marketplace Foundation

### 1A. Listing Schema

**Goal:** Structure for marketplace listings.

**Schema Addition:**

```prisma
model MarketplaceListing {
  id              String   @id @default(cuid())
  sellerId        String
  communityId     String
  title           String
  description     String
  type            String   // product, service, skill, rental, free
  category        String
  subcategory     String?
  price           Float?   // null for free items
  pricingType     String   @default("fixed") // fixed, negotiable, hourly, daily
  currency        String   @default("USD")
  images          String[]
  condition       String?  // new, like_new, good, fair (for products)
  availability    Json?    // For services/rentals
  location        String?
  isDeliverable   Boolean  @default(false)
  deliveryRadius  Float?   // Miles
  quantity        Int      @default(1)
  tags            String[]
  status          String   @default("active") // draft, active, sold, expired, removed
  viewCount       Int      @default(0)
  donatePercent   Float    @default(0) // % to donate to community
  expiresAt       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  seller    User      @relation("SellerListings", fields: [sellerId], references: [id], onDelete: Cascade)
  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  inquiries ListingInquiry[]
  offers    ListingOffer[]

  @@index([communityId, category, status])
  @@index([sellerId, status])
  @@index([type, status])
}

model ListingCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  icon        String?
  parent      String?  // For subcategories
  order       Int      @default(0)
  isActive    Boolean  @default(true)

  @@index([parent])
}
```

**Files:**
- `src/lib/marketplace/listings.ts` - Listing CRUD
- `src/lib/marketplace/categories.ts` - Category management
- `src/app/api/marketplace/listings/route.ts`
- `src/app/api/marketplace/listings/[id]/route.ts`

### 1B. Marketplace Browse

**Goal:** Discover listings in your community.

**Files:**
- `src/app/(app)/marketplace/page.tsx` - Browse listings
- `src/app/(app)/marketplace/[id]/page.tsx` - Listing detail
- `src/components/marketplace/listing-card.tsx`
- `src/components/marketplace/listing-grid.tsx`
- `src/components/marketplace/category-nav.tsx`
- `src/components/marketplace/listing-filters.tsx`
- `src/components/marketplace/search-bar.tsx`

### 1C. Create Listing

**Goal:** Easy listing creation.

**Files:**
- `src/app/(app)/marketplace/create/page.tsx`
- `src/components/marketplace/listing-form.tsx`
- `src/components/marketplace/image-upload.tsx`
- `src/components/marketplace/pricing-options.tsx`
- `src/components/marketplace/availability-picker.tsx`

---

## Phase 2: Communication

### 2A. Inquiries

**Goal:** Buyer-seller communication.

**Schema Addition:**

```prisma
model ListingInquiry {
  id          String   @id @default(cuid())
  listingId   String
  senderId    String
  message     String
  status      String   @default("pending") // pending, replied, closed
  createdAt   DateTime @default(now())

  listing  MarketplaceListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  messages InquiryMessage[]

  @@index([listingId, status])
  @@index([senderId])
}

model InquiryMessage {
  id         String   @id @default(cuid())
  inquiryId  String
  senderId   String
  content    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  inquiry ListingInquiry @relation(fields: [inquiryId], references: [id], onDelete: Cascade)

  @@index([inquiryId, createdAt])
}
```

**Files:**
- `src/lib/marketplace/inquiries.ts`
- `src/app/api/marketplace/listings/[id]/inquire/route.ts`
- `src/app/api/marketplace/inquiries/route.ts`
- `src/app/api/marketplace/inquiries/[id]/messages/route.ts`
- `src/components/marketplace/inquiry-form.tsx`
- `src/components/marketplace/message-thread.tsx`
- `src/app/(app)/marketplace/messages/page.tsx`

### 2B. Offers

**Goal:** Negotiate on price.

**Schema Addition:**

```prisma
model ListingOffer {
  id          String   @id @default(cuid())
  listingId   String
  buyerId     String
  amount      Float
  message     String?
  status      String   @default("pending") // pending, accepted, declined, expired
  expiresAt   DateTime
  respondedAt DateTime?
  createdAt   DateTime @default(now())

  listing MarketplaceListing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([listingId, status])
  @@index([buyerId, status])
}
```

**Files:**
- `src/lib/marketplace/offers.ts`
- `src/app/api/marketplace/listings/[id]/offer/route.ts`
- `src/app/api/marketplace/offers/[id]/route.ts`
- `src/components/marketplace/offer-form.tsx`
- `src/components/marketplace/offer-card.tsx`
- `src/app/(app)/marketplace/offers/page.tsx`

---

## Phase 3: Transactions

### 3A. Transaction Schema

**Goal:** Track marketplace transactions.

**Schema Addition:**

```prisma
model MarketplaceTransaction {
  id              String   @id @default(cuid())
  listingId       String
  buyerId         String
  sellerId        String
  communityId     String
  amount          Float
  platformFee     Float    @default(0)
  communityDonation Float  @default(0)
  status          String   @default("pending") // pending, completed, cancelled, disputed
  paymentMethod   String?  // platform, cash, external
  paymentRef      String?
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  @@index([sellerId, status])
  @@index([buyerId, status])
  @@index([communityId, createdAt])
}
```

**Files:**
- `src/lib/marketplace/transactions.ts`
- `src/app/api/marketplace/transactions/route.ts`
- `src/app/api/marketplace/transactions/[id]/route.ts`
- `src/components/marketplace/transaction-summary.tsx`
- `src/app/(app)/marketplace/transactions/page.tsx`

### 3B. Payment Options

**Goal:** Flexible payment handling.

**Files:**
- `src/lib/marketplace/payments.ts`
- `src/components/marketplace/payment-options.tsx`
- `src/components/marketplace/checkout.tsx`

**Options:**
1. Platform payment (integrated, with optional donation)
2. Cash/local exchange (honor system)
3. External (Venmo, PayPal, etc.)

### 3C. Community Donation

**Goal:** Optional donation to community on sale.

**Files:**
- `src/lib/marketplace/donations.ts`
- `src/components/marketplace/donation-selector.tsx`
- `src/components/marketplace/impact-preview.tsx` - Show donation impact

---

## Phase 4: Services & Skills

### 4A. Service Listings

**Goal:** Specialized support for services.

**Schema Addition:**

```prisma
model ServiceAvailability {
  id          String   @id @default(cuid())
  listingId   String
  dayOfWeek   Int      // 0-6
  startTime   String   // "09:00"
  endTime     String   // "17:00"
  isAvailable Boolean  @default(true)

  @@unique([listingId, dayOfWeek])
}

model ServiceBooking {
  id          String   @id @default(cuid())
  listingId   String
  clientId    String
  providerId  String
  date        DateTime
  startTime   String
  duration    Int      // minutes
  status      String   @default("pending") // pending, confirmed, completed, cancelled
  notes       String?
  createdAt   DateTime @default(now())

  @@index([listingId, date])
  @@index([clientId, status])
  @@index([providerId, date])
}
```

**Files:**
- `src/lib/marketplace/services.ts`
- `src/lib/marketplace/bookings.ts`
- `src/app/api/marketplace/bookings/route.ts`
- `src/components/marketplace/availability-calendar.tsx`
- `src/components/marketplace/booking-form.tsx`
- `src/app/(app)/marketplace/bookings/page.tsx`

### 4B. Skill Exchange

**Goal:** Trade skills without money.

**Schema Addition:**

```prisma
model SkillExchange {
  id            String   @id @default(cuid())
  offererId     String
  offeredSkill  String
  seekedSkill   String
  description   String
  communityId   String
  status        String   @default("open") // open, matched, completed
  createdAt     DateTime @default(now())

  matches SkillMatch[]

  @@index([communityId, status])
}

model SkillMatch {
  id          String   @id @default(cuid())
  exchangeId  String
  matcherId   String
  message     String?
  status      String   @default("pending") // pending, accepted, declined
  createdAt   DateTime @default(now())

  exchange SkillExchange @relation(fields: [exchangeId], references: [id], onDelete: Cascade)

  @@unique([exchangeId, matcherId])
}
```

**Files:**
- `src/lib/marketplace/skills.ts`
- `src/app/(app)/marketplace/skills/page.tsx`
- `src/app/(app)/marketplace/skills/offer/page.tsx`
- `src/components/marketplace/skill-exchange-card.tsx`
- `src/components/marketplace/skill-matcher.tsx`

---

## Phase 5: Trust & Safety

### 5A. Reviews & Ratings

**Goal:** Build trust through reviews.

**Schema Addition:**

```prisma
model MarketplaceReview {
  id              String   @id @default(cuid())
  transactionId   String   @unique
  reviewerId      String
  revieweeId      String
  listingId       String
  rating          Int      // 1-5
  content         String?
  isVerified      Boolean  @default(true) // From completed transaction
  createdAt       DateTime @default(now())

  @@index([revieweeId, createdAt])
}
```

**Files:**
- `src/lib/marketplace/reviews.ts`
- `src/app/api/marketplace/reviews/route.ts`
- `src/components/marketplace/review-form.tsx`
- `src/components/marketplace/seller-rating.tsx`
- `src/components/marketplace/review-list.tsx`

### 5B. Verification

**Goal:** Verified sellers and listings.

**Files:**
- `src/lib/marketplace/verification.ts`
- `src/components/marketplace/verified-badge.tsx`
- `src/components/marketplace/seller-profile.tsx`

### 5C. Dispute Resolution

**Goal:** Handle transaction disputes.

**Schema Addition:**

```prisma
model MarketplaceDispute {
  id              String   @id @default(cuid())
  transactionId   String   @unique
  reporterId      String
  reason          String
  description     String
  evidence        String[] // Photos, screenshots
  status          String   @default("open") // open, investigating, resolved, closed
  resolution      String?
  resolvedBy      String?
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
}
```

**Files:**
- `src/lib/marketplace/disputes.ts`
- `src/app/api/marketplace/disputes/route.ts`
- `src/app/admin/marketplace/disputes/page.tsx`
- `src/components/marketplace/dispute-form.tsx`
- `src/components/admin/dispute-review.tsx`

---

## Phase 6: Community Features

### 6A. Community Marketplace Page

**Goal:** Each community has its own marketplace.

**Files:**
- `src/app/(app)/communities/[id]/marketplace/page.tsx`
- `src/components/communities/marketplace-section.tsx`
- `src/components/communities/featured-listings.tsx`

### 6B. Community Market Day

**Goal:** Virtual market day events.

**Schema Addition:**

```prisma
model MarketDay {
  id          String   @id @default(cuid())
  communityId String
  title       String
  description String?
  date        DateTime
  endDate     DateTime
  theme       String?  // "Back to School", "Holiday Market"
  isVirtual   Boolean  @default(true)
  location    String?
  status      String   @default("upcoming") // upcoming, active, completed
  createdAt   DateTime @default(now())

  listings MarketDayListing[]

  @@index([communityId, date])
}

model MarketDayListing {
  id          String   @id @default(cuid())
  marketDayId String
  listingId   String
  booth       String?  // Virtual booth assignment

  marketDay MarketDay @relation(fields: [marketDayId], references: [id], onDelete: Cascade)

  @@unique([marketDayId, listingId])
}
```

**Files:**
- `src/lib/marketplace/market-days.ts`
- `src/app/(app)/marketplace/events/page.tsx`
- `src/app/(app)/marketplace/events/[id]/page.tsx`
- `src/components/marketplace/market-day-card.tsx`
- `src/components/marketplace/virtual-booth.tsx`

### 6C. Marketplace Analytics

**Goal:** Community marketplace insights.

**Files:**
- `src/lib/marketplace/analytics.ts`
- `src/app/api/marketplace/analytics/route.ts`
- `src/components/communities/marketplace-stats.tsx`

---

## Phase 7: Free/Gift Economy

### 7A. Free Items

**Goal:** Give away items to community.

**Files:**
- `src/app/(app)/marketplace/free/page.tsx`
- `src/components/marketplace/free-listing-card.tsx`
- `src/components/marketplace/claim-button.tsx`

### 7B. Community Wishlist

**Goal:** Request items the community needs.

**Schema Addition:**

```prisma
model CommunityWish {
  id          String   @id @default(cuid())
  communityId String
  requesterId String
  title       String
  description String?
  category    String?
  urgency     String   @default("normal") // low, normal, high
  status      String   @default("open") // open, fulfilled, closed
  fulfilledBy String?
  fulfilledAt DateTime?
  createdAt   DateTime @default(now())

  @@index([communityId, status])
}
```

**Files:**
- `src/lib/marketplace/wishlist.ts`
- `src/app/(app)/marketplace/wishlist/page.tsx`
- `src/components/marketplace/wish-card.tsx`
- `src/components/marketplace/wish-form.tsx`
- `src/components/marketplace/fulfill-wish.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Marketplace Foundation | Large | High |
| 2 | Communication | Medium | High |
| 3 | Transactions | Large | High |
| 4 | Services & Skills | Large | Medium |
| 5 | Trust & Safety | Large | High |
| 6 | Community Features | Medium | Medium |
| 7 | Free/Gift Economy | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add MarketplaceListing, ListingCategory, ListingInquiry, InquiryMessage, ListingOffer, MarketplaceTransaction, ServiceAvailability, ServiceBooking, SkillExchange, SkillMatch, MarketplaceReview, MarketplaceDispute, MarketDay, MarketDayListing, CommunityWish

### New Libraries
- `src/lib/marketplace/listings.ts`
- `src/lib/marketplace/categories.ts`
- `src/lib/marketplace/inquiries.ts`
- `src/lib/marketplace/offers.ts`
- `src/lib/marketplace/transactions.ts`
- `src/lib/marketplace/payments.ts`
- `src/lib/marketplace/donations.ts`
- `src/lib/marketplace/services.ts`
- `src/lib/marketplace/bookings.ts`
- `src/lib/marketplace/skills.ts`
- `src/lib/marketplace/reviews.ts`
- `src/lib/marketplace/verification.ts`
- `src/lib/marketplace/disputes.ts`
- `src/lib/marketplace/market-days.ts`
- `src/lib/marketplace/wishlist.ts`
- `src/lib/marketplace/analytics.ts`

### Pages
- `src/app/(app)/marketplace/page.tsx`
- `src/app/(app)/marketplace/[id]/page.tsx`
- `src/app/(app)/marketplace/create/page.tsx`
- `src/app/(app)/marketplace/messages/page.tsx`
- `src/app/(app)/marketplace/offers/page.tsx`
- `src/app/(app)/marketplace/transactions/page.tsx`
- `src/app/(app)/marketplace/bookings/page.tsx`
- `src/app/(app)/marketplace/skills/page.tsx`
- `src/app/(app)/marketplace/events/page.tsx`
- `src/app/(app)/marketplace/free/page.tsx`
- `src/app/(app)/marketplace/wishlist/page.tsx`
- `src/app/admin/marketplace/disputes/page.tsx`

---

## Categories

| Category | Subcategories |
|----------|---------------|
| **Home & Garden** | Furniture, Appliances, Decor, Tools, Plants |
| **Clothing** | Women, Men, Kids, Shoes, Accessories |
| **Electronics** | Phones, Computers, Audio, Gaming, Parts |
| **Services** | Tutoring, Repairs, Cleaning, Pet Care, Moving |
| **Skills** | Cooking, Music, Language, Tech, Crafts |
| **Baby & Kids** | Toys, Clothes, Gear, Books |
| **Sports** | Equipment, Bikes, Outdoor, Fitness |
| **Free** | Giveaways, Curb Alerts |

---

## Revenue Model

| Revenue Stream | Rate |
|---------------|------|
| Platform fee (optional) | 0-5% |
| Featured listing | $2-10 |
| Community donation | 0-100% seller choice |

**Default:** No platform fee. Revenue through optional featured listings and voluntary community donations.

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test listing creation flow
4. Verify messaging system
5. Test transaction flow
6. Verify review submission
7. Test dispute handling

