# Plan 14: Giving Circles

## Overview

Enable groups of friends, colleagues, or neighbors to pool resources and make collective giving decisions. Giving circles bring the community aspect of Deluge to smaller, more intimate groups.

---

## Phase 1: Circle Foundation

### 1A. Giving Circle Schema

**Goal:** Create the core data model for giving circles.

**Schema Addition:**

```prisma
model GivingCircle {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  imageUrl        String?
  isPrivate       Boolean  @default(false)
  memberLimit     Int?     // null = unlimited
  minContribution Float?   // Monthly minimum (optional)
  pooledBalance   Float    @default(0)
  totalContributed Float   @default(0)
  totalDeployed   Float    @default(0)
  votingThreshold Float    @default(0.5) // % needed to approve
  votingPeriod    Int      @default(7) // days
  focusCategories String[] // Preferred project categories
  focusCommunities String[] // Preferred community IDs
  status          String   @default("active") // active, paused, archived
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members      CircleMember[]
  contributions CircleContribution[]
  proposals    CircleProposal[]
  activity     CircleActivity[]

  @@index([status])
}

model CircleMember {
  id            String   @id @default(cuid())
  circleId      String
  userId        String
  role          String   @default("member") // founder, admin, member
  totalContributed Float  @default(0)
  joinedAt      DateTime @default(now())
  status        String   @default("active") // active, inactive, left

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)
  user   User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([circleId, userId])
  @@index([userId])
}

model CircleContribution {
  id        String   @id @default(cuid())
  circleId  String
  userId    String
  amount    Float
  note      String?
  createdAt DateTime @default(now())

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@index([circleId, createdAt])
  @@index([userId])
}
```

**Files:**
- `src/lib/circles.ts` - Circle management logic
- `src/app/api/circles/route.ts` - List/create circles
- `src/app/api/circles/[slug]/route.ts` - Get/update circle

### 1B. Circle Creation & Discovery

**Goal:** Users can create and find giving circles.

**Files:**
- `src/app/(app)/circles/page.tsx` - Browse circles
- `src/app/(app)/circles/new/page.tsx` - Create circle
- `src/app/(app)/circles/[slug]/page.tsx` - Circle detail
- `src/components/circles/circle-card.tsx`
- `src/components/circles/create-circle-form.tsx`
- `src/components/circles/circle-header.tsx`

---

## Phase 2: Membership & Contributions

### 2A. Join Flow

**Goal:** Users can join circles (open or by invite).

**Schema Addition:**

```prisma
model CircleInvite {
  id        String   @id @default(cuid())
  circleId  String
  email     String?
  token     String   @unique
  invitedBy String
  expiresAt DateTime
  usedAt    DateTime?
  usedBy    String?
  createdAt DateTime @default(now())

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@index([circleId])
  @@index([token])
}
```

**Files:**
- `src/lib/circle-invites.ts` - Invite logic
- `src/app/api/circles/[slug]/join/route.ts` - Join circle
- `src/app/api/circles/[slug]/invite/route.ts` - Send invites
- `src/app/api/circles/join/[token]/route.ts` - Accept invite
- `src/components/circles/join-button.tsx`
- `src/components/circles/invite-members-modal.tsx`

### 2B. Pool Contributions

**Goal:** Members contribute to the circle's shared pool.

**Files:**
- `src/app/api/circles/[slug]/contribute/route.ts`
- `src/components/circles/contribute-modal.tsx`
- `src/components/circles/pool-balance.tsx`
- `src/components/circles/contribution-history.tsx`
- `src/components/circles/member-contributions.tsx`

---

## Phase 3: Collective Decision Making

### 3A. Funding Proposals

**Goal:** Members propose projects to fund, circle votes.

**Schema Addition:**

```prisma
model CircleProposal {
  id          String   @id @default(cuid())
  circleId    String
  proposerId  String
  projectId   String?  // For project funding
  loanId      String?  // For loan funding
  type        String   // project, loan, custom
  title       String
  description String?
  amount      Float
  votingEnds  DateTime
  status      String   @default("voting") // voting, approved, rejected, funded
  yesVotes    Int      @default(0)
  noVotes     Int      @default(0)
  abstainVotes Int     @default(0)
  fundedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  circle GivingCircle     @relation(fields: [circleId], references: [id], onDelete: Cascade)
  votes  CircleVote[]

  @@index([circleId, status])
  @@index([votingEnds])
}

model CircleVote {
  id         String   @id @default(cuid())
  proposalId String
  userId     String
  vote       String   // yes, no, abstain
  comment    String?
  createdAt  DateTime @default(now())

  proposal CircleProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  @@unique([proposalId, userId])
}
```

**Files:**
- `src/lib/circle-proposals.ts` - Proposal logic
- `src/app/api/circles/[slug]/proposals/route.ts`
- `src/app/api/circles/[slug]/proposals/[id]/route.ts`
- `src/app/api/circles/[slug]/proposals/[id]/vote/route.ts`
- `src/components/circles/proposal-card.tsx`
- `src/components/circles/create-proposal-modal.tsx`
- `src/components/circles/vote-buttons.tsx`
- `src/components/circles/voting-progress.tsx`

### 3B. Auto-Execute Approved Proposals

**Goal:** When voting ends with approval, execute the funding.

**Files:**
- `src/lib/circle-execution.ts` - Execute approved proposals
- `src/lib/circle-processor.ts` - Cron job for proposal resolution
- Integration with fund/loan routes

---

## Phase 4: Circle Activity & Communication

### 4A. Activity Feed

**Goal:** Show circle activity to members.

**Schema Addition:**

```prisma
model CircleActivity {
  id        String   @id @default(cuid())
  circleId  String
  type      String   // contribution, proposal_created, vote_cast, proposal_funded, member_joined
  actorId   String?
  data      Json
  createdAt DateTime @default(now())

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@index([circleId, createdAt])
}
```

**Files:**
- `src/lib/circle-activity.ts` - Activity tracking
- `src/components/circles/activity-feed.tsx`
- `src/components/circles/activity-item.tsx`

### 4B. Circle Discussion

**Goal:** Members can discuss in the circle.

**Schema Addition:**

```prisma
model CircleDiscussion {
  id        String   @id @default(cuid())
  circleId  String
  userId    String
  content   String
  parentId  String?  // For threading
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@index([circleId, createdAt])
  @@index([parentId])
}
```

**Files:**
- `src/app/api/circles/[slug]/discussions/route.ts`
- `src/components/circles/discussion-thread.tsx`
- `src/components/circles/discussion-composer.tsx`

---

## Phase 5: Circle Impact

### 5A. Impact Dashboard

**Goal:** Track and display circle's collective impact.

**Files:**
- `src/lib/circle-impact.ts` - Calculate impact metrics
- `src/app/api/circles/[slug]/impact/route.ts`
- `src/components/circles/impact-stats.tsx`
- `src/components/circles/funded-projects-list.tsx`

### 5B. Circle Badges

**Goal:** Recognize circle achievements.

**Badges:**
- First Circle: Join or create a circle
- Circle Contributor: Contribute to a circle
- Circle Voter: Vote on 10 proposals
- Circle Champion: Propose a successful funding
- Circle Veteran: 1 year in a circle

**Files:**
- Update `src/lib/badges.ts` - Add circle badges

### 5C. Circle Leaderboards

**Goal:** Community-level circle rankings.

**Metrics:**
- Total deployed by circles
- Most active circles
- Circles per community

**Files:**
- `src/app/api/circles/leaderboard/route.ts`
- `src/components/circles/circle-leaderboard.tsx`

---

## Phase 6: Advanced Features

### 6A. Recurring Circle Contributions

**Goal:** Set up automatic monthly contributions to circles.

**Schema Addition:**

```prisma
model CircleRecurring {
  id            String   @id @default(cuid())
  circleId      String
  userId        String
  amount        Float
  frequency     String   @default("monthly")
  nextChargeDate DateTime
  status        String   @default("active")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  circle GivingCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@unique([circleId, userId])
  @@index([nextChargeDate, status])
}
```

**Files:**
- `src/app/api/circles/[slug]/recurring/route.ts`
- `src/components/circles/recurring-contribution-modal.tsx`
- Integration with recurring processor

### 6B. Circle Matching

**Goal:** Circles can receive matching from sponsors.

**Files:**
- `src/lib/circle-matching.ts`
- Update matching campaign to support circles
- `src/components/circles/matching-indicator.tsx`

### 6C. Circle Templates

**Goal:** Pre-configured circle types for quick setup.

**Templates:**
- Neighborhood Circle - Focus on local community
- Book Club Giving - Monthly book club meets to give
- Office Giving Circle - Colleagues pool giving
- Alumni Circle - School/university alumni giving

**Files:**
- `src/lib/circle-templates.ts`
- `src/components/circles/template-selector.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Circle Foundation | Large | High |
| 2 | Membership & Contributions | Medium | High |
| 3 | Collective Decision Making | Large | High |
| 4 | Activity & Communication | Medium | Medium |
| 5 | Circle Impact | Medium | Medium |
| 6 | Advanced Features | Large | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add GivingCircle, CircleMember, CircleContribution, CircleInvite, CircleProposal, CircleVote, CircleActivity, CircleDiscussion, CircleRecurring

### New Libraries
- `src/lib/circles.ts`
- `src/lib/circle-invites.ts`
- `src/lib/circle-proposals.ts`
- `src/lib/circle-execution.ts`
- `src/lib/circle-processor.ts`
- `src/lib/circle-activity.ts`
- `src/lib/circle-impact.ts`
- `src/lib/circle-matching.ts`
- `src/lib/circle-templates.ts`

### API Routes
- `src/app/api/circles/route.ts`
- `src/app/api/circles/[slug]/route.ts`
- `src/app/api/circles/[slug]/join/route.ts`
- `src/app/api/circles/[slug]/invite/route.ts`
- `src/app/api/circles/[slug]/contribute/route.ts`
- `src/app/api/circles/[slug]/proposals/route.ts`
- `src/app/api/circles/[slug]/proposals/[id]/route.ts`
- `src/app/api/circles/[slug]/proposals/[id]/vote/route.ts`
- `src/app/api/circles/[slug]/discussions/route.ts`
- `src/app/api/circles/[slug]/impact/route.ts`
- `src/app/api/circles/[slug]/recurring/route.ts`
- `src/app/api/circles/join/[token]/route.ts`
- `src/app/api/circles/leaderboard/route.ts`

### UI Components
- `src/components/circles/circle-card.tsx`
- `src/components/circles/create-circle-form.tsx`
- `src/components/circles/circle-header.tsx`
- `src/components/circles/join-button.tsx`
- `src/components/circles/invite-members-modal.tsx`
- `src/components/circles/contribute-modal.tsx`
- `src/components/circles/pool-balance.tsx`
- `src/components/circles/contribution-history.tsx`
- `src/components/circles/member-contributions.tsx`
- `src/components/circles/proposal-card.tsx`
- `src/components/circles/create-proposal-modal.tsx`
- `src/components/circles/vote-buttons.tsx`
- `src/components/circles/voting-progress.tsx`
- `src/components/circles/activity-feed.tsx`
- `src/components/circles/discussion-thread.tsx`
- `src/components/circles/impact-stats.tsx`
- `src/components/circles/circle-leaderboard.tsx`

### Pages
- `src/app/(app)/circles/page.tsx`
- `src/app/(app)/circles/new/page.tsx`
- `src/app/(app)/circles/[slug]/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test circle creation and membership flow
4. Test proposal creation and voting
5. Verify fund execution on proposal approval
6. Test discussion threading
