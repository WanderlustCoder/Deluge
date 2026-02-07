# Plan 8: Family Accounts & Shared Giving

**Status:** Approved
**Priority:** Low
**Epic:** DLG-FAMILY-001 through DLG-FAMILY-006
**Reference:** `docs/user-experience.md`

---

## Overview

Enable family/household accounts with shared giving, parental controls, and combined impact tracking.

---

## Current State

- Individual accounts only
- No way to link family members
- No shared watershed option
- No parental controls
- No family giving goals

---

## Persona Context

From `docs/user-experience.md` — David, 45, VP Operations:
- Wants to teach kids about giving and community impact
- Wants family accounts for shared giving
- Wants clear tax documentation

---

## Schema Changes

```prisma
model Family {
  id          String   @id @default(cuid())
  name        String

  sharedWatershedEnabled Boolean @default(false)
  sharedWatershedId      String?

  createdAt   DateTime @default(now())

  members     FamilyMember[]
  sharedWatershed Watershed? @relation(fields: [sharedWatershedId], references: [id])
  goals       FamilyGoal[]

  @@index([sharedWatershedId])
}

model FamilyMember {
  id          String   @id @default(cuid())
  familyId    String
  userId      String   @unique

  role        String   // admin, adult, child
  nickname    String?

  // Parental controls
  monthlyLimit    Float?
  requireApproval Boolean  @default(false)
  allowedCategories String?

  joinedAt    DateTime @default(now())

  family      Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([familyId])
}

model FamilyGoal {
  id          String   @id @default(cuid())
  familyId    String

  title       String
  description String?

  targetType  String   // projects_funded, amount_given, categories_supported
  targetValue Float
  currentValue Float   @default(0)

  deadline    DateTime?
  status      String   @default("active")

  createdAt   DateTime @default(now())

  family      Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)

  @@index([familyId, status])
}

model FamilyActivity {
  id          String   @id @default(cuid())
  familyId    String
  memberId    String

  actionType  String
  description String

  projectId   String?
  communityId String?
  badgeId     String?
  amount      Float?

  createdAt   DateTime @default(now())

  @@index([familyId, createdAt])
}

model PendingFamilyAction {
  id          String   @id @default(cuid())
  familyId    String
  memberId    String
  approverId  String?

  actionType  String
  targetId    String
  amount      Float

  status      String   @default("pending")
  note        String?

  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  @@index([familyId, status])
}

model FamilyBadge {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  icon        String

  criteriaType  String
  criteriaValue String
}

model FamilyBadgeEarned {
  id          String   @id @default(cuid())
  familyId    String
  badgeId     String
  earnedAt    DateTime @default(now())

  @@unique([familyId, badgeId])
}
```

---

## Family Badge System

| Badge | Criteria | Icon |
|-------|----------|------|
| Family First | Family funded first project together | 👨‍👩‍👧 |
| Team Effort | All family members contributed in same month | 🤝 |
| Generational | 3+ generations in family | 👴 |
| Family Streak | Family contributed every week for a month | 🔥 |
| Impact Family | Family funded 10+ projects together | 🏆 |
| Teaching Moment | Child member earned their first badge | 🎓 |
| Family Cascade | Family was part of a cascade together | 🌊 |

---

## New Library Files

### `src/lib/family.ts`
- `createFamily(adminUserId, name)`
- `inviteFamilyMember(familyId, email, role)`
- `acceptFamilyInvite(token, userId)`
- `removeFamilyMember(familyId, memberId)`
- `updateMemberSettings(memberId, settings)`

### `src/lib/family-watershed.ts`
- `enableSharedWatershed(familyId)`
- `disableSharedWatershed(familyId)`
- `getWatershedForMember(memberId)`
- `recordFamilyContribution(memberId, amount)`

### `src/lib/parental-controls.ts`
- `setMonthlyLimit(memberId, limit)`
- `setRequireApproval(memberId, required)`
- `setAllowedCategories(memberId, categories)`
- `requestApproval(memberId, action)`
- `approveAction(actionId, approverId)`
- `denyAction(actionId, approverId, note)`
- `checkWithinLimits(memberId, amount)`

### `src/lib/family-impact.ts`
- `getFamilyImpact(familyId)`
- `getFamilyActivity(familyId, limit)`
- `getMemberContributions(familyId)`

### `src/lib/family-goals.ts`
- `createFamilyGoal(familyId, goal)`
- `updateGoalProgress(familyId)`
- `getActiveGoals(familyId)`

### `src/lib/family-tax.ts`
- `generateFamilyTaxSummary(familyId, year)`
- `generateTaxPdf(familyId, year)`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/family` | GET | Get user's family |
| `/api/family` | POST | Create family |
| `/api/family/invite` | POST | Invite member |
| `/api/family/invite/[token]` | POST | Accept invite |
| `/api/family/members/[id]` | PUT/DELETE | Manage member |
| `/api/family/members/[id]/controls` | PUT | Parental controls |
| `/api/family/watershed` | PUT | Toggle shared watershed |
| `/api/family/goals` | GET/POST | Goals |
| `/api/family/activity` | GET | Activity feed |
| `/api/family/impact` | GET | Combined impact |
| `/api/family/pending` | GET | Pending approvals |
| `/api/family/pending/[id]/approve` | POST | Approve |
| `/api/family/pending/[id]/deny` | POST | Deny |
| `/api/family/tax/[year]` | GET | Tax summary |
| `/api/family/tax/[year]/pdf` | GET | Tax PDF |

---

## UI Components

- `src/components/family/family-dashboard.tsx`
- `src/components/family/member-card.tsx`
- `src/components/family/invite-member-modal.tsx`
- `src/components/family/parental-controls-form.tsx`
- `src/components/family/pending-approvals.tsx`
- `src/components/family/family-goal-card.tsx`
- `src/components/family/shared-watershed-toggle.tsx`
- `src/components/family/tax-summary.tsx`
- `src/components/family/family-badges.tsx`

---

## Approval Flow (for children)

1. Child clicks "Fund this project" for $5
2. System checks: `requireApproval === true`
3. Creates `PendingFamilyAction`
4. Parent gets notification
5. Parent reviews on `/family`
6. Parent approves → action is processed
7. Parent denies → child sees denial with note

---

## Implementation Order

1. Schema migration
2. `family.ts` — Core family CRUD
3. Family creation and invite flow
4. `family-watershed.ts` — Shared watershed
5. Family dashboard page
6. Member management
7. `parental-controls.ts` — Limits and approvals
8. Approval flow in fund/loan routes
9. Pending approvals UI
10. `family-goals.ts` — Goal system
11. `family-impact.ts` — Combined tracking
12. `family-tax.ts` — Tax documentation
13. Family badges
14. Notifications for family events

---

## Success Criteria

- [ ] Users can create families and invite members
- [ ] Families can optionally share a watershed
- [ ] Parents can set spending limits for children
- [ ] Children's actions can require approval
- [ ] Family goals track collective progress
- [ ] Combined impact stats show family contribution
- [ ] Tax summary available for download
- [ ] Family-specific badges can be earned

---

## Estimated Effort

3 implementation sessions
