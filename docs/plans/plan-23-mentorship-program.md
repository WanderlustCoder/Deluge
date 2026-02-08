# Plan 23: Mentorship & Community Support

## Overview

Connect experienced givers with newcomers through structured mentorship, peer support groups, and community guidance. Builds deeper connections and helps new users become confident, effective givers.

---

## Phase 1: Mentorship Foundation

### 1A. Mentor Schema

**Goal:** Define mentor profiles and matching criteria.

**Schema Addition:**

```prisma
model Mentor {
  id              String   @id @default(cuid())
  userId          String   @unique
  bio             String
  expertise       String[] // giving, loans, community, financial
  availability    String   // hours per month
  maxMentees      Int      @default(3)
  currentMentees  Int      @default(0)
  preferredStyle  String   // async, scheduled, casual
  languages       String[]
  timezone        String?
  isAccepting     Boolean  @default(true)
  applicationDate DateTime
  approvedDate    DateTime?
  approvedBy      String?
  status          String   @default("pending") // pending, active, paused, retired
  totalMentees    Int      @default(0)
  avgRating       Float?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  mentorships   Mentorship[]
  sessions      MentorSession[]
  reviews       MentorReview[]

  @@index([status, isAccepting])
  @@index([expertise])
}

model Mentee {
  id              String   @id @default(cuid())
  userId          String   @unique
  goals           String[] // learn_giving, build_budget, understand_loans
  challenges      String?
  preferredStyle  String   @default("any")
  timezone        String?
  status          String   @default("seeking") // seeking, matched, completed
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  mentorships Mentorship[]

  @@index([status])
}

model Mentorship {
  id              String   @id @default(cuid())
  mentorId        String
  menteeId        String
  status          String   @default("active") // pending, active, paused, completed, ended
  goals           String[]
  startDate       DateTime @default(now())
  endDate         DateTime?
  nextCheckIn     DateTime?
  notes           String?
  completionNotes String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  mentor   Mentor          @relation(fields: [mentorId], references: [id], onDelete: Cascade)
  mentee   Mentee          @relation(fields: [menteeId], references: [id], onDelete: Cascade)
  sessions MentorSession[]
  messages MentorMessage[]

  @@unique([mentorId, menteeId])
  @@index([mentorId, status])
  @@index([menteeId, status])
}
```

**Files:**
- `src/lib/mentorship/index.ts` - Mentorship management
- `src/lib/mentorship/matching.ts` - Match mentors to mentees
- `src/app/api/mentorship/mentors/route.ts`
- `src/app/api/mentorship/mentees/route.ts`

### 1B. Mentor Application

**Goal:** Users apply to become mentors.

**Files:**
- `src/app/(app)/mentorship/become-mentor/page.tsx`
- `src/components/mentorship/mentor-application.tsx`
- `src/app/api/mentorship/apply/route.ts`
- `src/app/admin/mentors/applications/page.tsx`
- `src/components/admin/mentor-application-review.tsx`

---

## Phase 2: Matching & Connection

### 2A. Mentor Discovery

**Goal:** Mentees find and request mentors.

**Files:**
- `src/app/(app)/mentorship/page.tsx` - Mentorship hub
- `src/app/(app)/mentorship/mentors/page.tsx` - Browse mentors
- `src/components/mentorship/mentor-card.tsx`
- `src/components/mentorship/mentor-filters.tsx`
- `src/components/mentorship/request-mentor-modal.tsx`

### 2B. Smart Matching

**Goal:** Algorithmic mentor-mentee matching.

**Files:**
- `src/lib/mentorship/smart-matching.ts` - Matching algorithm
- `src/app/api/mentorship/match/route.ts`
- `src/components/mentorship/match-suggestions.tsx`
- `src/components/mentorship/compatibility-score.tsx`

**Matching Factors:**
- Expertise alignment with goals
- Timezone compatibility
- Language match
- Availability overlap
- Style preferences

### 2C. Connection Flow

**Goal:** Initiate and accept mentorship.

**Files:**
- `src/app/api/mentorship/request/route.ts`
- `src/app/api/mentorship/[id]/accept/route.ts`
- `src/components/mentorship/pending-requests.tsx`
- `src/components/mentorship/mentorship-card.tsx`

---

## Phase 3: Communication

### 3A. Messaging System

**Goal:** Mentor-mentee communication.

**Schema Addition:**

```prisma
model MentorMessage {
  id            String   @id @default(cuid())
  mentorshipId  String
  senderId      String
  content       String
  attachments   Json?
  readAt        DateTime?
  createdAt     DateTime @default(now())

  mentorship Mentorship @relation(fields: [mentorshipId], references: [id], onDelete: Cascade)

  @@index([mentorshipId, createdAt])
}
```

**Files:**
- `src/app/(app)/mentorship/messages/page.tsx`
- `src/app/(app)/mentorship/messages/[id]/page.tsx`
- `src/app/api/mentorship/[id]/messages/route.ts`
- `src/components/mentorship/message-thread.tsx`
- `src/components/mentorship/message-composer.tsx`

### 3B. Session Scheduling

**Goal:** Schedule mentorship sessions.

**Schema Addition:**

```prisma
model MentorSession {
  id            String   @id @default(cuid())
  mentorshipId  String?
  mentorId      String
  title         String
  description   String?
  scheduledAt   DateTime
  duration      Int      // minutes
  type          String   // one_on_one, group, workshop
  meetingLink   String?
  status        String   @default("scheduled") // scheduled, completed, cancelled, no_show
  notes         String?
  feedback      String?
  createdAt     DateTime @default(now())

  mentorship Mentorship? @relation(fields: [mentorshipId], references: [id])
  mentor     Mentor      @relation(fields: [mentorId], references: [id], onDelete: Cascade)

  @@index([mentorId, scheduledAt])
  @@index([mentorshipId])
}
```

**Files:**
- `src/app/api/mentorship/sessions/route.ts`
- `src/components/mentorship/schedule-session.tsx`
- `src/components/mentorship/session-card.tsx`
- `src/components/mentorship/calendar-view.tsx`

---

## Phase 4: Support Groups

### 4A. Peer Support Groups

**Goal:** Group-based mutual support.

**Schema Addition:**

```prisma
model SupportGroup {
  id              String   @id @default(cuid())
  name            String
  description     String
  type            String   // new_givers, loan_funders, community_leaders
  facilitatorId   String?
  maxMembers      Int      @default(12)
  isPrivate       Boolean  @default(false)
  meetingSchedule String?  // "weekly_wednesday_7pm"
  timezone        String?
  status          String   @default("active") // forming, active, full, archived
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members   SupportGroupMember[]
  meetings  SupportGroupMeeting[]
  posts     SupportGroupPost[]

  @@index([type, status])
}

model SupportGroupMember {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  role      String   @default("member") // facilitator, member
  joinedAt  DateTime @default(now())
  status    String   @default("active")

  group SupportGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([userId])
}

model SupportGroupMeeting {
  id          String   @id @default(cuid())
  groupId     String
  title       String?
  scheduledAt DateTime
  duration    Int      @default(60)
  topic       String?
  notes       String?
  recordingUrl String?
  attendeeCount Int?
  createdAt   DateTime @default(now())

  group SupportGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, scheduledAt])
}

model SupportGroupPost {
  id        String   @id @default(cuid())
  groupId   String
  authorId  String
  content   String
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  group   SupportGroup         @relation(fields: [groupId], references: [id], onDelete: Cascade)
  replies SupportGroupReply[]

  @@index([groupId, createdAt])
}

model SupportGroupReply {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  post SupportGroupPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
}
```

**Files:**
- `src/app/(app)/support-groups/page.tsx` - Browse groups
- `src/app/(app)/support-groups/[id]/page.tsx` - Group detail
- `src/app/api/support-groups/route.ts`
- `src/components/support/group-card.tsx`
- `src/components/support/group-feed.tsx`
- `src/components/support/meeting-schedule.tsx`

### 4B. Facilitated Discussions

**Goal:** Guided group discussions.

**Files:**
- `src/lib/support/facilitation.ts`
- `src/components/support/discussion-guide.tsx`
- `src/components/support/icebreaker-prompts.tsx`
- `src/components/support/topic-cards.tsx`

---

## Phase 5: Progress & Outcomes

### 5A. Goal Tracking

**Goal:** Track mentee progress toward goals.

**Schema Addition:**

```prisma
model MenteeGoal {
  id            String   @id @default(cuid())
  mentorshipId  String
  title         String
  description   String?
  targetDate    DateTime?
  status        String   @default("active") // active, completed, abandoned
  progress      Float    @default(0) // 0-100
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  milestones MenteeMilestone[]

  @@index([mentorshipId, status])
}

model MenteeMilestone {
  id          String   @id @default(cuid())
  goalId      String
  title       String
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  notes       String?
  createdAt   DateTime @default(now())

  goal MenteeGoal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
}
```

**Files:**
- `src/lib/mentorship/goals.ts`
- `src/app/api/mentorship/[id]/goals/route.ts`
- `src/components/mentorship/goal-tracker.tsx`
- `src/components/mentorship/milestone-checklist.tsx`
- `src/components/mentorship/progress-chart.tsx`

### 5B. Mentor Reviews

**Goal:** Collect feedback on mentorship.

**Schema Addition:**

```prisma
model MentorReview {
  id            String   @id @default(cuid())
  mentorId      String
  mentorshipId  String?
  reviewerId    String
  rating        Float    // 1-5
  content       String?
  isPublic      Boolean  @default(false)
  createdAt     DateTime @default(now())

  mentor Mentor @relation(fields: [mentorId], references: [id], onDelete: Cascade)

  @@index([mentorId])
}
```

**Files:**
- `src/app/api/mentorship/[id]/review/route.ts`
- `src/components/mentorship/review-form.tsx`
- `src/components/mentorship/mentor-reviews.tsx`
- `src/components/mentorship/rating-stars.tsx`

---

## Phase 6: Recognition & Badges

### 6A. Mentorship Badges

**Goal:** Recognize mentorship contributions.

**Mentor Badges:**
- First Mentor Session
- Dedicated Mentor (10 sessions)
- Mentor Master (50 sessions)
- Group Facilitator
- Mentee Success (3 mentees completed)

**Mentee Badges:**
- Mentorship Started
- Goal Achieved
- Mentorship Graduate
- Peer Supporter

**Files:**
- Update `src/lib/badges.ts` - Add mentorship badges
- `src/components/mentorship/mentor-badges.tsx`
- `src/components/mentorship/mentee-achievements.tsx`

### 6B. Impact Metrics

**Goal:** Track mentorship program impact.

**Files:**
- `src/lib/mentorship/analytics.ts`
- `src/app/admin/mentorship/page.tsx`
- `src/components/admin/mentorship-stats.tsx`
- `src/components/admin/mentor-leaderboard.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Mentorship Foundation | Medium | High |
| 2 | Matching & Connection | Medium | High |
| 3 | Communication | Medium | High |
| 4 | Support Groups | Large | Medium |
| 5 | Progress & Outcomes | Medium | Medium |
| 6 | Recognition & Badges | Small | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Mentor, Mentee, Mentorship, MentorMessage, MentorSession, MentorReview, SupportGroup, SupportGroupMember, SupportGroupMeeting, SupportGroupPost, SupportGroupReply, MenteeGoal, MenteeMilestone

### New Libraries
- `src/lib/mentorship/index.ts`
- `src/lib/mentorship/matching.ts`
- `src/lib/mentorship/smart-matching.ts`
- `src/lib/mentorship/goals.ts`
- `src/lib/mentorship/analytics.ts`
- `src/lib/support/facilitation.ts`

### Pages
- `src/app/(app)/mentorship/page.tsx`
- `src/app/(app)/mentorship/mentors/page.tsx`
- `src/app/(app)/mentorship/become-mentor/page.tsx`
- `src/app/(app)/mentorship/messages/page.tsx`
- `src/app/(app)/support-groups/page.tsx`
- `src/app/(app)/support-groups/[id]/page.tsx`
- `src/app/admin/mentors/page.tsx`
- `src/app/admin/mentorship/page.tsx`

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test mentor application flow
4. Verify matching algorithm
5. Test messaging and scheduling
6. Test support group creation and joining
7. Verify badge awards
