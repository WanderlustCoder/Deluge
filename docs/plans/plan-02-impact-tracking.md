# Plan 2: Post-Cascade Impact Tracking

**Status:** Complete
**Priority:** High
**Epic:** DLG-IMPACT-001 through DLG-IMPACT-005
**Reference:** `docs/user-experience.md`, `docs/executive-summary.md`

---

## Overview

Create a complete post-cascade experience where proposers report progress and backers see real outcomes. The docs emphasize "see exactly what happened" but there's currently no post-funding tracking.

---

## Current State

- Projects go from "active" → "funded" → done
- No mechanism for proposers to post updates
- Backers have no visibility into outcomes
- No impact metrics or completion flow

---

## Schema Changes

```prisma
model ProjectUpdate {
  id          String   @id @default(cuid())
  projectId   String
  authorId    String
  type        String   // text, photo, video, milestone, completion
  title       String
  content     String   @db.Text
  mediaUrls   String?  // JSON array of URLs
  createdAt   DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id])

  @@index([projectId, createdAt])
}

model ImpactMetric {
  id          String   @id @default(cuid())
  projectId   String
  name        String   // e.g., "Students Served", "Trees Planted"
  value       Float
  unit        String   // e.g., "students", "trees"
  reportedAt  DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

model ProjectFollow {
  id          String   @id @default(cuid())
  userId      String
  projectId   String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

// Add to Project model
model Project {
  // ... existing fields ...
  completedAt     DateTime?
  impactSummary   String?   @db.Text
  updates         ProjectUpdate[]
  impactMetrics   ImpactMetric[]
  followers       ProjectFollow[]
}
```

---

## Impact Metric Templates

```typescript
export const IMPACT_METRIC_TEMPLATES = {
  education: [
    { name: "Students Served", unit: "students" },
    { name: "Teachers Trained", unit: "teachers" },
    { name: "Books Distributed", unit: "books" },
  ],
  environment: [
    { name: "Trees Planted", unit: "trees" },
    { name: "Trash Collected", unit: "lbs" },
    { name: "Area Restored", unit: "acres" },
  ],
  health: [
    { name: "People Served", unit: "people" },
    { name: "Meals Provided", unit: "meals" },
    { name: "Medical Supplies", unit: "kits" },
  ],
  housing: [
    { name: "Homes Repaired", unit: "homes" },
    { name: "Families Housed", unit: "families" },
  ],
  innovation: [
    { name: "Prototypes Built", unit: "prototypes" },
    { name: "Jobs Created", unit: "jobs" },
  ],
  arts: [
    { name: "Performances", unit: "shows" },
    { name: "Artists Supported", unit: "artists" },
    { name: "Attendees", unit: "people" },
  ],
  local: [
    { name: "Community Members Impacted", unit: "people" },
    { name: "Events Held", unit: "events" },
  ],
} as const;
```

---

## New Library Files

### `src/lib/project-updates.ts`

- `createUpdate(projectId, authorId, data)` — Post new update
- `getProjectUpdates(projectId)` — List updates for project
- `notifyFollowers(projectId, updateId)` — Send notifications
- `canPostUpdate(userId, projectId)` — Check if user is proposer

### `src/lib/impact-metrics.ts`

- `recordMetric(projectId, name, value, unit)`
- `getProjectMetrics(projectId)`
- `getMetricTemplates(category)`
- `aggregateUserImpact(userId)` — Total impact from backed projects

### `src/lib/project-completion.ts`

- `markComplete(projectId, impactSummary)` — Finalize project
- `generateCompletionCertificate(userId, projectId)` — Shareable image
- `checkImpactWitnessBadge(userId)` — Award badge at 5+ updates received

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects/[id]/updates` | GET | List project updates |
| `/api/projects/[id]/updates` | POST | Create update (proposer only) |
| `/api/projects/[id]/updates/[updateId]` | DELETE | Delete update |
| `/api/projects/[id]/metrics` | GET | Get impact metrics |
| `/api/projects/[id]/metrics` | POST | Record impact metric |
| `/api/projects/[id]/complete` | POST | Mark project complete |
| `/api/projects/[id]/follow` | POST | Toggle follow |
| `/api/projects/[id]/certificate` | GET | Generate completion certificate |
| `/api/users/[id]/impact` | GET | Aggregated impact from backed projects |

---

## UI Components

### `src/components/projects/update-timeline.tsx`
- Chronological list of updates
- Media gallery for photos/videos
- Milestone markers

### `src/components/projects/update-form.tsx`
- Rich text editor
- Media upload (photos, videos)
- Update type selector
- Milestone toggle

### `src/components/projects/impact-report-card.tsx`
- Visual display of impact metrics
- Category-appropriate icons
- Comparison to goal

### `src/components/projects/follow-button.tsx`
- Toggle follow state
- Show follower count

### `src/components/projects/completion-certificate.tsx`
- Shareable certificate image
- Project name, backer contribution, impact summary

---

## Page Changes

### Project Detail (`/projects/[id]`)
- Add "Updates" tab with timeline
- Add "Impact" section with metrics
- Follow button for authenticated users
- Completion status banner for finished projects

### Impact Page (`/impact`)
- Add "Impact from backed projects" section
- Show aggregate metrics

---

## Notification Flow

1. Project funded → Auto-follow all backers
2. Proposer posts update → Notify all followers
3. Project completed → Celebration notification to all backers
4. User receives 5th update → "Impact Witness" badge

---

## Implementation Order

1. Schema migration
2. `project-updates.ts` + API routes
3. Update form component
4. Update timeline component
5. Follow system
6. Impact metrics system
7. Impact report card
8. Completion flow
9. Certificate generation
10. Badge integration ("Impact Witness")
11. Notification integration

---

## Success Criteria

- [x] Proposers can post updates after funding
- [x] Backers see update timeline on project page
- [x] Impact metrics can be recorded and displayed
- [x] Users can follow/unfollow projects
- [x] Followers are notified of new updates
- [x] Projects can be marked complete with summary
- [x] Completion certificate is shareable
- [x] "Impact Witness" badge awarded at 5+ updates

---

## Estimated Effort

2 implementation sessions
