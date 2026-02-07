# Plan 4: Following & Social Features

**Status:** Approved
**Priority:** Medium
**Epic:** DLG-SOCIAL-001 through DLG-SOCIAL-005
**Reference:** `docs/user-experience.md`

---

## Overview

Create a social layer where users follow people, projects, and communities, with a personalized feed and improved discussion features.

---

## Current State

- Users can join communities
- Basic community discussions exist
- No way to follow individual users or projects
- No personalized feed of followed items
- Share functionality is basic (no tracking)
- Discussion threads are flat (no replies)

---

## Schema Changes

```prisma
model Follow {
  id           String   @id @default(cuid())
  followerId   String

  // Polymorphic target - only one should be set
  targetUserId      String?
  targetProjectId   String?
  targetCommunityId String?

  createdAt    DateTime @default(now())

  follower     User      @relation("UserFollows", fields: [followerId], references: [id], onDelete: Cascade)
  targetUser   User?     @relation("UserFollowers", fields: [targetUserId], references: [id], onDelete: Cascade)
  targetProject Project? @relation(fields: [targetProjectId], references: [id], onDelete: Cascade)
  targetCommunity Community? @relation(fields: [targetCommunityId], references: [id], onDelete: Cascade)

  @@unique([followerId, targetUserId])
  @@unique([followerId, targetProjectId])
  @@unique([followerId, targetCommunityId])
  @@index([followerId])
  @@index([targetUserId])
  @@index([targetProjectId])
  @@index([targetCommunityId])
}

model FeedItem {
  id          String   @id @default(cuid())
  userId      String   // Who this feed item is for

  // Activity details
  actorId     String?  // Who did the action (null for system)
  actionType  String   // funded, cascaded, posted_update, joined, proposed, etc.

  // Target references
  projectId   String?
  communityId String?
  loanId      String?
  updateId    String?

  // Denormalized for fast display
  title       String
  description String?

  read        Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, read])
}

// Enhance Discussion model for threading
model Discussion {
  // ... existing fields ...
  parentId    String?
  parent      Discussion?  @relation("DiscussionReplies", fields: [parentId], references: [id])
  replies     Discussion[] @relation("DiscussionReplies")
  mentions    DiscussionMention[]
}

model DiscussionMention {
  id           String   @id @default(cuid())
  discussionId String
  userId       String
  createdAt    DateTime @default(now())

  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id])

  @@unique([discussionId, userId])
}

// Add follower counts to entities
model User {
  // ... existing fields ...
  followerCount  Int @default(0)
  followingCount Int @default(0)
}

model Project {
  // ... existing fields ...
  followerCount Int @default(0)
}

model Community {
  // ... existing fields ...
  followerCount Int @default(0)
}
```

---

## New Library Files

### `src/lib/follows.ts`
- `followUser(followerId, targetUserId)`
- `followProject(followerId, projectId)`
- `followCommunity(followerId, communityId)`
- `unfollow(followId)`
- `isFollowing(followerId, targetType, targetId)`
- `getFollowers(targetType, targetId, page)`
- `getFollowing(userId, targetType, page)`
- `updateFollowerCounts(targetType, targetId)`

### `src/lib/feed.ts`
- `generateFeedItem(userId, action, data)`
- `getFeed(userId, page, filter)`
- `markAsRead(feedItemId)`
- `markAllAsRead(userId)`
- `pruneOldFeedItems()`

### `src/lib/mentions.ts`
- `parseMentions(content)`
- `createMentions(discussionId, userIds)`
- `notifyMentionedUsers(discussionId)`

### `src/lib/social-sharing.ts`
- `generateShareText(entityType, entityId)`
- `generateOgTags(entityType, entityId)`
- `getShareUrl(entityType, entityId)`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/follow` | POST | Follow user/project/community |
| `/api/follow` | DELETE | Unfollow |
| `/api/follow/status` | GET | Check if following |
| `/api/users/[id]/followers` | GET | User's followers |
| `/api/users/[id]/following` | GET | Who user follows |
| `/api/projects/[id]/followers` | GET | Project followers |
| `/api/communities/[id]/followers` | GET | Community followers |
| `/api/feed` | GET | User's personalized feed |
| `/api/feed/[id]/read` | POST | Mark feed item read |
| `/api/feed/read-all` | POST | Mark all read |
| `/api/discussions/[id]/replies` | GET | Get replies to discussion |
| `/api/discussions/[id]/replies` | POST | Post reply |

---

## UI Components

### `src/components/social/follow-button.tsx`
### `src/components/social/follower-list.tsx`
### `src/components/social/share-modal.tsx`
### `src/components/feed/feed-list.tsx`
### `src/components/feed/feed-item-card.tsx`
### `src/components/discussions/threaded-discussion.tsx`
### `src/components/discussions/mention-input.tsx`

---

## Feed Item Types

| Action Type | Trigger | Title Template |
|-------------|---------|----------------|
| `funded` | User funds project | "{actor} backed {project}" |
| `cascaded` | Project hits 100% | "{project} reached its goal!" |
| `posted_update` | Proposer posts update | "New update on {project}" |
| `joined_community` | User joins community | "{actor} joined {community}" |
| `proposed_project` | User proposes project | "{actor} proposed {project}" |
| `milestone` | Community hits milestone | "{community} reached {milestone}!" |
| `rally_created` | Rally started | "Rally started for {project}" |
| `loan_funded` | Loan fully funded | "{loan} was fully funded" |

---

## Implementation Order

1. Schema migration
2. `follows.ts` — Core follow logic
3. Follow button component
4. Follower/following lists
5. `feed.ts` — Feed generation
6. Feed page + components
7. `mentions.ts` — @mention system
8. Threaded discussions
9. `social-sharing.ts` — Enhanced sharing
10. Share modal with tracking
11. OG meta tags for all pages
12. Notification integration

---

## Success Criteria

- [ ] Users can follow other users, projects, and communities
- [ ] Follower counts display on profiles/pages
- [ ] Personalized feed shows activity from followed entities
- [ ] Feed items can be marked as read
- [ ] @mentions work in discussions and trigger notifications
- [ ] Discussions support threaded replies
- [ ] Share modal tracks platform selection
- [ ] All shareable pages have proper OG tags

---

## Estimated Effort

2-3 implementation sessions
