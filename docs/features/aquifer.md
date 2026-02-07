# Aquifer — Deluge Flagship Projects

## Overview

The Aquifer is Deluge's mechanism for proposing and funding flagship projects that embody the platform's mission. It surfaces transformative ideas the public might not consider organically, while letting the community validate them through funding and voting.

**Core principle:** Deluge as curator, community as validator.

---

## Two Funds

### Reserve (Deluge-Directed)

| Aspect | Detail |
|--------|--------|
| **Funding source** | Deluge only (CFO directs allocation) |
| **Allocation method** | Deluge decides — no vote required |
| **Use cases** | Direct project funding, contribution matching |

### Pool (Community-Governed)

| Aspect | Detail |
|--------|--------|
| **Funding source** | Anyone — users and Deluge can contribute |
| **Allocation method** | Community Ripple vote |
| **Deluge's say** | None once funds enter Pool |
| **Legitimacy** | Users voting on pooled funds, democratic process |

---

## Flagship Projects

Projects proposed by Deluge that align with the mission of empowering communities and transforming society.

### Characteristics

- **Origin:** Proposed by Deluge (not community members)
- **Scope:** Often cross-watershed, systemic, or infrastructure-focused
- **Visibility:** Featured on dedicated Aquifer page
- **Badge:** "Deluge Flagship" designation

### Funding Paths

1. **Direct funding** — Deluge proposes + funds from Reserve → ships immediately, no vote
2. **Pool allocation** — Funded via Community Ripple vote from Pool
3. **Matching** — Deluge matches user contributions (matching funds from Reserve, vote required)
4. **Community elevation** — Regular project receives Pool funds → auto-becomes Flagship

---

## Community Ripple (Voting)

The democratic process for allocating Pool funds.

### Eligibility

- Must have **Verified Giver** role (minimum ~$1.25 contributed)
- 1 user, 1 vote

### Mechanics

- **Voting window:** 30 days from proposal
- **Approval threshold:** 66% of participating voters
- **Options:** Approve / Reject / Table

### Tabling

- Tabled projects remain visible in "Considered" section
- **Reactivation:** 10% of vote-quorum users must sponsor the idea
- "Sponsor" button available — low-commitment signal of interest
- No limit on re-proposals, but requires community momentum

---

## Graduation Path

Regular community projects can be elevated to Flagship status:

1. **Deluge nomination** — Deluge identifies mission-aligned community projects
2. **Community elevation** — Users direct Pool funds to a regular project → auto-becomes Flagship

Benefits of Flagship status:
- Visibility on Aquifer page
- Eligible for Reserve matching
- "Deluge Flagship" badge

---

## Page Structure

### `/aquifer` — Main Page

- Hero: Aquifer mission statement
- Fund overview: Reserve + Pool balances (Pool transparent, Reserve optional)
- Active Flagship projects (votable and direct-funded)
- "Contribute to Pool" CTA
- Link to Considered/Tabled section

### `/aquifer/[id]` — Flagship Project Detail

- Project info (title, description, category, funding goal)
- Funding progress + source breakdown (Reserve vs Pool vs User contributions)
- If votable: voting UI with countdown
- Cascade stage indicator
- Contribute button

### `/aquifer/considered` — Tabled Ideas

- List of tabled projects
- Sponsor count + threshold progress (X/Y to reactivate)
- "Sponsor" button for each

### Admin: `/admin/aquifer`

- Fund management (Reserve + Pool balances)
- Propose new Flagship project
- Table/archive projects
- Nominate community projects for Flagship
- View voting results

---

## Data Model Additions

### New Tables

```
Aquifer
- id
- type: "reserve" | "pool"
- balance: Decimal
- updatedAt

AquiferContribution
- id
- aquiferId (FK)
- userId (FK, nullable for Deluge contributions)
- amount: Decimal
- isDeluge: Boolean
- createdAt

FlagshipProject
- id
- projectId (FK to Project)
- status: "active" | "voting" | "funded" | "tabled" | "rejected"
- fundingSource: "reserve" | "pool" | "mixed"
- votingEndsAt: DateTime (nullable)
- tabledAt: DateTime (nullable)
- createdAt

FlagshipVote
- id
- flagshipProjectId (FK)
- userId (FK)
- vote: "approve" | "reject" | "table"
- createdAt

FlagshipSponsor
- id
- flagshipProjectId (FK)
- userId (FK)
- createdAt
```

### Project Table Addition

```
Project
+ isFlagship: Boolean (default false)
```

---

## Business Rules

1. **Voting quorum:** 66% approval of participating Verified Givers
2. **Voting window:** 30 days
3. **Reactivation threshold:** 10% of last vote's participant count
4. **Matching source:** Always from Reserve
5. **Pool integrity:** Deluge can contribute but cannot vote or direct Pool funds
6. **CFO role:** Manages Reserve allocation, Pool contribution decisions

---

## UI Components Needed

- `AquiferHero` — Mission statement + fund overview
- `FlagshipProjectCard` — Project card with voting/funding state
- `PoolContributeModal` — Contribute to Pool flow
- `CommunityRippleVote` — Voting UI (approve/reject/table)
- `SponsorButton` — For tabled projects
- `AquiferFundManager` — Admin fund management
- `FlagshipBadge` — Visual badge for flagship projects

---

## Future Considerations

- Quarterly voting cycles vs. continuous
- Vote delegation / liquid democracy
- Reserve transparency settings (public vs. private balance)
- Notification system for vote reminders
- Analytics: Pool contribution trends, vote participation rates
