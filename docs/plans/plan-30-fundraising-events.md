# Plan 30: Fundraising Events & Ticketing

**Status:** Not Started
**Priority:** Medium
**Epic:** DLG-EVENTS-001 through DLG-EVENTS-008
**Reference:** `docs/user-experience.md`

---

## Philosophy

Events bring communities together for a common purpose. We track collective success, not individual competition. When 100 people come together to raise $10,000, that's a community achievement—not a competition between fundraisers.

### What We Avoid
- **No fundraiser leaderboards** - We don't rank individuals against each other
- **No "top fundraiser" recognition** - All contributions equally valued
- **No competition between teams** - Teams work together, not against each other
- **No individual fundraising pressure** - "Your goal" is optional and private
- **No public amount displays** - Respect privacy of fundraising contributions

### What We Embrace
- **Collective goals** - "Together we're raising $10,000"
- **Event celebration** - Celebrate the community gathering
- **Thank everyone equally** - All fundraisers appreciated
- **Private progress** - Individuals see their own contribution privately
- **Event success** - Focus on whether the event met its collective goal

---

## Overview

Enable communities to host fundraising events with integrated ticketing, donations, and auction management. From galas to 5Ks, provide tools for in-person and virtual events that drive community engagement.

---

## Phase 1: Event Foundation

### 1A. Fundraising Event Schema

**Goal:** Structure for fundraising events.

**Schema Addition:**

```prisma
model FundraisingEvent {
  id              String   @id @default(cuid())
  communityId     String
  projectId       String?  // Optional linked project
  organizerId     String
  title           String
  slug            String   @unique
  description     String
  type            String   // gala, auction, 5k, concert, dinner, festival, virtual
  format          String   @default("in_person") // in_person, virtual, hybrid
  startDate       DateTime
  endDate         DateTime
  timezone        String   @default("America/Los_Angeles")
  venue           String?
  address         String?
  virtualUrl      String?  // For virtual/hybrid events
  imageUrl        String?
  coverImageUrl   String?
  goalAmount      Float?
  raisedAmount    Float    @default(0)
  ticketingEnabled Boolean @default(true)
  donationsEnabled Boolean @default(true)
  registrationRequired Boolean @default(true)
  capacity        Int?
  attendeeCount   Int      @default(0)
  status          String   @default("draft") // draft, published, live, completed, cancelled
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  community    Community         @relation(fields: [communityId], references: [id], onDelete: Cascade)
  project      Project?          @relation(fields: [projectId], references: [id])
  tickets      EventTicketType[]
  registrations EventRegistration[]
  donations    EventDonation[]
  auctions     AuctionItem[]
  sponsors     EventSponsor[]
  volunteers   EventVolunteer[]
  updates      EventUpdate[]
  participants EventParticipant[]

  @@index([communityId, status])
  @@index([startDate])
  @@index([type, status])
}
```

**Files:**
- `src/lib/events/index.ts` - Event CRUD
- `src/app/api/events/route.ts` - List/create
- `src/app/api/events/[slug]/route.ts` - Get/update

### 1B. Event Discovery

**Goal:** Find and browse events.

**Files:**
- `src/app/(app)/events/page.tsx` - Browse events
- `src/app/(app)/events/[slug]/page.tsx` - Event detail
- `src/components/events/event-card.tsx`
- `src/components/events/event-grid.tsx`
- `src/components/events/event-hero.tsx`
- `src/components/events/event-filters.tsx`
- `src/components/events/countdown-timer.tsx`

### 1C. Event Creation

**Goal:** Create and manage events.

**Files:**
- `src/app/(app)/events/create/page.tsx`
- `src/app/(app)/events/[slug]/manage/page.tsx`
- `src/components/events/event-form.tsx`
- `src/components/events/venue-picker.tsx`
- `src/components/events/date-time-picker.tsx`
- `src/components/events/goal-setting.tsx`

---

## Phase 2: Ticketing

### 2A. Ticket Types

**Goal:** Multiple ticket tiers.

**Schema Addition:**

```prisma
model EventTicketType {
  id              String   @id @default(cuid())
  eventId         String
  name            String   // "General Admission", "VIP", "Table of 10"
  description     String?
  price           Float
  quantity        Int?     // null for unlimited
  sold            Int      @default(0)
  reserved        Int      @default(0)
  maxPerOrder     Int      @default(10)
  salesStart      DateTime?
  salesEnd        DateTime?
  isVisible       Boolean  @default(true)
  includedItems   String[] // "Dinner", "Raffle ticket"
  order           Int      @default(0)
  createdAt       DateTime @default(now())

  event   FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tickets EventTicket[]

  @@index([eventId])
}

model EventTicket {
  id              String   @id @default(cuid())
  ticketTypeId    String
  registrationId  String
  ticketNumber    String   @unique
  qrCode          String?
  attendeeName    String?
  attendeeEmail   String?
  status          String   @default("valid") // valid, used, cancelled, refunded
  checkedInAt     DateTime?
  createdAt       DateTime @default(now())

  ticketType   EventTicketType   @relation(fields: [ticketTypeId], references: [id], onDelete: Cascade)
  registration EventRegistration @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  @@index([registrationId])
}
```

**Files:**
- `src/lib/events/tickets.ts` - Ticket management
- `src/app/api/events/[slug]/tickets/route.ts`
- `src/components/events/ticket-selector.tsx`
- `src/components/events/ticket-type-card.tsx`
- `src/components/events/ticket-form.tsx`

### 2B. Registration & Checkout

**Goal:** Register and purchase tickets.

**Schema Addition:**

```prisma
model EventRegistration {
  id              String   @id @default(cuid())
  eventId         String
  userId          String?  // null for guest
  email           String
  firstName       String
  lastName        String
  phone           String?
  totalAmount     Float
  donationAmount  Float    @default(0)
  paymentStatus   String   @default("pending") // pending, completed, failed, refunded
  paymentRef      String?
  registrationCode String  @unique
  status          String   @default("confirmed") // confirmed, cancelled
  createdAt       DateTime @default(now())

  event   FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tickets EventTicket[]

  @@index([eventId, status])
  @@index([userId])
  @@index([email])
}
```

**Files:**
- `src/lib/events/registrations.ts`
- `src/app/api/events/[slug]/register/route.ts`
- `src/app/(app)/events/[slug]/register/page.tsx`
- `src/components/events/checkout-form.tsx`
- `src/components/events/registration-summary.tsx`
- `src/components/events/add-donation.tsx`

### 2C. Ticket Confirmation

**Goal:** Confirmation and ticket delivery.

**Files:**
- `src/app/(app)/events/[slug]/confirmation/page.tsx`
- `src/components/events/ticket-confirmation.tsx`
- `src/components/events/digital-ticket.tsx`
- `src/lib/events/qr-generator.ts`
- Email confirmation with tickets

---

## Phase 3: Donations

### 3A. Event Donations

**Goal:** Accept donations alongside tickets.

**Schema Addition:**

```prisma
model EventDonation {
  id              String   @id @default(cuid())
  eventId         String
  userId          String?
  donorName       String?
  donorEmail      String?
  amount          Float
  isAnonymous     Boolean  @default(false)
  honoree         String?  // "In honor of..."
  message         String?
  paymentStatus   String   @default("pending")
  paymentRef      String?
  createdAt       DateTime @default(now())

  event FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, createdAt])
}
```

**Files:**
- `src/lib/events/donations.ts`
- `src/app/api/events/[slug]/donate/route.ts`
- `src/components/events/donation-form.tsx`
- `src/components/events/donation-levels.tsx`
- `src/components/events/honor-memorial.tsx`

### 3B. Collective Progress Display

**Goal:** Show progress toward collective goal without individual rankings.

**Files:**
- `src/components/events/collective-progress.tsx` - "Together we've raised $X"
- `src/components/events/goal-thermometer.tsx`
- `src/components/events/donor-count.tsx` - "X supporters" (not names or amounts)
- `src/components/events/live-total.tsx` - Real-time updates

**Note:** Show aggregate totals only. Never display individual donation amounts publicly.

### 3C. Matching Donations

**Goal:** Donation matching for events.

**Schema Addition:**

```prisma
model EventMatch {
  id              String   @id @default(cuid())
  eventId         String
  matcherName     String
  maxAmount       Float
  matchedAmount   Float    @default(0)
  ratio           Float    @default(1) // 1:1, 2:1, etc.
  message         String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@index([eventId, isActive])
}
```

**Files:**
- `src/lib/events/matching.ts`
- `src/app/api/events/[slug]/match/route.ts`
- `src/components/events/matching-banner.tsx`
- `src/components/events/match-multiplier.tsx`

---

## Phase 4: Auctions

### 4A. Auction Items

**Goal:** Silent and live auction support.

**Schema Addition:**

```prisma
model AuctionItem {
  id              String   @id @default(cuid())
  eventId         String
  title           String
  description     String
  images          String[]
  category        String?
  startingBid     Float
  bidIncrement    Float    @default(5)
  currentBid      Float?
  reservePrice    Float?
  buyNowPrice     Float?
  donorName       String?
  estimatedValue  Float?
  biddingStart    DateTime
  biddingEnd      DateTime
  status          String   @default("pending") // pending, active, sold, unsold
  winnerId        String?
  order           Int      @default(0)
  createdAt       DateTime @default(now())

  event FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  bids  AuctionBid[]

  @@index([eventId, status])
}

model AuctionBid {
  id          String   @id @default(cuid())
  itemId      String
  bidderId    String
  amount      Float
  isWinning   Boolean  @default(false)
  createdAt   DateTime @default(now())

  item   AuctionItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  bidder User        @relation(fields: [bidderId], references: [id])

  @@index([itemId, amount])
  @@index([bidderId])
}
```

**Files:**
- `src/lib/events/auctions.ts`
- `src/app/api/events/[slug]/auction/route.ts`
- `src/app/api/events/[slug]/auction/[itemId]/bid/route.ts`
- `src/app/(app)/events/[slug]/auction/page.tsx`
- `src/components/events/auction-item-card.tsx`
- `src/components/events/auction-grid.tsx`
- `src/components/events/bid-form.tsx`
- `src/components/events/outbid-notification.tsx`

### 4B. Auction Management

**Goal:** Manage auction items.

**Files:**
- `src/app/(app)/events/[slug]/manage/auction/page.tsx`
- `src/components/events/auction-item-form.tsx`
- `src/components/events/auction-dashboard.tsx`
- `src/components/events/close-auction.tsx`

---

## Phase 5: Community Participation (Not Competition)

### 5A. Event Participants

**Goal:** People help spread the word without competition.

**Schema Addition:**

```prisma
model EventParticipant {
  id              String   @id @default(cuid())
  eventId         String
  userId          String
  personalMessage String?  // Why this event matters to them
  shareCount      Int      @default(0) // For their own info, not public
  createdAt       DateTime @default(now())

  event FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([eventId])
}
```

**Key difference from original "peer-to-peer" design:**
- No individual fundraising goals displayed
- No leaderboards of fundraisers
- No "top fundraiser" recognition
- Participants share because they care, not to compete

**Files:**
- `src/lib/events/participants.ts`
- `src/app/(app)/events/[slug]/participate/page.tsx`
- `src/components/events/participant-form.tsx`
- `src/components/events/share-tools.tsx`

### 5B. Sharing Tools

**Goal:** Easy social sharing without tracking individual fundraising.

**Files:**
- `src/lib/events/sharing.ts`
- `src/components/events/share-buttons.tsx`
- `src/components/events/email-invite.tsx`
- `src/components/events/copy-link.tsx`
- Dynamic OG images for events

**Note:** Sharing links to the event, not to individual fundraising pages with amounts.

### 5C. Community Groups

**Goal:** Groups participate together without competition.

**Schema Addition:**

```prisma
model EventGroup {
  id              String   @id @default(cuid())
  eventId         String
  name            String   // "The Smith Family", "Boise Rotary"
  description     String?
  imageUrl        String?
  createdAt       DateTime @default(now())

  event   FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  members EventGroupMember[]

  @@unique([eventId, name])
  @@index([eventId])
}

model EventGroupMember {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  joinedAt  DateTime @default(now())

  group EventGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
}
```

**Note:** Groups exist for coordination, not competition. No "team leaderboard."

**Files:**
- `src/app/(app)/events/[slug]/groups/page.tsx` - View groups
- `src/components/events/group-card.tsx`
- `src/components/events/join-group.tsx`

---

## Phase 6: Event Day

### 6A. Check-In

**Goal:** Attendee check-in.

**Files:**
- `src/app/(app)/events/[slug]/check-in/page.tsx`
- `src/components/events/qr-scanner.tsx`
- `src/components/events/manual-check-in.tsx`
- `src/components/events/check-in-stats.tsx`
- `src/app/api/events/[slug]/check-in/route.ts`

### 6B. Live Dashboard

**Goal:** Real-time event tracking.

**Files:**
- `src/app/(app)/events/[slug]/live/page.tsx`
- `src/components/events/live-dashboard.tsx`
- `src/components/events/live-total.tsx` - Collective total only
- `src/components/events/live-auction.tsx`
- `src/components/events/announcement-bar.tsx`
- WebSocket or polling for real-time updates

### 6C. Virtual Event Tools

**Goal:** Virtual event experience.

**Files:**
- `src/app/(app)/events/[slug]/virtual/page.tsx`
- `src/components/events/virtual-lobby.tsx`
- `src/components/events/stream-embed.tsx`
- `src/components/events/virtual-auction.tsx`
- `src/components/events/chat-sidebar.tsx`

---

## Phase 7: Post-Event

### 7A. Thank You & Receipts

**Goal:** Post-event follow-up.

**Files:**
- `src/lib/events/thank-you.ts`
- `src/components/events/thank-you-page.tsx`
- `src/lib/events/receipts.ts` - Tax receipts
- Email templates for thank you + receipts

### 7B. Event Summary

**Goal:** Share collective event results.

**What we show:**
- "Together we raised $X" (collective total)
- "X supporters joined us"
- "X auction items sold"
- Photos from the event

**What we DON'T show:**
- Individual fundraiser rankings
- "Top donors" list
- Amount raised per person

**Files:**
- `src/app/(app)/events/[slug]/results/page.tsx`
- `src/components/events/results-summary.tsx`
- `src/components/events/collective-impact.tsx`
- `src/components/events/photo-gallery.tsx`

### 7C. Volunteer Management

**Goal:** Track event volunteers.

**Schema Addition:**

```prisma
model EventVolunteer {
  id          String   @id @default(cuid())
  eventId     String
  userId      String
  role        String?  // greeter, check-in, auction, setup
  shift       String?
  status      String   @default("confirmed") // applied, confirmed, declined
  notes       String?
  createdAt   DateTime @default(now())

  event FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
}
```

**Files:**
- `src/lib/events/volunteers.ts`
- `src/app/api/events/[slug]/volunteers/route.ts`
- `src/components/events/volunteer-signup.tsx`
- `src/components/events/volunteer-roster.tsx`

---

## Phase 8: Event Sponsorships

### 8A. Sponsor Tiers

**Goal:** Corporate event sponsorships.

**Schema Addition:**

```prisma
model EventSponsor {
  id              String   @id @default(cuid())
  eventId         String
  organizationName String
  contactName     String?
  contactEmail    String?
  tier            String   // presenting, gold, silver, bronze, friend
  amount          Float
  logoUrl         String?
  websiteUrl      String?
  benefits        String[] // "Logo on materials", "Table for 10"
  status          String   @default("confirmed") // pending, confirmed, cancelled
  createdAt       DateTime @default(now())

  event FundraisingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, tier])
}
```

**Files:**
- `src/lib/events/sponsors.ts`
- `src/app/api/events/[slug]/sponsors/route.ts`
- `src/components/events/sponsor-form.tsx`
- `src/components/events/sponsor-logos.tsx`
- `src/components/events/sponsor-tiers.tsx`
- `src/app/(app)/events/[slug]/sponsor/page.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Event Foundation | Large | High |
| 2 | Ticketing | Large | High |
| 3 | Donations | Medium | High |
| 4 | Auctions | Large | Medium |
| 5 | Community Participation | Medium | Medium |
| 6 | Event Day | Medium | High |
| 7 | Post-Event | Medium | Medium |
| 8 | Sponsorships | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add FundraisingEvent, EventTicketType, EventTicket, EventRegistration, EventDonation, EventMatch, AuctionItem, AuctionBid, EventParticipant, EventGroup, EventGroupMember, EventVolunteer, EventSponsor

### New Libraries
- `src/lib/events/index.ts`
- `src/lib/events/tickets.ts`
- `src/lib/events/registrations.ts`
- `src/lib/events/qr-generator.ts`
- `src/lib/events/donations.ts`
- `src/lib/events/matching.ts`
- `src/lib/events/auctions.ts`
- `src/lib/events/participants.ts`
- `src/lib/events/sharing.ts`
- `src/lib/events/thank-you.ts`
- `src/lib/events/receipts.ts`
- `src/lib/events/volunteers.ts`
- `src/lib/events/sponsors.ts`

### Pages
- `src/app/(app)/events/page.tsx`
- `src/app/(app)/events/[slug]/page.tsx`
- `src/app/(app)/events/create/page.tsx`
- `src/app/(app)/events/[slug]/register/page.tsx`
- `src/app/(app)/events/[slug]/confirmation/page.tsx`
- `src/app/(app)/events/[slug]/auction/page.tsx`
- `src/app/(app)/events/[slug]/participate/page.tsx`
- `src/app/(app)/events/[slug]/groups/page.tsx`
- `src/app/(app)/events/[slug]/check-in/page.tsx`
- `src/app/(app)/events/[slug]/live/page.tsx`
- `src/app/(app)/events/[slug]/virtual/page.tsx`
- `src/app/(app)/events/[slug]/results/page.tsx`
- `src/app/(app)/events/[slug]/sponsor/page.tsx`
- `src/app/(app)/events/[slug]/manage/page.tsx`

---

## What We Removed

### Removed from Original Plan
- ❌ FundraisingTeam with competition
- ❌ FundraiserPage with individual goal amounts
- ❌ Team leaderboard (`team-leaderboard.tsx`)
- ❌ Individual fundraiser rankings
- ❌ "Top fundraiser" recognition
- ❌ Public display of individual amounts raised
- ❌ Individual fundraising goals
- ❌ Competition between teams

### Replaced With
- ✅ EventParticipant (share without competing)
- ✅ EventGroup (coordinate, don't compete)
- ✅ Collective progress display
- ✅ Aggregate totals only
- ✅ Private contribution tracking

---

## Event Types

| Type | Features |
|------|----------|
| **Gala/Dinner** | Tables, auction, live entertainment |
| **5K/Walk** | Group registration, timing |
| **Auction (Silent)** | Item bidding, mobile bidding |
| **Concert/Show** | Assigned seating, VIP packages |
| **Festival** | Multi-day, vendor booths, activities |
| **Virtual** | Streaming, chat, virtual auction |
| **Hybrid** | In-person + virtual attendance |

---

## Revenue Model

| Fee Type | Rate |
|----------|------|
| Ticket processing | 2.9% + $0.30 |
| Donation processing | 2.9% + $0.30 |
| Platform fee | 0% (optional 5% for premium features) |

**Note:** Pass processing fees to attendees or absorb in ticket price.

---

## Language Guide

**Do say:**
- "Together we've raised $X"
- "X supporters have joined us"
- "Help spread the word"
- "Join our community group"

**Don't say:**
- "Top fundraisers this week"
- "You've raised $X (rank #5)"
- "Only $100 more to beat Team Blue"
- "Leaderboard standings"

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test event creation flow
4. Verify no individual rankings appear
5. Confirm only collective totals displayed
6. Test donation flow
7. Verify auction bidding
8. Test check-in process

