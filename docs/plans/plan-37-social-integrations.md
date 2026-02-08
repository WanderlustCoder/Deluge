# Plan 37: Social Media Integration

## Overview

Deep integration with social platforms for sharing, authentication, importing connections, and amplifying impact. Enable users to leverage their social networks for fundraising while maintaining privacy controls.

**Core Principle:** Meet users where they are while respecting privacy.

---

## Phase 1: Social Authentication

### 1A. OAuth Providers

**Goal:** Social login options.

**Schema Addition:**

```prisma
model SocialAccount {
  id              String   @id @default(cuid())
  userId          String
  provider        String   // google, facebook, twitter, linkedin, apple
  providerId      String   // Provider's user ID
  email           String?
  name            String?
  profileUrl      String?
  avatarUrl       String?
  accessToken     String?  // Encrypted
  refreshToken    String?  // Encrypted
  tokenExpiry     DateTime?
  scope           String[]
  isConnected     Boolean  @default(true)
  lastSyncAt      DateTime?
  connectedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@index([userId])
}
```

**Files:**
- `src/lib/social/auth/index.ts` - OAuth logic
- `src/lib/social/auth/google.ts`
- `src/lib/social/auth/facebook.ts`
- `src/lib/social/auth/twitter.ts`
- `src/lib/social/auth/linkedin.ts`
- `src/lib/social/auth/apple.ts`
- `src/app/api/auth/[...nextauth]/route.ts` - Update NextAuth

### 1B. Account Linking

**Goal:** Link social accounts to existing users.

**Files:**
- `src/lib/social/linking.ts`
- `src/app/(app)/account/connections/page.tsx`
- `src/components/social/connect-button.tsx`
- `src/components/social/connected-accounts.tsx`
- `src/components/social/disconnect-modal.tsx`

### 1C. Profile Import

**Goal:** Import profile data from social.

**Files:**
- `src/lib/social/profile-import.ts`
- `src/components/social/import-profile.tsx`
- `src/components/social/avatar-sync.tsx`
- Optional profile data import during registration

---

## Phase 2: Social Sharing

### 2A. Share Framework

**Goal:** Optimized sharing to each platform.

**Schema Addition:**

```prisma
model SocialShare {
  id              String   @id @default(cuid())
  userId          String?
  entityType      String   // project, campaign, community, story
  entityId        String
  platform        String   // twitter, facebook, linkedin, whatsapp, email
  shareType       String   // link, card, story
  shareUrl        String?
  postId          String?  // Platform's post ID if available
  impressions     Int?
  clicks          Int?
  conversions     Int?
  metadata        Json?
  createdAt       DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId, platform])
  @@index([createdAt])
}
```

**Files:**
- `src/lib/social/sharing/index.ts`
- `src/lib/social/sharing/twitter.ts`
- `src/lib/social/sharing/facebook.ts`
- `src/lib/social/sharing/linkedin.ts`
- `src/lib/social/sharing/whatsapp.ts`
- `src/app/api/social/share/route.ts`

### 2B. Share Components

**Goal:** Easy sharing UI.

**Files:**
- `src/components/social/share-buttons.tsx`
- `src/components/social/share-modal.tsx`
- `src/components/social/platform-icon.tsx`
- `src/components/social/copy-link.tsx`
- `src/components/social/qr-code.tsx`

### 2C. Dynamic OG Images

**Goal:** Platform-optimized preview images.

**Files:**
- `src/lib/social/og-images/index.ts`
- `src/lib/social/og-images/project.tsx`
- `src/lib/social/og-images/campaign.tsx`
- `src/lib/social/og-images/community.tsx`
- `src/app/api/og/[type]/[id]/route.tsx`
- Vercel OG or similar for generation

---

## Phase 3: Social Posting

### 3A. Auto-Post System

**Goal:** Automated social posts.

**Schema Addition:**

```prisma
model SocialPost {
  id              String   @id @default(cuid())
  userId          String
  accountId       String   // SocialAccount ID
  platform        String
  content         String
  mediaUrls       String[]
  linkUrl         String?
  scheduledFor    DateTime?
  postedAt        DateTime?
  postId          String?  // Platform's post ID
  status          String   @default("draft") // draft, scheduled, posted, failed
  errorMessage    String?
  metrics         Json?    // likes, shares, comments
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, status])
  @@index([scheduledFor, status])
}
```

**Files:**
- `src/lib/social/posting/index.ts`
- `src/lib/social/posting/twitter.ts`
- `src/lib/social/posting/facebook.ts`
- `src/lib/social/posting/linkedin.ts`
- `src/app/api/social/post/route.ts`

### 3B. Post Composer

**Goal:** Create and schedule posts.

**Files:**
- `src/components/social/post-composer.tsx`
- `src/components/social/platform-preview.tsx`
- `src/components/social/schedule-picker.tsx`
- `src/components/social/media-attach.tsx`
- `src/components/social/character-count.tsx`

### 3C. Milestone Auto-Posts

**Goal:** Auto-share on achievements.

**Files:**
- `src/lib/social/auto-post/index.ts`
- `src/lib/social/auto-post/triggers.ts`
- `src/components/social/auto-post-settings.tsx`
- Configurable triggers for automatic sharing

---

## Phase 4: Friend Finding

### 4A. Contact Import

**Goal:** Find friends on Deluge.

**Schema Addition:**

```prisma
model ImportedContact {
  id              String   @id @default(cuid())
  userId          String
  source          String   // google, facebook, phone
  email           String?
  phone           String?
  name            String?
  matchedUserId   String?  // If found on Deluge
  invitedAt       DateTime?
  status          String   @default("pending") // pending, matched, invited, joined
  importedAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, source, email])
  @@index([userId, status])
  @@index([matchedUserId])
}
```

**Files:**
- `src/lib/social/contacts/index.ts`
- `src/lib/social/contacts/google.ts`
- `src/lib/social/contacts/facebook.ts`
- `src/lib/social/contacts/phone.ts`
- `src/app/api/social/contacts/import/route.ts`

### 4B. Friend Suggestions

**Goal:** Suggest connections.

**Files:**
- `src/lib/social/suggestions.ts`
- `src/app/(app)/find-friends/page.tsx`
- `src/components/social/friend-finder.tsx`
- `src/components/social/suggestion-card.tsx`
- `src/components/social/invite-friends.tsx`

### 4C. Privacy Controls

**Goal:** Control social discoverability.

**Files:**
- `src/lib/social/privacy.ts`
- `src/components/social/privacy-settings.tsx`
- `src/components/social/block-list.tsx`
- Opt-in for friend finding

---

## Phase 5: Social Fundraising

### 5A. Fundraising Challenges

**Goal:** Social media fundraising campaigns.

**Schema Addition:**

```prisma
model SocialChallenge {
  id              String   @id @default(cuid())
  creatorId       String
  projectId       String?
  name            String
  hashtag         String   @unique
  description     String
  instructions    String
  mediaExample    String?
  goalType        String   // participants, raised, shares
  goalValue       Float
  currentValue    Float    @default(0)
  startDate       DateTime
  endDate         DateTime
  status          String   @default("active")
  participantCount Int     @default(0)
  createdAt       DateTime @default(now())

  participants SocialChallengeParticipant[]

  @@index([hashtag])
  @@index([status, endDate])
}

model SocialChallengeParticipant {
  id              String   @id @default(cuid())
  challengeId     String
  userId          String
  postUrl         String?
  platform        String?
  amountRaised    Float    @default(0)
  joinedAt        DateTime @default(now())

  challenge SocialChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@unique([challengeId, userId])
}
```

**Files:**
- `src/lib/social/challenges/index.ts`
- `src/app/(app)/challenges/social/page.tsx`
- `src/app/(app)/challenges/social/[hashtag]/page.tsx`
- `src/components/social/challenge-card.tsx`
- `src/components/social/challenge-leaderboard.tsx`

### 5B. Facebook Fundraisers

**Goal:** Integrate with Facebook Fundraisers.

**Files:**
- `src/lib/social/facebook-fundraisers.ts`
- `src/app/api/social/facebook/fundraiser/route.ts`
- `src/components/social/facebook-fundraiser.tsx`
- Link Facebook fundraisers to Deluge projects

### 5C. Peer-to-Peer Social

**Goal:** P2P fundraising via social.

**Files:**
- `src/lib/social/p2p.ts`
- `src/components/social/p2p-share.tsx`
- `src/components/social/referral-link.tsx`
- Track donations from social shares

---

## Phase 6: Social Proof

### 6A. Activity Stream

**Goal:** Social activity feed.

**Files:**
- `src/lib/social/activity-stream.ts`
- `src/components/social/activity-feed.tsx`
- `src/components/social/activity-item.tsx`
- Public activity (with privacy controls)

### 6B. Social Badges

**Goal:** Share-worthy badges.

**Files:**
- `src/lib/social/badges.ts`
- `src/components/social/shareable-badge.tsx`
- `src/components/social/badge-share-modal.tsx`
- `src/app/api/og/badge/[id]/route.tsx`

### 6C. Impact Cards

**Goal:** Shareable impact summaries.

**Files:**
- `src/lib/social/impact-cards.ts`
- `src/app/(app)/impact/share/page.tsx`
- `src/components/social/impact-card.tsx`
- `src/components/social/year-in-review.tsx`
- Annual/monthly shareable impact summaries

---

## Phase 7: Social Analytics

### 7A. Share Tracking

**Goal:** Track social performance.

**Files:**
- `src/lib/social/analytics/tracking.ts`
- `src/lib/social/analytics/attribution.ts`
- `src/app/api/social/analytics/route.ts`
- UTM parameter handling

### 7B. Social Dashboard

**Goal:** Social performance metrics.

**Files:**
- `src/app/(app)/analytics/social/page.tsx`
- `src/components/social/analytics-overview.tsx`
- `src/components/social/platform-breakdown.tsx`
- `src/components/social/viral-coefficient.tsx`

### 7C. Influencer Tracking

**Goal:** Identify top sharers.

**Files:**
- `src/lib/social/influencers.ts`
- `src/app/admin/social/influencers/page.tsx`
- `src/components/admin/top-sharers.tsx`
- `src/components/admin/viral-content.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Social Authentication | Medium | High |
| 2 | Social Sharing | Medium | High |
| 3 | Social Posting | Large | Medium |
| 4 | Friend Finding | Medium | Medium |
| 5 | Social Fundraising | Large | Medium |
| 6 | Social Proof | Medium | Medium |
| 7 | Social Analytics | Medium | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add SocialAccount, SocialShare, SocialPost, ImportedContact, SocialChallenge, SocialChallengeParticipant

### New Libraries
- `src/lib/social/auth/*.ts`
- `src/lib/social/sharing/*.ts`
- `src/lib/social/og-images/*.ts`
- `src/lib/social/posting/*.ts`
- `src/lib/social/contacts/*.ts`
- `src/lib/social/challenges/*.ts`
- `src/lib/social/analytics/*.ts`

### Pages
- `src/app/(app)/account/connections/page.tsx`
- `src/app/(app)/find-friends/page.tsx`
- `src/app/(app)/challenges/social/page.tsx`
- `src/app/(app)/analytics/social/page.tsx`
- `src/app/(app)/impact/share/page.tsx`
- `src/app/admin/social/influencers/page.tsx`

---

## Supported Platforms

| Platform | Auth | Share | Post | Contacts |
|----------|------|-------|------|----------|
| Google | Yes | - | - | Yes |
| Facebook | Yes | Yes | Yes | Yes |
| Twitter/X | Yes | Yes | Yes | - |
| LinkedIn | Yes | Yes | Yes | Yes |
| Apple | Yes | - | - | - |
| WhatsApp | - | Yes | - | - |
| Instagram | - | Stories | - | - |

---

## Privacy Considerations

- Explicit consent for contact import
- Granular visibility settings
- Easy disconnect for linked accounts
- No posting without user action
- Clear data retention policies
- GDPR-compliant data handling

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test OAuth flows for each provider
4. Verify share tracking
5. Test auto-post functionality
6. Verify contact import privacy
7. Test social analytics accuracy

