# Next Tasks

Fast-scan index for task discovery. Pick a task, then check full acceptance criteria in the relevant docs (`docs/loan-system.md`, `docs/user-experience.md`, `docs/business-model.md`).

When a task is completed, move its row to the **Done** section at the bottom.

---

## Planned

### Phase 1 — Core Platform Completion

#### Epic 1: Advanced Microloan System (Tiers 2-5)

**Status: Complete** — See Plan 1 in `docs/plans/plan-01-advanced-microloans.md`

All tasks moved to Done section. Goal verification (DLG-LOAN-008) was already implemented as part of DLG-CORE-020.

#### Epic 2: Post-Cascade Impact Tracking

The docs emphasize "see exactly what happened" but there's no post-funding tracking system.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-IMPACT-001 | Project Updates entity — proposers post progress after funding | impact | Schema: ProjectUpdate |
| DLG-IMPACT-001a | Update types: text, photo, video, milestone, completion | impact | Enum + validation |
| DLG-IMPACT-001b | Updates API — CRUD for proposers, read for backers | impact | `/api/projects/[id]/updates` |
| DLG-IMPACT-002 | Project Updates UI — timeline on project detail page | impact | `src/components/projects/update-timeline.tsx` |
| DLG-IMPACT-002a | Update composer for proposers — rich text + media upload | impact | `src/components/projects/update-form.tsx` |
| DLG-IMPACT-002b | Notification to backers when new update posted | impact | Push + email digest |
| DLG-IMPACT-003 | Impact metrics system — proposers report outcomes | impact | Schema: ImpactMetric |
| DLG-IMPACT-003a | Metric templates per category — education (students served), environment (trees planted), etc. | impact | Pre-defined + custom |
| DLG-IMPACT-003b | Impact dashboard on project page | impact | `src/components/projects/impact-report-card.tsx` |
| DLG-IMPACT-004 | Project completion flow — final update + impact summary | impact | Required for "completed" status |
| DLG-IMPACT-004a | Completion certificate for backers — shareable image | impact | Canvas/SVG generation |
| DLG-IMPACT-004b | "Impact Witness" badge — received 5+ impact updates | impact | Badge engine integration |
| DLG-IMPACT-005 | Follow projects for updates — toggle on project page | impact | Schema: ProjectFollow |
| DLG-IMPACT-005a | Personal feed of followed project updates | impact | `/following` page enhancement |

#### Epic 3: Rally & Momentum System

The docs describe rally campaigns and momentum mechanics not yet built.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-RALLY-001 | Rally entity — time-bound campaign to hit funding milestone | rally | Schema: Rally |
| DLG-RALLY-001a | Rally fields: project, target (backers or amount), deadline, creator | rally | 24h-7d duration |
| DLG-RALLY-001b | Rally API — create, join, track progress | rally | `/api/rallies` |
| DLG-RALLY-002 | Rally creation UI — "Can we get 100 people behind this by Friday?" | rally | Modal from project page |
| DLG-RALLY-002a | Rally progress indicator on project cards | rally | Badge + progress bar |
| DLG-RALLY-002b | Rally celebration when target hit | rally | Animation + notification |
| DLG-RALLY-003 | Momentum scoring algorithm — calculate trending score | rally | `src/lib/momentum.ts` |
| DLG-RALLY-003a | Factors: recent backers, funding velocity, shares, rally activity | rally | Time-decayed weights |
| DLG-RALLY-003b | Momentum indicator component | rally | `src/components/projects/momentum-indicator.tsx` |
| DLG-RALLY-004 | Discovery feeds — Trending, Near You, Almost There, New | rally | Multi-tab `/discover` page |
| DLG-RALLY-004a | "Almost There" feed — projects at 75%+ funding | rally | High-priority discovery |
| DLG-RALLY-004b | Personalized feed based on interests and location | rally | User preference integration |
| DLG-RALLY-005 | Share tracking — count external shares per project | rally | Schema: ShareEvent |
| DLG-RALLY-005a | Share analytics on project dashboard (proposer view) | rally | Where shares came from |

---

### Phase 2 — Social & Engagement

#### Epic 4: Following & Social Features

The platform should feel like a community, not just a funding tool.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-SOCIAL-001 | Follow system — follow users, projects, communities | social | Schema: Follow (polymorphic) |
| DLG-SOCIAL-001a | Follow button component — reusable across entity types | social | `src/components/social/follow-button.tsx` |
| DLG-SOCIAL-001b | Following counts on profiles/pages | social | Display + API |
| DLG-SOCIAL-002 | Personal feed — updates from followed entities | social | `/following` page |
| DLG-SOCIAL-002a | Feed algorithm — chronological with activity grouping | social | Recent activity first |
| DLG-SOCIAL-002b | Feed item types: project update, cascade, community milestone, user action | social | Unified feed item component |
| DLG-SOCIAL-003 | Activity notifications for followed items | social | Push + in-app bell |
| DLG-SOCIAL-003a | Notification preferences — per entity type and channel | social | Settings integration |
| DLG-SOCIAL-004 | Enhanced share modal — social media with proper previews | social | `src/components/social/share-modal.tsx` |
| DLG-SOCIAL-004a | OG meta tags for all shareable pages | social | Dynamic metadata |
| DLG-SOCIAL-004b | Share templates with pre-filled text | social | Per entity type |
| DLG-SOCIAL-005 | Discussion threading — replies to community discussions | social | Currently flat comments |
| DLG-SOCIAL-005a | Discussion notifications — mentions, replies | social | @mention support |

#### Epic 5: Extended Badge System

Currently 9 badges; docs describe 25+ across 5 tiers.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-BADGE-001 | Complete badge definitions — all 5 tiers per docs | badges | `src/lib/badges-full.ts` |
| DLG-BADGE-001a | Tier 1 (First Drop): First Drop, Community Member, Profile Complete, Time Giver, First Referral | badges | 5 badges |
| DLG-BADGE-001b | Tier 2 (Stream): Steady Flow, Promoter, Proposer, Conversationalist, Week Streak | badges | 5 badges |
| DLG-BADGE-001c | Tier 3 (Creek): Project Backer x10, Social Butterfly, Storyteller, Month Streak, First Cascade | badges | 5 badges |
| DLG-BADGE-001d | Tier 4 (River): Community Builder, Serial Proposer, Impact Witness, Rallier, Six-Month Flow | badges | 5 badges |
| DLG-BADGE-001e | Tier 5 (Watershed): Movement Builder, Cascade Veteran, Catalyst, Year of Flow, Community Pillar | badges | 5 badges |
| DLG-BADGE-002 | Badge progress indicators — show % toward next badge | badges | `src/components/badges/badge-progress.tsx` |
| DLG-BADGE-002a | Progress tracking in badge engine | badges | Store partial progress |
| DLG-BADGE-003 | Legendary badge animations — special effects for Tier 5 | badges | Framer Motion sparkles |
| DLG-BADGE-003a | Badge showcase section on user profiles | badges | Highlight top badges |
| DLG-BADGE-004 | Streak improvements — 3-month, 6-month, yearly milestones | badges | Per user-experience.md |
| DLG-BADGE-004a | Streak recovery grace period — don't break on 1 missed day | badges | 48h grace |

---

### Phase 3 — Monetization & Transparency

#### Epic 6: Cascade Sponsorship & Notification Monetization

B2B revenue streams documented in business-model.md but not implemented.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-SPONSOR-001 | Cascade sponsorship entity — businesses co-brand cascade celebrations | sponsor | Schema: CascadeSponsor |
| DLG-SPONSOR-001a | Sponsorship tiers: $100 (logo), $250 (logo + message), $500 (featured) | sponsor | Per business-model.md |
| DLG-SPONSOR-001b | Sponsor selection per project category or location | sponsor | Targeting rules |
| DLG-SPONSOR-002 | Sponsored cascade celebration UI | sponsor | `src/components/cascade/sponsored-celebration.tsx` |
| DLG-SPONSOR-002a | Sponsor logo and message in cascade animation | sponsor | Tasteful integration |
| DLG-SPONSOR-002b | Sponsor attribution in cascade notifications | sponsor | "Cascade brought to you by..." |
| DLG-SPONSOR-003 | Admin cascade sponsorship management | sponsor | `/admin/sponsorships/cascade` |
| DLG-SPONSOR-003a | Sponsorship inventory and booking | sponsor | Calendar-based availability |
| DLG-SPONSOR-003b | Sponsor reporting — impressions, cascades sponsored | sponsor | Analytics dashboard |
| DLG-SPONSOR-004 | Push notification infrastructure | sponsor | Web push + service worker |
| DLG-SPONSOR-004a | Notification permission request flow | sponsor | Onboarding integration |
| DLG-SPONSOR-005 | Notification sponsorship — hyperlocal business placement | sponsor | "90% funded — 3 blocks from Joe's Coffee" |
| DLG-SPONSOR-005a | Notification sponsor targeting by location | sponsor | Geo-based matching |
| DLG-SPONSOR-005b | Admin notification sponsorship management | sponsor | `/admin/sponsorships/notifications` |

#### Epic 7: Custodial Float & Financial Transparency

The docs promise radical transparency about platform economics.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-TRANS-001 | Float income tracking — aggregate watershed balance interest | transparency | `src/lib/float-income.ts` |
| DLG-TRANS-001a | Daily balance snapshots for interest calculation | transparency | Cron job |
| DLG-TRANS-001b | Float income attribution (platform revenue, not user payout) | transparency | Per business-model.md |
| DLG-TRANS-002 | Platform transparency dashboard — public page | transparency | `/transparency` |
| DLG-TRANS-002a | Revenue breakdown: ads, directory, float, corporate, loans | transparency | Real-time stats |
| DLG-TRANS-002b | "Your watershed works twice" explainer | transparency | `src/components/transparency/float-explainer.tsx` |
| DLG-TRANS-003 | Annual transparency report generation | transparency | PDF export |
| DLG-TRANS-003a | Report sections: revenue, impact, costs, projections | transparency | Per business-model.md |
| DLG-TRANS-004 | Admin financials dashboard | transparency | `/admin/financials` |
| DLG-TRANS-004a | Revenue by stream over time | transparency | Charts + trends |
| DLG-TRANS-004b | Cost tracking and margin analysis | transparency | Internal only |

---

### Phase 4 — Future Enhancements

#### Epic 8: Family Accounts & Shared Giving

Mentioned in docs for "established professional" persona (David, 45).

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-FAMILY-001 | Family/household entity — group accounts under one umbrella | family | Schema: Family, FamilyMember |
| DLG-FAMILY-001a | Family admin role — manage members, set controls | family | Permission system |
| DLG-FAMILY-002 | Shared watershed option — pool family contributions | family | Optional per-family setting |
| DLG-FAMILY-002a | Individual vs shared watershed toggle | family | Settings UI |
| DLG-FAMILY-003 | Parental controls — spending limits, category restrictions | family | Per-child settings |
| DLG-FAMILY-003a | Activity visibility — parents see kids' giving history | family | Dashboard integration |
| DLG-FAMILY-004 | Family giving goals — collective targets | family | Similar to community goals |
| DLG-FAMILY-004a | Family impact report — combined family stats | family | `/family/impact` |
| DLG-FAMILY-005 | Tax documentation — family contribution summaries | family | PDF export per tax year |
| DLG-FAMILY-006 | "Family" badge category — badges earned together | family | New badge tier |

#### Epic 9: Mobile & PWA Enhancements

Not explicitly documented but implied by "engaging, daily habit" vision.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-MOBILE-001 | PWA manifest and service worker | mobile | Installable app |
| DLG-MOBILE-001a | Offline capability — cached pages, queued actions | mobile | Service worker caching |
| DLG-MOBILE-002 | Mobile-optimized layouts — all key flows | mobile | Responsive audit |
| DLG-MOBILE-002a | Touch-friendly controls — larger tap targets | mobile | Accessibility |
| DLG-MOBILE-003 | Push notification integration with PWA | mobile | Web push API |
| DLG-MOBILE-003a | Notification deep links to relevant pages | mobile | Route handling |
| DLG-MOBILE-004 | App-like navigation — bottom tabs on mobile | mobile | Conditional layout |
| DLG-MOBILE-004a | Pull-to-refresh on feed pages | mobile | Native feel |

---

## Done

| ID | Title | Epic | Completed |
|----|-------|------|-----------|
| DLG-CORE-001 | MVP app with core giving loop | core | 2026-02-06 |
| DLG-CORE-002 | User Profile Page | core | 2026-02-06 |
| DLG-CORE-003 | Admin Create/Edit Projects | admin | 2026-02-06 |
| DLG-CORE-004 | Project Search & Filtering | discovery | 2026-02-06 |
| DLG-CORE-005 | Cascade Stage Notifications | engagement | 2026-02-06 |
| DLG-CORE-006 | Microloans (Tier 1) | loans | 2026-02-06 |
| DLG-CORE-007 | Referral System | growth | 2026-02-06 |
| DLG-CORE-008 | Gamification (9 badges, streaks) | engagement | 2026-02-06 |
| DLG-CORE-009 | Community Features | community | 2026-02-06 |
| DLG-CORE-010 | Role System Overhaul | admin | 2026-02-06 |
| DLG-CORE-011 | Loan Sponsorship | loans | 2026-02-06 |
| DLG-CORE-012 | Community Elections | community | 2026-02-06 |
| DLG-CORE-013 | Role-Gated UI | admin | 2026-02-06 |
| DLG-CORE-014 | Aquifer System | flagship | 2026-02-06 |
| DLG-CORE-015 | Community Enhancement Features | community | 2026-02-06 |
| DLG-CORE-016 | Project Proposal System | proposals | 2026-02-06 |
| DLG-CORE-017 | Business Directory System | directory | 2026-02-06 |
| DLG-CORE-018 | User Onboarding & UX | onboarding | 2026-02-06 |
| DLG-CORE-019 | Enhanced Analytics & Impact Reporting | analytics | 2026-02-06 |
| DLG-CORE-020 | Enhanced Microloan Features | loans | 2026-02-06 |
| DLG-CORE-021 | Corporate ESG & Matching Campaigns | matching | 2026-02-06 |
| DLG-LOAN-001 | Credit progression system | loans | 2026-02-06 |
| DLG-LOAN-001a | Tier unlock logic | loans | 2026-02-06 |
| DLG-LOAN-001b | Credit limit display | loans | 2026-02-06 |
| DLG-LOAN-002 | Higher tier loan applications | loans | 2026-02-06 |
| DLG-LOAN-002a | Extended repayment terms per tier | loans | 2026-02-06 |
| DLG-LOAN-002b | Funding deadline scaling per tier | loans | 2026-02-06 |
| DLG-LOAN-003 | Stretch goals system | loans | 2026-02-06 |
| DLG-LOAN-003a | Stretch goal funding logic | loans | 2026-02-06 |
| DLG-LOAN-003b | Stretch goal UI | loans | 2026-02-06 |
| DLG-LOAN-004 | Sponsor deadline extensions | loans | 2026-02-06 |
| DLG-LOAN-004a | Extension request UI | loans | 2026-02-06 |
| DLG-LOAN-005 | Refinancing system | loans | 2026-02-06 |
| DLG-LOAN-005a | Refinancing fee calculation | loans | 2026-02-06 |
| DLG-LOAN-005b | Refinancing UI | loans | 2026-02-06 |
| DLG-LOAN-005c | Refinancing term exceptions | loans | 2026-02-06 |
| DLG-LOAN-006 | Default escalation timeline | loans | 2026-02-06 |
| DLG-LOAN-006a | Status transitions | loans | 2026-02-06 |
| DLG-LOAN-006b | Admin at-risk dashboard | loans | 2026-02-06 |
| DLG-LOAN-007 | Default recovery paths | loans | 2026-02-06 |
| DLG-LOAN-007a | Credit halving after recovery | loans | 2026-02-06 |
| DLG-LOAN-007b | Sponsor track record restoration | loans | 2026-02-06 |
