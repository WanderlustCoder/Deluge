# Plan 21: Learning Resources & Financial Literacy

**Status:** Not Started
**Priority:** Medium
**Epic:** DLG-LEARN-001 through DLG-LEARN-005
**Reference:** `docs/user-experience.md`

---

## Philosophy

Learning resources are **available when you need them**, not mandatory curriculum to complete. We provide helpful information without tracking progress, scoring quizzes, or gamifying education.

### What We Avoid
- **No progress bars** - Learning isn't a race to 100%
- **No completion streaks** - Missing a day isn't failure
- **No achievement points** - Knowledge isn't scored
- **No difficulty levels** - All learning is equally valuable
- **No prerequisites** - People explore topics in their own order
- **No leaderboards** - Learning isn't competitive
- **No mandatory certification** - Optional credentials only

### What We Embrace
- **Accessible resources** - Available to everyone
- **Self-directed exploration** - Learn what interests you
- **Practical application** - Useful tools, not just theory
- **Community discussion** - Learn together
- **Personal reflection** - Connect learning to your life

---

## Overview

A library of educational resources about effective giving, financial wellness, and community impact. People explore at their own pace, in their own way, without pressure to "complete" anything.

---

## Phase 1: Resource Library

### 1A. Content Structure

**Goal:** Organize helpful content without gamification.

**Schema Addition:**

```prisma
model LearningResource {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  description     String
  content         Json     // Rich content blocks
  category        String   // giving, financial, impact, community
  format          String   // article, video, guide, tool, worksheet
  estimatedMinutes Int?    // Optional time estimate
  imageUrl        String?
  isPublished     Boolean  @default(false)
  order           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([category, isPublished])
}
```

**Note:** No difficulty levels, no prerequisites, no completion tracking.

**Resource Categories:**
- **Giving**: Understanding impact, choosing causes, giving strategies
- **Financial**: Budgeting for giving, tax benefits, planned giving
- **Impact**: How projects create change, measuring outcomes
- **Community**: Local organizing, collective action, mutual aid

**Formats:**
- **Articles**: In-depth explanations
- **Videos**: Visual guides
- **Guides**: Step-by-step instructions
- **Tools**: Calculators, worksheets
- **Stories**: Real-world examples

**Files:**
- `src/lib/learning/resources.ts` - Resource management
- `src/app/api/learn/resources/route.ts`
- `src/app/api/learn/resources/[slug]/route.ts`

### 1B. Resource Discovery

**Goal:** Find helpful content easily.

**Files:**
- `src/app/(app)/learn/page.tsx` - Learning hub (browse by category)
- `src/app/(app)/learn/[slug]/page.tsx` - Resource detail
- `src/components/learn/resource-card.tsx`
- `src/components/learn/resource-grid.tsx`
- `src/components/learn/category-nav.tsx`
- `src/components/learn/search-resources.tsx`

**Note:** No "your progress" section, no "continue where you left off" pressure.

---

## Phase 2: Practical Tools

### 2A. Giving Budget Planner

**Goal:** Help people plan giving within their means.

**Schema Addition:**

```prisma
model GivingPlan {
  id              String   @id @default(cuid())
  userId          String   @unique
  monthlyTarget   Float?
  yearlyTarget    Float?
  method          String   @default("flexible") // percentage, fixed, flexible
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Note:** This is a tool, not a tracker. No reminders if you don't meet targets.

**Files:**
- `src/app/(app)/learn/budget/page.tsx` - Budget planner tool
- `src/components/learn/budget-calculator.tsx`
- `src/components/learn/giving-plan-form.tsx`

### 2B. Tax Information

**Goal:** Educate about tax benefits of giving.

**Files:**
- `src/app/(app)/learn/taxes/page.tsx` - Tax education
- `src/components/learn/tax-estimator.tsx` - Simple deduction estimator
- `src/components/learn/tax-faq.tsx`

**Disclaimer:** "This is educational information, not tax advice. Consult a tax professional."

### 2C. Impact Calculator

**Goal:** Understand potential impact of giving.

**Files:**
- `src/app/(app)/learn/impact/page.tsx`
- `src/components/learn/impact-calculator.tsx`
- Shows what different giving amounts might accomplish

---

## Phase 3: Reflection & Exploration

### 3A. Reflection Prompts

**Goal:** Encourage thoughtful giving through personal reflection.

**Schema Addition:**

```prisma
model ReflectionEntry {
  id          String   @id @default(cuid())
  userId      String
  prompt      String
  response    String
  isPrivate   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

**Reflection Prompts (not "assignments"):**
- "What causes matter most to you and why?"
- "Describe a time generosity made a difference in your life"
- "What do you hope your giving will accomplish?"
- "How do you decide between competing needs?"

**Note:** Reflections are private by default. No "reflection streaks" or "complete 5 reflections" pressure.

**Files:**
- `src/lib/learning/reflections.ts`
- `src/app/api/learn/reflections/route.ts`
- `src/app/(app)/learn/reflect/page.tsx`
- `src/components/learn/reflection-prompt.tsx`
- `src/components/learn/reflection-journal.tsx`

### 3B. Decision Scenarios

**Goal:** Explore giving decisions through scenarios.

**Schema Addition:**

```prisma
model GivingScenario {
  id              String   @id @default(cuid())
  title           String
  scenario        String   // The situation to consider
  options         Json     // Possible approaches
  considerations  Json     // Things to think about
  category        String
  createdAt       DateTime @default(now())

  @@index([category])
}
```

**Note:** No "scoring" of decisions. Scenarios present trade-offs to consider, not right/wrong answers.

**Example Scenario:**
> "You have $100 to give. A local food bank needs immediate help, while an education nonprofit has a matching campaign. What considerations might inform your decision?"

**Files:**
- `src/lib/learning/scenarios.ts`
- `src/app/(app)/learn/scenarios/page.tsx`
- `src/app/(app)/learn/scenarios/[id]/page.tsx`
- `src/components/learn/scenario-card.tsx`
- `src/components/learn/scenario-explorer.tsx`

---

## Phase 4: Community Discussion

### 4A. Discussion Forums

**Goal:** Learn together through conversation.

**Schema Addition:**

```prisma
model LearningDiscussion {
  id          String   @id @default(cuid())
  resourceId  String?  // Optional link to resource
  topic       String
  content     String
  authorId    String
  isPinned    Boolean  @default(false)
  replyCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  replies LearningReply[]

  @@index([resourceId, createdAt])
}

model LearningReply {
  id            String   @id @default(cuid())
  discussionId  String
  content       String
  authorId      String
  createdAt     DateTime @default(now())

  discussion LearningDiscussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)

  @@index([discussionId, createdAt])
}
```

**Note:** No "helpful votes" that create competition. Just conversations.

**Files:**
- `src/app/(app)/learn/discuss/page.tsx` - Discussion hub
- `src/app/api/learn/discussions/route.ts`
- `src/components/learn/discussion-thread.tsx`
- `src/components/learn/discussion-composer.tsx`

### 4B. Study Circles

**Goal:** Groups explore topics together.

**Schema Addition:**

```prisma
model StudyCircle {
  id          String   @id @default(cuid())
  name        String
  description String?
  topic       String?  // What they're exploring
  facilitatorId String
  isPrivate   Boolean  @default(false)
  maxMembers  Int      @default(12)
  createdAt   DateTime @default(now())

  members StudyCircleMember[]

  @@index([topic])
}

model StudyCircleMember {
  id        String   @id @default(cuid())
  circleId  String
  userId    String
  joinedAt  DateTime @default(now())

  circle StudyCircle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@unique([circleId, userId])
}
```

**Note:** Called "circles" not "groups" to emphasize equality. No "leader" role beyond facilitation.

**Files:**
- `src/app/(app)/learn/circles/page.tsx`
- `src/app/(app)/learn/circles/[id]/page.tsx`
- `src/app/api/learn/circles/route.ts`
- `src/components/learn/circle-card.tsx`

---

## Phase 5: Optional Certificates

### 5A. Completion Certificates

**Goal:** Optional recognition for those who want it.

**Schema Addition:**

```prisma
model LearningCertificate {
  id              String   @id @default(cuid())
  userId          String
  topic           String   // "Effective Giving Fundamentals"
  issuedAt        DateTime @default(now())
  certificateUrl  String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Key principles:**
- Certificates are **optional** - available upon request
- No "incomplete" status - you either have one or you don't
- No expiration - learning doesn't expire
- No levels - all certificates are equally valid

**Files:**
- `src/lib/learning/certificates.ts`
- `src/app/(app)/learn/certificates/page.tsx`
- `src/app/api/learn/certificates/request/route.ts`
- `src/components/learn/certificate-request.tsx`
- `src/lib/pdf/certificate-template.ts`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Resource Library | Medium | High |
| 2 | Practical Tools | Medium | High |
| 3 | Reflection & Exploration | Small | Medium |
| 4 | Community Discussion | Medium | Medium |
| 5 | Optional Certificates | Small | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add LearningResource, GivingPlan, ReflectionEntry, GivingScenario, LearningDiscussion, LearningReply, StudyCircle, StudyCircleMember, LearningCertificate

### New Libraries
- `src/lib/learning/resources.ts`
- `src/lib/learning/reflections.ts`
- `src/lib/learning/scenarios.ts`
- `src/lib/learning/certificates.ts`

### Pages
- `src/app/(app)/learn/page.tsx`
- `src/app/(app)/learn/[slug]/page.tsx`
- `src/app/(app)/learn/budget/page.tsx`
- `src/app/(app)/learn/taxes/page.tsx`
- `src/app/(app)/learn/impact/page.tsx`
- `src/app/(app)/learn/reflect/page.tsx`
- `src/app/(app)/learn/scenarios/page.tsx`
- `src/app/(app)/learn/discuss/page.tsx`
- `src/app/(app)/learn/circles/page.tsx`
- `src/app/(app)/learn/certificates/page.tsx`

---

## What We Removed

### Removed from Original Plan
- ❌ Course enrollment with progress tracking
- ❌ `progress` percentage field
- ❌ Progress bars on courses
- ❌ Prerequisites between courses
- ❌ Difficulty levels (beginner, intermediate, advanced)
- ❌ LearningAchievement model with points
- ❌ "Learning Streak (7 days)" achievement
- ❌ Secret achievements
- ❌ Quiz scoring
- ❌ Skill assessments with levels
- ❌ "Continue where you left off" prompts
- ❌ Recommended courses based on incomplete progress

### Replaced With
- ✅ Resource library (browse freely)
- ✅ Practical tools (use when needed)
- ✅ Reflection prompts (private, no tracking)
- ✅ Scenarios (exploration, not tests)
- ✅ Study circles (community, not competition)
- ✅ Optional certificates (available upon request)

---

## Sample Resource Content

### "Understanding Impact" (Article)
- What does "impact" mean in giving?
- How projects measure outcomes
- Questions to ask about effectiveness

### "Planning Your Giving" (Guide)
- Reflecting on your values
- Setting a sustainable giving amount
- Choosing causes that matter to you

### "Tax Benefits of Giving" (Tool)
- Simple calculator for deductions
- Common questions answered
- When to consult a professional

---

## Language Guide

**Do say:**
- "Explore our resource library"
- "Learn more about effective giving"
- "Reflect on what matters to you"
- "Join a study circle"

**Don't say:**
- "Complete this course to earn a badge"
- "You're 60% through the curriculum"
- "Keep your learning streak alive"
- "Take the quiz to test your knowledge"
- "Unlock advanced content"

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Verify no progress tracking appears
4. Confirm no quiz scoring
5. Test that all content is accessible without prerequisites
6. Verify no achievement or streak mechanics
7. Confirm certificates are truly optional

