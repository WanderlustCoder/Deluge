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

Non-monetary contributions, skills matching, volunteer tracking.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-VOLUNTEER-001 | Volunteer opportunities — projects can request volunteers | volunteer | VolunteerOpportunity model |
| DLG-VOLUNTEER-001a | Volunteer signup and hour logging | volunteer | VolunteerLog model |
| DLG-VOLUNTEER-002 | Skills marketplace — users list contributable skills | volunteer | UserSkill model |
| DLG-VOLUNTEER-002a | Skills matching algorithm | volunteer | Match volunteers to needs |
| DLG-VOLUNTEER-003 | In-kind donations — track non-monetary contributions | volunteer | InKindDonation model |
| DLG-VOLUNTEER-003a | Project needs list | volunteer | ProjectNeed model |
| DLG-VOLUNTEER-004 | Hour verification — project leads verify logged hours | volunteer | Verification workflow |
| DLG-VOLUNTEER-005 | Volunteer badges — recognize volunteer contributions | volunteer | Badge engine update |
| DLG-VOLUNTEER-006 | Browse volunteer opportunities page | volunteer | `/volunteer` |

See full plan: `docs/plans/plan-12-volunteer-contributions.md`

#### Epic 13: Corporate Employee Portal

White-label employer dashboards, team giving, ESG reporting.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-CORP-001 | Corporate account structure | corporate | CorporateAccount model |
| DLG-CORP-001a | Employee enrollment via invite | corporate | CorporateEmployee model |
| DLG-CORP-002 | Corporate admin dashboard | corporate | `/corporate` |
| DLG-CORP-002a | Employee management | corporate | Roster + permissions |
| DLG-CORP-003 | Corporate matching — company matches employee giving | corporate | CorporateMatchingRecord |
| DLG-CORP-003a | Matching budget tracking | corporate | Budget management |
| DLG-CORP-004 | Internal campaigns — themed giving campaigns for employees | corporate | CorporateCampaign model |
| DLG-CORP-005 | ESG reporting — impact reports for corporate partners | corporate | CorporateReport model |
| DLG-CORP-005a | UN SDG mapping | corporate | Category-to-SDG mapping |
| DLG-CORP-006 | White-label branding — custom logos and colors | corporate | Branded experience |

See full plan: `docs/plans/plan-13-corporate-portal.md`

#### Epic 14: Giving Circles

Group pooled giving, collective decision making, circle voting.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-CIRCLE-001 | Giving circle foundation — create and join circles | circles | GivingCircle model |
| DLG-CIRCLE-001a | Circle discovery and creation UI | circles | `/circles` |
| DLG-CIRCLE-002 | Pool contributions — members contribute to shared pool | circles | CircleContribution model |
| DLG-CIRCLE-003 | Funding proposals — propose and vote on projects | circles | CircleProposal model |
| DLG-CIRCLE-003a | Voting system — approve/reject proposals | circles | CircleVote model |
| DLG-CIRCLE-003b | Auto-execute approved proposals | circles | Fund on approval |
| DLG-CIRCLE-004 | Circle activity feed — show circle activity | circles | CircleActivity model |
| DLG-CIRCLE-004a | Circle discussions | circles | CircleDiscussion model |
| DLG-CIRCLE-005 | Circle impact dashboard | circles | Track collective impact |
| DLG-CIRCLE-006 | Circle badges | circles | New badge category |

See full plan: `docs/plans/plan-14-giving-circles.md`

#### Epic 15: Seasonal & Event-Driven Giving

Holiday campaigns, gift giving, disaster response, giving calendar.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-SEASON-001 | Giving occasions — holidays, awareness days, local events | seasonal | GivingOccasion model |
| DLG-SEASON-001a | Occasion landing pages | seasonal | `/occasions/[slug]` |
| DLG-SEASON-002 | Gift contributions — give in someone's honor/memory | seasonal | GiftContribution model |
| DLG-SEASON-002a | Gift certificates — PDF generation | seasonal | Shareable certificates |
| DLG-SEASON-003 | Birthday fundraisers — personal giving campaigns | seasonal | BirthdayFundraiser model |
| DLG-SEASON-004 | Emergency campaigns — disaster response | seasonal | EmergencyCampaign model |
| DLG-SEASON-004a | Verified relief organizations | seasonal | Org verification |
| DLG-SEASON-005 | Giving calendar — schedule giving throughout the year | seasonal | ScheduledGift model |
| DLG-SEASON-006 | Seasonal campaigns — platform-wide themed campaigns | seasonal | SeasonalCampaign model |

See full plan: `docs/plans/plan-15-seasonal-giving.md`

#### Epic 16: Credit Bureau Reporting

Report microloan repayment to credit bureaus for borrower credit building.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-CREDIT-001 | FCRA compliance infrastructure | credit | Consent, compliance checks |
| DLG-CREDIT-002 | Metro 2 format integration | credit | Industry standard reporting |
| DLG-CREDIT-003 | Bureau API connections | credit | Experian, TransUnion, Equifax |
| DLG-CREDIT-004 | Dispute resolution system | credit | 30-day FCRA requirement |
| DLG-CREDIT-005 | Borrower credit dashboard | credit | Track credit-building progress |
| DLG-CREDIT-006 | Admin reporting dashboard | credit | Monitor reporting health |

See full plan: `docs/plans/plan-16-credit-bureau.md`

#### Epic 17: Community Advocates

Recognize natural community leaders who help others. No tiers, no points, no rewards—just genuine appreciation.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-ADV-001 | Advocate recognition | advocates | CommunityAdvocate model (no tiers) |
| DLG-ADV-002 | Interest expression flow | advocates | Join us (not "apply") |
| DLG-ADV-003 | Activity recording | advocates | Log contributions (not scored) |
| DLG-ADV-004 | Advocate events | advocates | Organize community gatherings |
| DLG-ADV-005 | Resource library | advocates | Materials available to all |
| DLG-ADV-006 | Advocate directory | advocates | Alphabetical, not ranked |

See full plan: `docs/plans/plan-17-ambassador-program.md`

#### Epic 18: Project Verification & Auditing

Build trust through verification, auditing, and fraud prevention.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-VERIFY-001 | Verification levels framework | verification | Unverified → Basic → Verified → Audited |
| DLG-VERIFY-002 | Identity verification | verification | Proposer ID verification |
| DLG-VERIFY-003 | Organization verification | verification | 501c3, EIN validation |
| DLG-VERIFY-004 | Outcome verification | verification | Track and verify project outcomes |
| DLG-VERIFY-005 | Community verification | verification | Witnesses verify outcomes |
| DLG-VERIFY-006 | Third-party audits | verification | Professional audit framework |
| DLG-VERIFY-007 | Fraud detection and flags | verification | Red flag detection system |
| DLG-VERIFY-008 | Trust scores | verification | Calculate and display trust |

See full plan: `docs/plans/plan-18-project-verification.md`

#### Epic 19: Developer API & Integrations

Public API and integration ecosystem for developers.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-API-001 | API key management | api | Issue and manage keys |
| DLG-API-002 | Rate limiting | api | Protect from abuse |
| DLG-API-003 | Public API v1 endpoints | api | Projects, communities, stats |
| DLG-API-004 | Webhooks | api | Push events to external systems |
| DLG-API-005 | OAuth provider | api | Third-party app auth |
| DLG-API-006 | Embeddable widgets | api | Project widgets, donate buttons |
| DLG-API-007 | Developer portal and docs | api | API documentation |

See full plan: `docs/plans/plan-19-developer-api.md`

#### Epic 20: Smart Discovery & Recommendations

Intelligent recommendations for projects, communities, and opportunities.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-REC-001 | User interest profiling | recommendations | Build interest graph |
| DLG-REC-002 | Collaborative filtering | recommendations | Similar users → similar projects |
| DLG-REC-003 | Content-based filtering | recommendations | Category and content matching |
| DLG-REC-004 | Personalized feeds | recommendations | For You, Nearby, Category feeds |
| DLG-REC-005 | Smart matching | recommendations | Project-user match scores |
| DLG-REC-006 | Email digests | recommendations | Personalized weekly recommendations |
| DLG-REC-007 | Explore mode | recommendations | Swipe-style discovery |
| DLG-REC-008 | Discovery challenges | recommendations | Gamified exploration |

See full plan: `docs/plans/plan-20-smart-discovery.md`

#### Epic 21: Learning Resources & Financial Literacy

Resource library for effective giving and financial wellness. No progress tracking, no gamification—just helpful content available when needed.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-LEARN-001 | Resource library | learning | Browse by category, no progress bars |
| DLG-LEARN-002 | Practical tools | learning | Budget planner, tax estimator |
| DLG-LEARN-003 | Reflection prompts | learning | Private reflection journal |
| DLG-LEARN-004 | Decision scenarios | learning | Exploration, not tests |
| DLG-LEARN-005 | Study circles | learning | Community discussion groups |
| DLG-LEARN-006 | Optional certificates | learning | Available upon request |

See full plan: `docs/plans/plan-21-learning-literacy.md`

#### Epic 22: Institutional Partnerships

White-label platform for cities, universities, and foundations.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-INST-001 | Multi-tenant foundation | institutional | Institution schema, tenant resolution |
| DLG-INST-002 | White-label branding | institutional | Custom themes, domains, pages |
| DLG-INST-003 | Institution admin portal | institutional | User/project management |
| DLG-INST-004 | Institution-specific features | institutional | University, city, foundation features |
| DLG-INST-005 | Data and reporting | institutional | Custom reports, analytics |
| DLG-INST-006 | Integration and APIs | institutional | SSO, data sync, embeds |

See full plan: `docs/plans/plan-22-institutional-partnerships.md`

#### Epic 23: Mentorship & Community Support

Connect experienced givers with newcomers through structured mentorship.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-MENTOR-001 | Mentorship foundation | mentorship | Mentor/mentee profiles |
| DLG-MENTOR-002 | Matching and connection | mentorship | Smart matching algorithm |
| DLG-MENTOR-003 | Communication tools | mentorship | Messaging, session scheduling |
| DLG-MENTOR-004 | Peer support groups | mentorship | Group-based mutual support |
| DLG-MENTOR-005 | Progress and outcomes | mentorship | Goal tracking, reviews |
| DLG-MENTOR-006 | Recognition and badges | mentorship | Mentorship achievements |

See full plan: `docs/plans/plan-23-mentorship-program.md`

#### Epic 24: Impact Storytelling & Social Proof

Collect and showcase success stories and testimonials.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-STORY-001 | Story collection system | stories | Story schema, submission flow |
| DLG-STORY-002 | Testimonials | stories | Short-form testimonial collection |
| DLG-STORY-003 | Story display | stories | Stories hub, embedded stories |
| DLG-STORY-004 | Impact visualization | stories | Counters, maps, before/after |
| DLG-STORY-005 | Social proof elements | stories | Trust indicators, sharing |
| DLG-STORY-006 | Curation and management | stories | Admin tools, campaigns |

See full plan: `docs/plans/plan-24-impact-storytelling.md`

#### Epic 25: Accessibility & Internationalization

WCAG 2.1 AA compliance and multi-language support.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-A11Y-001 | Accessibility audit | a11y | Identify and document gaps |
| DLG-A11Y-002 | Core accessibility fixes | a11y | Keyboard, screen reader, contrast |
| DLG-A11Y-003 | Accessible components | a11y | Forms, modals, tables |
| DLG-I18N-001 | i18n infrastructure | i18n | Translation system setup |
| DLG-I18N-002 | Translation implementation | i18n | UI and content translations |
| DLG-A11Y-004 | Inclusive design | a11y | Motion, text customization |

See full plan: `docs/plans/plan-25-accessibility-i18n.md`

#### Epic 26: Grants & Large Funding Programs

Formal grant application and management for larger funding amounts ($5K+).

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-GRANT-001 | Grant program foundation | grants | GrantProgram, GrantReviewer models |
| DLG-GRANT-002 | Application system | grants | GrantApplication, GrantQuestion models |
| DLG-GRANT-003 | Review process | grants | GrantReview, GrantRubric models |
| DLG-GRANT-004 | Awards & disbursement | grants | GrantAward, GrantDisbursement models |
| DLG-GRANT-005 | Reporting & compliance | grants | GrantReport, GrantReportTemplate models |
| DLG-GRANT-006 | Funder dashboard | grants | Portfolio management, analytics |

See full plan: `docs/plans/plan-26-grants-programs.md`

#### Epic 27: Blockchain Transparency Ledger

Optional blockchain-based immutable record of platform transactions.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-CHAIN-001 | Transparency ledger foundation | blockchain | TransparencyRecord, hashing, merkle |
| DLG-CHAIN-002 | Blockchain anchoring | blockchain | Multi-chain support, batch anchoring |
| DLG-CHAIN-003 | Verification system | blockchain | Proof generation, public verification |
| DLG-CHAIN-004 | Impact certificates | blockchain | ImpactCertificate, optional NFT minting |
| DLG-CHAIN-005 | Organizational accountability | blockchain | OrganizationLedger, audit trail |
| DLG-CHAIN-006 | Dashboard & analytics | blockchain | Public and admin dashboards |

See full plan: `docs/plans/plan-27-blockchain-transparency.md`

#### Epic 28: AI-Powered Platform Features

AI assistance for recommendations, moderation, and insights.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-AI-001 | Smart project matching | ai | Interest profiling, recommendations |
| DLG-AI-002 | Content assistance | ai | Description, grant, and story helpers |
| DLG-AI-003 | Intelligent moderation | ai | Content screening, fraud detection |
| DLG-AI-004 | Intelligent search | ai | Semantic search, Q&A |
| DLG-AI-005 | Predictive analytics | ai | Success prediction, churn, trends |
| DLG-AI-006 | Automated insights | ai | Impact reports, community insights |
| DLG-AI-007 | Admin AI tools | ai | Natural language queries, drafting |

See full plan: `docs/plans/plan-28-ai-features.md`

#### Epic 29: Community Marketplace

Local marketplace for goods, services, and skills exchange.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-MARKET-001 | Marketplace foundation | marketplace | MarketplaceListing, categories |
| DLG-MARKET-002 | Communication | marketplace | Inquiries, offers, messaging |
| DLG-MARKET-003 | Transactions | marketplace | MarketplaceTransaction, payments |
| DLG-MARKET-004 | Services & skills | marketplace | Bookings, skill exchange |
| DLG-MARKET-005 | Trust & safety | marketplace | Reviews, verification, disputes |
| DLG-MARKET-006 | Community features | marketplace | Community marketplace, market days |
| DLG-MARKET-007 | Free/gift economy | marketplace | Free items, community wishlist |

See full plan: `docs/plans/plan-29-community-marketplace.md`

#### Epic 30: Fundraising Events & Ticketing

In-person and virtual fundraising events with ticketing and auctions. Collective goals, no individual rankings or competition.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-EVENT-001 | Event foundation | events | FundraisingEvent, discovery, creation |
| DLG-EVENT-002 | Ticketing | events | EventTicketType, registration, checkout |
| DLG-EVENT-003 | Donations | events | EventDonation, collective progress, matching |
| DLG-EVENT-004 | Auctions | events | AuctionItem, AuctionBid, management |
| DLG-EVENT-005 | Community participation | events | EventParticipant, EventGroup (not competitive) |
| DLG-EVENT-006 | Event day | events | Check-in, live dashboard, virtual |
| DLG-EVENT-007 | Post-event | events | Thank you, receipts, collective results |
| DLG-EVENT-008 | Sponsorships | events | EventSponsor, sponsor tiers |

See full plan: `docs/plans/plan-30-fundraising-events.md`

#### Epic 31: Pledge & Crowdfunding Campaigns

Kickstarter-style pledge campaigns with all-or-nothing funding.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-PLEDGE-001 | Campaign foundation | pledge | PledgeCampaign, creation wizard |
| DLG-PLEDGE-002 | Pledge system | pledge | Pledge, payment authorization |
| DLG-PLEDGE-003 | Rewards | pledge | CampaignReward, fulfillment tracking |
| DLG-PLEDGE-004 | Campaign progress | pledge | Stretch goals, updates |
| DLG-PLEDGE-005 | Settlement | pledge | Collection, failure handling, refunds |
| DLG-PLEDGE-006 | Social features | pledge | Backer wall, comments, sharing |
| DLG-PLEDGE-007 | Analytics & management | pledge | Creator dashboard, admin oversight |

See full plan: `docs/plans/plan-31-pledge-campaigns.md`

#### Epic 32: Gift Cards & Store Credit

Gift card system with store credit and promotional codes.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-GIFT-001 | Gift card foundation | giftcards | GiftCard, designs, delivery |
| DLG-GIFT-002 | Redemption | giftcards | Code redemption, balance management |
| DLG-GIFT-003 | Store credit | giftcards | StoreCredit, credit sources |
| DLG-GIFT-004 | Corporate gift cards | giftcards | Bulk purchase, corporate portal |
| DLG-GIFT-005 | Promotional campaigns | giftcards | PromoCode, partner programs |
| DLG-GIFT-006 | Physical gift cards | giftcards | Physical card orders, activation |
| DLG-GIFT-007 | Admin & analytics | giftcards | Administration, fraud prevention |

See full plan: `docs/plans/plan-32-gift-cards.md`

#### Epic 33: Nonprofit Partner Portal

Dedicated dashboard for nonprofit organizations.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-ORG-001 | Organization foundation | nonprofit | NonprofitOrganization, registration |
| DLG-ORG-002 | Verification system | nonprofit | Document management, verification |
| DLG-ORG-003 | Organization dashboard | nonprofit | Donation management, project management |
| DLG-ORG-004 | Donor relations | nonprofit | DonorRelationship, acknowledgments |
| DLG-ORG-005 | Reporting & analytics | nonprofit | OrganizationReport, impact metrics |
| DLG-ORG-006 | Team management | nonprofit | Members, activity log, notifications |
| DLG-ORG-007 | Integrations | nonprofit | CRM, accounting, data export |

See full plan: `docs/plans/plan-33-nonprofit-portal.md`

#### Epic 34: Advanced Analytics & BI

Comprehensive analytics and business intelligence platform.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-BI-001 | Analytics foundation | analytics | Event tracking, data aggregation |
| DLG-BI-002 | Dashboard framework | analytics | Dashboard builder, widget library |
| DLG-BI-003 | Pre-built dashboards | analytics | Executive, financial, community, project |
| DLG-BI-004 | Cohort analysis | analytics | Cohort builder, retention analysis |
| DLG-BI-005 | Funnel & conversion | analytics | Funnel builder, A/B testing |
| DLG-BI-006 | Data exploration | analytics | Query builder, saved queries |
| DLG-BI-007 | Predictive analytics | analytics | Forecasting, anomaly detection |

See full plan: `docs/plans/plan-34-advanced-analytics.md`

#### Epic 35: Multi-Currency & Global Expansion

International giving with multi-currency support.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-GLOBAL-001 | Currency foundation | global | Currency, exchange rates, formatting |
| DLG-GLOBAL-002 | Multi-currency transactions | global | Currency tracking, checkout, settlement |
| DLG-GLOBAL-003 | Regional configuration | global | Region schema, localized content |
| DLG-GLOBAL-004 | International payments | global | Payment methods, cross-border, payouts |
| DLG-GLOBAL-005 | Tax & compliance | global | Tax jurisdictions, receipts, reporting |
| DLG-GLOBAL-006 | Localization | global | Language support, content translation |
| DLG-GLOBAL-007 | Global operations | global | Regional admin, launch management |

See full plan: `docs/plans/plan-35-multi-currency.md`

#### Epic 36: Notification & Communication Center

Comprehensive notification system with multi-channel delivery.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-NOTIF-001 | Notification infrastructure | notifications | Notification, delivery, channels |
| DLG-NOTIF-002 | User preferences | notifications | Preferences, smart routing |
| DLG-NOTIF-003 | Notification inbox | notifications | Inbox UI, bell, bulk actions |
| DLG-NOTIF-004 | Smart batching | notifications | Digests, grouping, throttling |
| DLG-NOTIF-005 | Templates | notifications | Template system, email templates |
| DLG-NOTIF-006 | Triggered notifications | notifications | Event triggers, lifecycle |
| DLG-NOTIF-007 | Analytics & admin | notifications | Delivery analytics, testing |

See full plan: `docs/plans/plan-36-notification-center.md`

#### Epic 37: Social Media Integration

Deep integration with social platforms for sharing and authentication.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-SOCIAL-001 | Social authentication | social | OAuth providers, account linking |
| DLG-SOCIAL-002 | Social sharing | social | Share framework, OG images |
| DLG-SOCIAL-003 | Social posting | social | Auto-post, composer, milestones |
| DLG-SOCIAL-004 | Friend finding | social | Contact import, suggestions |
| DLG-SOCIAL-005 | Social fundraising | social | Challenges, P2P, Facebook |
| DLG-SOCIAL-006 | Social proof | social | Activity stream, impact cards |
| DLG-SOCIAL-007 | Social analytics | social | Share tracking, influencers |

See full plan: `docs/plans/plan-37-social-integrations.md`

#### Epic 38: Community Celebrations & Milestones

Celebration engine for community growth and collective achievements (no addictive mechanics).

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-CELEB-001 | Milestone recognition | celebrations | Personal and community milestones |
| DLG-CELEB-002 | Celebration moments | celebrations | Celebration UI, reflection cards |
| DLG-CELEB-003 | Shared journeys | celebrations | Collaborative groups (not competitive) |
| DLG-CELEB-004 | Seasonal reflections | celebrations | Year in review, reflection periods |
| DLG-CELEB-005 | Recognition | celebrations | Achievement badges, thank you notes |
| DLG-CELEB-006 | Quiet encouragement | celebrations | Gentle nudges, outcome stories |
| DLG-CELEB-007 | Admin tools | celebrations | Celebration management |

See full plan: `docs/plans/plan-38-gamified-challenges.md`

#### Epic 39: Data Privacy & Security

Comprehensive privacy and security framework with GDPR/CCPA compliance.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-SEC-001 | Privacy foundation | security | Consent, settings, data inventory |
| DLG-SEC-002 | Data subject rights | security | Access, export, deletion |
| DLG-SEC-003 | Security infrastructure | security | Auth, 2FA, password security |
| DLG-SEC-004 | Encryption | security | At rest, in transit, PII |
| DLG-SEC-005 | Audit & compliance | security | Audit logging, compliance |
| DLG-SEC-006 | Threat protection | security | Rate limiting, fraud detection |
| DLG-SEC-007 | User security | security | Login alerts, recovery |

See full plan: `docs/plans/plan-39-privacy-security.md`

#### Epic 40: Admin Automation & Workflows

Automate admin tasks and create approval workflows.

| ID | Title | Epic | Notes |
|----|-------|------|-------|
| DLG-AUTO-001 | Automation framework | automation | Triggers, conditions, actions |
| DLG-AUTO-002 | Workflow builder | automation | Multi-step workflows, approvals |
| DLG-AUTO-003 | Scheduled tasks | automation | Task scheduler, monitoring |
| DLG-AUTO-004 | Rules engine | automation | Business rules, testing |
| DLG-AUTO-005 | Bulk operations | automation | Bulk actions, import/export |
| DLG-AUTO-006 | Queue management | automation | Work queues, SLA tracking |
| DLG-AUTO-007 | Admin dashboard | automation | Operations, health monitoring |

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
