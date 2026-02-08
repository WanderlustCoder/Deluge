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

#### Epic 5: Recognition & Milestone Badges

**Status: Complete** — See Plan 5 in `docs/plans/plan-05-badges-gamification.md`

25 badges across 5 categories (not tiers). No streaks, no progress bars, no "almost there" pressure.
Anniversary badges replace streak badges. Badges are recognition, not goals to chase.

Categories: Getting Started, Community Connection, Project Impact, Sharing & Growth, Giving Journey

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

**Status: Complete** — See Plan 9 in `docs/plans/plan-09-pwa-mobile.md`

All tasks moved to Done section.

---

### Phase 5 — Extended Features (New Plans)

#### Epic 10: Tax & Giving Documentation

**Status: Complete** — See Plan 10 in `docs/plans/plan-10-tax-documentation.md`

Contribution receipts with PDF generation, annual giving summaries, tax deductibility tracking.
All tasks moved to Done section.

See full plan: `docs/plans/plan-10-tax-documentation.md`

#### Epic 11: Recurring Giving & Subscriptions

**Status: Complete** — See Plan 11 in `docs/plans/plan-11-recurring-giving.md`

Recurring watershed contributions, project/community subscriptions, personal giving goals.
All tasks moved to Done section.

See full plan: `docs/plans/plan-11-recurring-giving.md`

#### Epic 12: Volunteer Hours & In-Kind Contributions

**Status: Complete** — See Plan 12 in `docs/plans/plan-12-volunteer-contributions.md`

Volunteer opportunities, hour logging, skills marketplace, in-kind donations, volunteer badges.
All tasks moved to Done section.

See full plan: `docs/plans/plan-12-volunteer-contributions.md`

#### Epic 13: Corporate Employee Portal

**Status: Complete** — See Plan 13 in `docs/plans/plan-13-corporate-portal.md`

White-label employer dashboards, team giving, ESG reporting.
All tasks moved to Done section.

See full plan: `docs/plans/plan-13-corporate-portal.md`

#### Epic 14: Giving Circles

**Status: Complete** — See Plan 14 in `docs/plans/plan-14-giving-circles.md`

Group pooled giving, collective decision making, circle voting.
All tasks moved to Done section.

See full plan: `docs/plans/plan-14-giving-circles.md`

#### Epic 15: Seasonal & Event-Driven Giving

**Status: Complete** — See Plan 15 in `docs/plans/plan-15-seasonal-giving.md`

Giving occasions, gift contributions, birthday fundraisers, emergency campaigns, giving calendar, seasonal campaigns.
All tasks moved to Done section.

See full plan: `docs/plans/plan-15-seasonal-giving.md`

#### Epic 16: Credit Bureau Reporting

**Status: Complete** — See Plan 16 in `docs/plans/plan-16-credit-bureau.md`

Metro 2 format credit bureau reporting with FCRA compliance, consent management, dispute resolution, user credit dashboard, and admin reporting tools.
All tasks moved to Done section.

See full plan: `docs/plans/plan-16-credit-bureau.md`

#### Epic 17: Community Advocates

**Status: Complete** — See Plan 17 in `docs/plans/plan-17-ambassador-program.md`

Non-gamified advocate program: interest expression, activity logging (no quotas), events, resources (no tiers), alphabetical directory (no rankings), genuine appreciation.
All tasks moved to Done section.

See full plan: `docs/plans/plan-17-ambassador-program.md`

#### Epic 18: Project Verification & Auditing

**Status: Complete** — See Plan 18 in `docs/plans/plan-18-project-verification.md`

4-tier verification levels, identity/organization verification, community verification of outcomes, third-party audits, fraud detection with flag system, trust scores.
All tasks moved to Done section.

See full plan: `docs/plans/plan-18-project-verification.md`

#### Epic 19: Developer API & Integrations

**Status: Complete** — Public API and integration ecosystem for developers.

All tasks moved to Done section.

See full plan: `docs/plans/plan-19-developer-api.md`

#### Epic 20: Smart Discovery & Recommendations

**Status: Complete** — See Plan 20 in `docs/plans/plan-20-smart-discovery.md`

User interest profiling, collaborative filtering, content-based filtering, hybrid recommendations, personalized feeds (For You, Nearby, Trending, New), project-user matching, discovery challenges.
All tasks moved to Done section.

See full plan: `docs/plans/plan-20-smart-discovery.md`

#### Epic 21: Learning Resources & Financial Literacy

**Status: Complete** — See Plan 21 in `docs/plans/plan-21-learning-literacy.md`

Resource library, budget planner, tax info, reflection journal, decision scenarios, study circles, optional certificates. No progress tracking, no gamification.
All tasks moved to Done section.

See full plan: `docs/plans/plan-21-learning-literacy.md`

#### Epic 22: Institutional Partnerships

**Status: Complete** — See Plan 22 in `docs/plans/plan-22-institutional-partnerships.md`

Multi-tenant white-label platform with tenant resolution, custom branding, institution management, university/city/foundation features, reporting framework.
All tasks moved to Done section.

See full plan: `docs/plans/plan-22-institutional-partnerships.md`

#### Epic 23: Mentorship & Community Support

**Status: Complete** — See Plan 23 in `docs/plans/plan-23-mentorship-program.md`

Mentor/mentee profiles, smart matching algorithm, messaging, goal tracking, support groups, admin review.
All tasks moved to Done section.

See full plan: `docs/plans/plan-23-mentorship-program.md`

#### Epic 24: Impact Storytelling & Social Proof

**Status: Complete** — See Plan 24 in `docs/plans/plan-24-impact-storytelling.md`

Stories submission/display, testimonials, platform impact metrics, admin moderation tools.
All tasks moved to Done section.

See full plan: `docs/plans/plan-24-impact-storytelling.md`

#### Epic 25: Accessibility & Internationalization

**Status: Complete** — See Plan 25 in `docs/plans/plan-25-accessibility-i18n.md`

Schema for translations and a11y preferences, keyboard/color/motion utilities, i18n with 7 locales + RTL support, accessibility settings page, locale preferences API.
All tasks moved to Done section.

See full plan: `docs/plans/plan-25-accessibility-i18n.md`

#### Epic 26: Grants & Large Funding Programs

**Status: Complete** — See Plan 26 in `docs/plans/plan-26-grants-programs.md`

Grant programs with applications, reviews, awards, and disbursements. All core schema and functionality implemented.
All tasks moved to Done section.

See full plan: `docs/plans/plan-26-grants-programs.md`

#### Epic 27: Blockchain Transparency Ledger

**Status: Complete** — See Plan 27 in `docs/plans/plan-27-blockchain-transparency.md`

TransparencyRecord, TransparencyAnchor, TransparencyProof, ImpactCertificate, OrganizationLedger, LedgerEntry schema. SHA-256 hashing, Merkle tree construction, multi-chain abstraction (Ethereum, Polygon, Solana), proof generation/verification, impact certificates, public verification page, admin blockchain dashboard.
All tasks moved to Done section.

See full plan: `docs/plans/plan-27-blockchain-transparency.md`

#### Epic 28: AI-Powered Platform Features

**Status: Complete** — See Plan 28 in `docs/plans/plan-28-ai-features.md`

ContentFlag, SearchEmbedding, ProjectPrediction, AIAssistanceLog, AIConversation, TrendAnalysis schema. Content moderation with pattern detection, recommendations engine (personalized, similar, trending), content assistance for descriptions/grants, project success predictions, admin moderation dashboard.
All tasks moved to Done section.

See full plan: `docs/plans/plan-28-ai-features.md`

#### Epic 29: Community Marketplace

**Status: Complete** — See Plan 29 in `docs/plans/plan-29-community-marketplace.md`

MarketplaceListing, ListingCategory, ListingInquiry, InquiryMessage, ListingOffer, MarketplaceTransaction, MarketplaceReview, MarketplaceDispute, CommunityWish schema. Listings CRUD with search/filter, inquiries/messaging, offers with counter-offers, transactions with status flow, marketplace browse/detail/create pages.
All tasks moved to Done section.

See full plan: `docs/plans/plan-29-community-marketplace.md`

#### Epic 30: Fundraising Events & Ticketing

**Status: Complete** — See Plan 30 in `docs/plans/plan-30-fundraising-events.md`

FundraisingEvent, EventTicketType, EventTicket, EventRegistration, EventDonation, EventMatch, AuctionItem, AuctionBid, EventParticipant, EventGroup, EventGroupMember, EventVolunteer, EventSponsor, EventUpdate schema. Event CRUD, ticket management, registrations, donations with matching, auctions with bidding, collective progress display (no individual rankings), event browse/detail pages.
All tasks moved to Done section.

See full plan: `docs/plans/plan-30-fundraising-events.md`

#### Epic 31: Pledge & Crowdfunding Campaigns

**Status: Complete** — See Plan 31 in `docs/plans/plan-31-pledge-campaigns.md`

Kickstarter-style pledge campaigns with all-or-nothing, flexible, and milestone funding types.

PledgeCampaign, Pledge, CampaignReward, RewardFulfillment, CampaignUpdate, CampaignComment schema. Campaign CRUD, pledge management, rewards with fulfillment tracking, stretch goals, campaign updates, comments, backer wall, settlement system for collecting/releasing pledges, campaign listing and detail pages, pledges page.

All tasks moved to Done section.

See full plan: `docs/plans/plan-31-pledge-campaigns.md`

#### Epic 32: Gift Cards & Store Credit

**Status: Complete** — See Plan 32 in `docs/plans/plan-32-gift-cards.md`

Gift card system with store credit and promotional codes.

GiftCard, GiftCardDesign, GiftCardTransaction, GiftCardOrder, StoreCredit, StoreCreditTransaction, PromoCode, PromoCodeUsage schema. Gift card purchase and redemption, store credit management, promo code validation and application, bulk order discounts. Gift card API routes, store credit API routes, promo code management. Store credit page at `/account/store-credit`, gift card purchase page at `/give/giftcards` with design selection, denomination options, and balance check.

All tasks moved to Done section.

See full plan: `docs/plans/plan-32-gift-cards.md`

#### Epic 33: Nonprofit Partner Portal

**Status: Complete** — See Plan 33 in `docs/plans/plan-33-nonprofit-portal.md`

Dedicated dashboard for nonprofit organizations.

NonprofitOrganization, OrganizationMember, OrganizationDocument, OrganizationDonation, DonorRelationship, OrganizationReport, OrganizationActivity, OrganizationIntegration schema. Organization CRUD with slug-based routing, member management with role hierarchy (owner/admin/member/viewer), document upload and verification workflow, donor tracking with segment calculation, donation management with acknowledgments. Organization API routes, members route, donors route. Organization registration wizard at `/organizations/register`, organization dashboard at `/org/[slug]`.

All tasks moved to Done section.

See full plan: `docs/plans/plan-33-nonprofit-portal.md`

#### Epic 34: Advanced Analytics & BI

**Status: Complete** — See Plan 34 in `docs/plans/plan-34-advanced-analytics.md`

Comprehensive analytics and business intelligence platform.

AnalyticsEvent, UserSession, MetricSnapshot, Dashboard, DashboardWidget, DashboardShare, AnalyticsFunnel, SavedQuery, Anomaly schema. Event tracking with context enrichment, daily metric computation (active users, revenue, projects), metric history retrieval, dashboard CRUD with widget management, share permissions. Event tracking API, dashboard API, admin analytics page with platform overview, weekly averages, and active user charts.

All tasks moved to Done section.

See full plan: `docs/plans/plan-34-advanced-analytics.md`

#### Epic 35: Multi-Currency & Global Expansion

**Status: Complete** — See Plan 35 in `docs/plans/plan-35-multi-currency.md`

International giving with multi-currency support. Currency management, exchange rates, conversion, region detection, preferences.
All tasks moved to Done section.

See full plan: `docs/plans/plan-35-multi-currency.md`

#### Epic 36: Notification & Communication Center

**Status: Complete** — See Plan 36 in `docs/plans/plan-36-notification-center.md`

Comprehensive notification system with multi-channel delivery. Notification types, channels, delivery system, inbox page, bulk actions.
All tasks moved to Done section.

See full plan: `docs/plans/plan-36-notification-center.md`

#### Epic 37: Social Media Integration

**Status: Complete** — See Plan 37 in `docs/plans/plan-37-social-integrations.md`

Deep integration with social platforms for sharing and authentication. Social accounts, sharing system, share buttons/modal, connected accounts page.
All tasks moved to Done section.

See full plan: `docs/plans/plan-37-social-integrations.md`

#### Epic 38: Community Celebrations & Milestones

**Status: Complete** — See Plan 38 in `docs/plans/plan-38-gamified-challenges.md`

Celebration engine for community growth and collective achievements (no addictive mechanics).
Milestone definitions, personal & community milestone tracking, shared journeys for collaborative goals.
All tasks moved to Done section.

See full plan: `docs/plans/plan-38-gamified-challenges.md`

#### Epic 39: Data Privacy & Security

**Status: Complete** — See Plan 39 in `docs/plans/plan-39-privacy-security.md`

Comprehensive privacy and security framework with GDPR/CCPA compliance.
UserConsent, ConsentPolicy, PrivacySettings, DataRequest, SecurityEvent, SecuritySession, TwoFactorAuth, SecurityAuditLog, RateLimit, SuspiciousActivity, AccountRecovery models.
Privacy consent, settings, export, deletion libraries. Security 2FA, sessions, audit, fraud detection libraries.
Privacy and security settings pages.
All tasks moved to Done section.

See full plan: `docs/plans/plan-39-privacy-security.md`

#### Epic 40: Admin Automation & Workflows

**Status: Complete** — See Plan 40 in `docs/plans/plan-40-admin-automation.md`

Automate admin tasks and create approval workflows.
Automation, AutomationRun, AdminWorkflow, WorkflowInstance, WorkflowApproval, ScheduledTask, TaskRun, BusinessRule, RuleEvaluation, BulkOperation, WorkQueue, QueueItem models.
Automation engine, workflow management, task scheduler, rules engine, bulk operations, queue management libraries.
Admin operations dashboard with pending approvals, active automations, scheduled tasks.
All tasks moved to Done section.

See full plan: `docs/plans/plan-40-admin-automation.md`

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
| DLG-CORE-008 | Recognition System (badges, milestones) | engagement | 2026-02-06 |
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
| DLG-IMPACT-001 | Impact tracking system (Plan 2) | impact | 2026-02-07 |
| DLG-RALLY-001 | Rally & momentum system (Plan 3) | rally | 2026-02-07 |
| DLG-SOCIAL-001 | Following & social features (Plan 4) | social | 2026-02-07 |
| DLG-BADGE-001 | Recognition & milestone badges (Plan 5) | badges | 2026-02-07 |
| DLG-SPONSOR-001 | Sponsorships & notifications (Plan 6) | sponsor | 2026-02-07 |
| DLG-TRANS-001 | Financial transparency (Plan 7) | transparency | 2026-02-07 |
| DLG-FAMILY-001 | Family accounts (Plan 8) | family | 2026-02-07 |
| DLG-MOBILE-001 | PWA/Mobile experience (Plan 9) | mobile | 2026-02-07 |
| DLG-TAX-001 | Tax & giving documentation (Plan 10) | tax | 2026-02-07 |
| DLG-RECUR-001 | Recurring giving & subscriptions (Plan 11) | recurring | 2026-02-07 |
| DLG-VOLUNTEER-001 | Volunteer hours & in-kind contributions (Plan 12) | volunteer | 2026-02-07 |
| DLG-CORP-001 | Corporate employee portal (Plan 13) | corporate | 2026-02-07 |
| DLG-CIRCLE-001 | Giving circles (Plan 14) | circles | 2026-02-07 |
| DLG-SEASON-001 | Seasonal & event-driven giving (Plan 15) | seasonal | 2026-02-07 |
| DLG-CREDIT-001 | Credit bureau reporting (Plan 16) | credit | 2026-02-07 |
| DLG-ADV-001 | Community advocates program (Plan 17) | advocates | 2026-02-07 |
| DLG-VERIFY-001 | Project verification & auditing (Plan 18) | verification | 2026-02-07 |
| DLG-API-001 | API key management (Plan 19) | api | 2026-02-07 |
| DLG-API-002 | Rate limiting (Plan 19) | api | 2026-02-07 |
| DLG-API-003 | Public API v1 endpoints (Plan 19) | api | 2026-02-07 |
| DLG-API-004 | Webhooks (Plan 19) | api | 2026-02-07 |
| DLG-API-005 | OAuth provider (Plan 19) | api | 2026-02-07 |
| DLG-API-006 | Embeddable widgets (Plan 19) | api | 2026-02-07 |
| DLG-API-007 | Developer portal and docs (Plan 19) | api | 2026-02-07 |
| DLG-REC-001 | User interest profiling (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-002 | Collaborative filtering (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-003 | Content-based filtering (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-004 | Hybrid recommendations (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-005 | Personalized feeds (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-006 | Project-user matching (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-007 | Discovery challenges (Plan 20) | recommendations | 2026-02-07 |
| DLG-REC-008 | Recommendation analytics (Plan 20) | recommendations | 2026-02-07 |
| DLG-LEARN-001 | Resource library (Plan 21) | learning | 2026-02-07 |
| DLG-LEARN-002 | Budget planner & tax info (Plan 21) | learning | 2026-02-07 |
| DLG-LEARN-003 | Reflection journal (Plan 21) | learning | 2026-02-07 |
| DLG-LEARN-004 | Decision scenarios (Plan 21) | learning | 2026-02-07 |
| DLG-LEARN-005 | Study circles (Plan 21) | learning | 2026-02-07 |
| DLG-LEARN-006 | Optional certificates (Plan 21) | learning | 2026-02-07 |
| DLG-INST-001 | Multi-tenant foundation (Plan 22) | institutional | 2026-02-07 |
| DLG-INST-002 | White-label branding (Plan 22) | institutional | 2026-02-07 |
| DLG-INST-003 | Institution admin portal (Plan 22) | institutional | 2026-02-07 |
| DLG-INST-004 | Reporting framework (Plan 22) | institutional | 2026-02-07 |
| DLG-INST-005 | Institution-specific settings (Plan 22) | institutional | 2026-02-07 |
| DLG-MENTOR-001 | Mentor profiles and applications (Plan 23) | mentorship | 2026-02-07 |
| DLG-MENTOR-002 | Smart matching algorithm (Plan 23) | mentorship | 2026-02-07 |
| DLG-MENTOR-003 | Mentorship messaging (Plan 23) | mentorship | 2026-02-07 |
| DLG-MENTOR-004 | Mentee goal tracking (Plan 23) | mentorship | 2026-02-07 |
| DLG-MENTOR-005 | Support groups (Plan 23) | mentorship | 2026-02-07 |
| DLG-MENTOR-006 | Admin mentor review (Plan 23) | mentorship | 2026-02-07 |
| DLG-STORY-001 | Story collection system (Plan 24) | stories | 2026-02-07 |
| DLG-STORY-002 | Testimonials (Plan 24) | stories | 2026-02-07 |
| DLG-STORY-003 | Story display (Plan 24) | stories | 2026-02-07 |
| DLG-STORY-004 | Platform impact metrics (Plan 24) | stories | 2026-02-07 |
| DLG-STORY-005 | Admin stories/testimonials management (Plan 24) | stories | 2026-02-07 |
| DLG-A11Y-001 | Accessibility utilities (Plan 25) | a11y | 2026-02-07 |
| DLG-A11Y-002 | A11y components (Plan 25) | a11y | 2026-02-07 |
| DLG-A11Y-003 | Accessibility preferences (Plan 25) | a11y | 2026-02-07 |
| DLG-I18N-001 | i18n infrastructure (Plan 25) | i18n | 2026-02-07 |
| DLG-I18N-002 | Locale detection and formatting (Plan 25) | i18n | 2026-02-07 |
| DLG-I18N-003 | Translation system (Plan 25) | i18n | 2026-02-07 |
| DLG-GRANT-001 | Grant program foundation (Plan 26) | grants | 2026-02-07 |
| DLG-GRANT-002 | Application system (Plan 26) | grants | 2026-02-07 |
| DLG-GRANT-003 | Review system (Plan 26) | grants | 2026-02-07 |
| DLG-GRANT-004 | Awards & disbursements (Plan 26) | grants | 2026-02-07 |
| DLG-BLOCK-001 | Transparency records & hashing (Plan 27) | blockchain | 2026-02-07 |
| DLG-BLOCK-002 | Merkle tree & proofs (Plan 27) | blockchain | 2026-02-07 |
| DLG-BLOCK-003 | Multi-chain anchoring (Plan 27) | blockchain | 2026-02-07 |
| DLG-BLOCK-004 | Impact certificates (Plan 27) | blockchain | 2026-02-07 |
| DLG-BLOCK-005 | Verification page & admin (Plan 27) | blockchain | 2026-02-07 |
| DLG-AI-001 | Content moderation (Plan 28) | ai | 2026-02-07 |
| DLG-AI-002 | Recommendations engine (Plan 28) | ai | 2026-02-07 |
| DLG-AI-003 | Content assistance (Plan 28) | ai | 2026-02-07 |
| DLG-AI-004 | Project predictions (Plan 28) | ai | 2026-02-07 |
| DLG-AI-005 | Admin moderation dashboard (Plan 28) | ai | 2026-02-07 |
| DLG-MARKET-001 | Marketplace foundation (Plan 29) | marketplace | 2026-02-07 |
| DLG-MARKET-002 | Inquiries & messaging (Plan 29) | marketplace | 2026-02-07 |
| DLG-MARKET-003 | Offers & negotiation (Plan 29) | marketplace | 2026-02-07 |
| DLG-MARKET-004 | Transactions (Plan 29) | marketplace | 2026-02-07 |
| DLG-MARKET-005 | Marketplace UI (Plan 29) | marketplace | 2026-02-07 |
| DLG-EVENT-001 | Event foundation (Plan 30) | events | 2026-02-07 |
| DLG-EVENT-002 | Ticketing system (Plan 30) | events | 2026-02-07 |
| DLG-EVENT-003 | Registrations (Plan 30) | events | 2026-02-07 |
| DLG-EVENT-004 | Donations & matching (Plan 30) | events | 2026-02-07 |
| DLG-EVENT-005 | Auctions & bidding (Plan 30) | events | 2026-02-07 |
| DLG-EVENT-006 | Event pages (Plan 30) | events | 2026-02-07 |
| DLG-PLEDGE-001 | Pledge campaign foundation (Plan 31) | pledges | 2026-02-07 |
| DLG-PLEDGE-002 | Pledges & tiers (Plan 31) | pledges | 2026-02-07 |
| DLG-PLEDGE-003 | Campaign progress (Plan 31) | pledges | 2026-02-07 |
| DLG-PLEDGE-004 | Campaign settlement (Plan 31) | pledges | 2026-02-07 |
| DLG-PLEDGE-005 | Campaign UI (Plan 31) | pledges | 2026-02-07 |
| DLG-GIFT-001 | Gift cards foundation (Plan 32) | giftcards | 2026-02-07 |
| DLG-GIFT-002 | Store credit system (Plan 32) | giftcards | 2026-02-07 |
| DLG-GIFT-003 | Promo codes (Plan 32) | giftcards | 2026-02-07 |
| DLG-GIFT-004 | Gift card UI (Plan 32) | giftcards | 2026-02-07 |
| DLG-ORG-001 | Nonprofit organization foundation (Plan 33) | organizations | 2026-02-07 |
| DLG-ORG-002 | Organization members (Plan 33) | organizations | 2026-02-07 |
| DLG-ORG-003 | Donor relationships (Plan 33) | organizations | 2026-02-07 |
| DLG-ORG-004 | Organization portal (Plan 33) | organizations | 2026-02-07 |
| DLG-ANALYTICS-001 | Analytics events system (Plan 34) | analytics | 2026-02-07 |
| DLG-ANALYTICS-002 | Metric snapshots (Plan 34) | analytics | 2026-02-07 |
| DLG-ANALYTICS-003 | Dashboards & widgets (Plan 34) | analytics | 2026-02-07 |
| DLG-ANALYTICS-004 | Analytics admin page (Plan 34) | analytics | 2026-02-07 |
| DLG-CURRENCY-001 | Currency foundation (Plan 35) | currency | 2026-02-07 |
| DLG-CURRENCY-002 | Exchange rates (Plan 35) | currency | 2026-02-07 |
| DLG-CURRENCY-003 | Currency conversion (Plan 35) | currency | 2026-02-07 |
| DLG-CURRENCY-004 | Region management (Plan 35) | currency | 2026-02-07 |
| DLG-CURRENCY-005 | Currency preferences (Plan 35) | currency | 2026-02-07 |
| DLG-NOTIF-001 | Notification infrastructure (Plan 36) | notifications | 2026-02-07 |
| DLG-NOTIF-002 | Notification delivery system (Plan 36) | notifications | 2026-02-07 |
| DLG-NOTIF-003 | Notification channels (Plan 36) | notifications | 2026-02-07 |
| DLG-NOTIF-004 | Notification inbox (Plan 36) | notifications | 2026-02-07 |
| DLG-NOTIF-005 | Bulk notification actions (Plan 36) | notifications | 2026-02-07 |
| DLG-SOCIAL-001 | Social accounts (Plan 37) | social | 2026-02-07 |
| DLG-SOCIAL-002 | Social sharing (Plan 37) | social | 2026-02-07 |
| DLG-SOCIAL-003 | Share buttons & modal (Plan 37) | social | 2026-02-07 |
| DLG-SOCIAL-004 | Connected accounts page (Plan 37) | social | 2026-02-07 |
| DLG-CELEB-001 | Milestone definitions (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-002 | Personal & community milestones (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-003 | Shared journeys (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-004 | Milestones API (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-005 | Journeys API (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-006 | Milestone card component (Plan 38) | celebrations | 2026-02-07 |
| DLG-CELEB-007 | Journeys page (Plan 38) | celebrations | 2026-02-07 |
| DLG-SEC-001 | Privacy consent system (Plan 39) | security | 2026-02-07 |
| DLG-SEC-002 | Privacy settings (Plan 39) | security | 2026-02-07 |
| DLG-SEC-003 | Data export & access (Plan 39) | security | 2026-02-07 |
| DLG-SEC-004 | Account deletion (Plan 39) | security | 2026-02-07 |
| DLG-SEC-005 | Two-factor authentication (Plan 39) | security | 2026-02-07 |
| DLG-SEC-006 | Session management (Plan 39) | security | 2026-02-07 |
| DLG-SEC-007 | Security audit logging (Plan 39) | security | 2026-02-07 |
| DLG-SEC-008 | Fraud detection (Plan 39) | security | 2026-02-07 |
| DLG-SEC-009 | Privacy settings page (Plan 39) | security | 2026-02-07 |
| DLG-SEC-010 | Security settings page (Plan 39) | security | 2026-02-07 |
| DLG-AUTO-001 | Automation engine (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-002 | Workflow management (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-003 | Scheduled task runner (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-004 | Business rules engine (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-005 | Bulk operations (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-006 | Queue management (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-007 | Admin automation API (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-008 | Admin workflows API (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-009 | Admin tasks API (Plan 40) | automation | 2026-02-07 |
| DLG-AUTO-010 | Operations dashboard (Plan 40) | automation | 2026-02-07 |
