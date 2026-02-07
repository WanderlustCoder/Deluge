# Technical Architecture

## Technology Stack

### Frontend

**Web App:**

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React.js | Responsive, modern, large ecosystem |
| Styling | Tailwind CSS | Rapid development, customizable design system |
| Animations | Framer Motion | Smooth water animations, gesture support |
| State Management | Redux or Zustand | Predictable state for contribution and impact data |
| Hosting | Vercel or Netlify | Fast deploys, global CDN |

**Mobile Apps:**

| Option | Technology | Trade-off |
|--------|------------|-----------|
| Native iOS | Swift + SwiftUI | Best performance, Apple-native feel |
| Native Android | Kotlin | Best performance, Material Design |
| Cross-platform | React Native | Faster development, single codebase (recommended for MVP) |

### Backend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Layer | Node.js + Express **or** Python + FastAPI | Well-suited for async operations, real-time contribution tracking |
| Database | PostgreSQL | Relational data integrity for users, contributions, projects |
| Cache | Redis | Fast data access, session management |
| Search | Elasticsearch | Project search, filtering, recommendations |

### Authentication

| Component | Technology |
|-----------|------------|
| Provider | Auth0 or Firebase Auth |
| Methods | Email/password, Google, Apple, Facebook |
| Security | JWT tokens, optional 2FA |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Cloud Provider | AWS or Google Cloud |
| Compute | EC2 / Cloud Run (auto-scaling) |
| Storage | S3 / Cloud Storage (images, documents) |
| CDN | CloudFront / Cloud CDN (fast asset delivery) |
| Monitoring | DataDog or New Relic |
| CI/CD | GitHub Actions or CircleCI |
| Containers | Docker |
| Orchestration | Kubernetes (at scale) |

---

## Third-Party Integrations

### Payments

| Integration | Purpose | Options |
|-------------|---------|---------|
| Payment Processing | Cash contributions, PCI compliance, business directory billing, corporate campaign payments | Stripe |
| Payout / Disbursement | Microloan disbursements to borrowers | Stripe Connect or PayPal Payouts |
| Custodial Fund Management | Aggregate watershed balances held in FDIC-insured sweep accounts, money market funds, or short-term Treasuries. Interest earned on custodial pool funds platform operations. User principal always available for deployment or withdrawal. | Bank sweep accounts (IntraFi/CDARS for multi-bank FDIC coverage) |

### Impact / Project Management

| Integration | Purpose |
|-------------|---------|
| Project Vetting | Custom internal tools for quality control |
| Impact Measurement | IRIS+ framework integration (industry standard) |
| Nonprofit Verification | GuideStar API for 501(c)(3) verification |
| Reporting | Custom dashboards + PDF generation |

### Credit Bureau Reporting

| Integration | Purpose | Options |
|-------------|---------|---------|
| Credit Bureau Data Furnishing | Report microloan repayment history to build borrowers' credit scores | Experian, TransUnion, Equifax (via Metro 2 format) |
| FCRA Compliance | Ensure reporting meets Fair Credit Reporting Act requirements | Legal counsel + compliance tooling |

Planned for Phase 3-4. Requires becoming an approved data furnisher, implementing Metro 2 reporting format, and ongoing FCRA compliance. Significant differentiator: borrowers build real, reportable credit history through Deluge microloans.

### Communication

| Integration | Purpose | Options |
|-------------|---------|---------|
| Email | Transactional + marketing emails | SendGrid or Mailgun |
| Push Notifications | Mobile engagement | Firebase Cloud Messaging |
| SMS | 2FA, critical alerts | Twilio |

### Analytics

| Integration | Purpose | Options |
|-------------|---------|---------|
| Product Analytics | User behavior, funnels, retention | Mixpanel or Amplitude |
| Session Recording | UX analysis, bug discovery | Hotjar or FullStory |
| A/B Testing | Feature flags, experiment framework | Optimizely or LaunchDarkly |

### Advertising / Ad-Funded Impact

| Integration | Purpose | Options |
|-------------|---------|---------|
| Ad Mediation | Serve rewarded video ads, optimize eCPM across networks | Google AdMob, ironSource, AppLovin MAX |
| Ad Fraud Prevention | Detect fake views, bot traffic, device fingerprinting | HUMAN (formerly White Ops), Adjust |
| Revenue Tracking | Track ad impressions, eCPM, project contributions in real-time | Custom + ad network dashboards |

### Location & Mapping

| Integration | Purpose | Options |
|-------------|---------|---------|
| Geocoding | Address verification for business listings | Google Maps Platform, Mapbox |
| Proximity Search | "Near me" filtering for business cards | PostGIS (PostgreSQL extension) or Elasticsearch geo queries |

### Identity & Fraud Prevention

| Integration | Purpose | Options |
|-------------|---------|---------|
| Phone Verification | SMS verification for referral anti-fraud (unique phone per account) | Twilio Verify |
| Device Fingerprinting | Detect multi-account fraud for referral and ad abuse | Fingerprint.js, HUMAN |
| Bank Account Verification | Confirm referrer and referred user have separate bank accounts | Plaid |

### Customer Support

| Integration | Purpose | Options |
|-------------|---------|---------|
| Help Desk | Ticket management, knowledge base | Zendesk or Intercom |
| Chatbot | AI-powered first-line support | Intercom or custom |

---

## Payment Service Architecture

The payment service is abstracted to support both development/demo mode (mock) and production (Stripe). This allows the app to function fully without real payment credentials during development.

### Service Interface

Located at `src/lib/payments/`:

```
src/lib/payments/
├── index.ts           # Main export, auto-selects mock or Stripe
├── types.ts           # TypeScript interfaces for all payment operations
├── mock.ts            # Fake implementation for dev/demo
└── stripe.ts          # Real Stripe implementation (stub, ready to complete)
```

### Environment Configuration

| Variable | Purpose | Required |
|----------|---------|----------|
| `PAYMENT_MODE` | Force mock mode even with Stripe credentials | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | For live payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | For webhooks |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client-side key | For frontend |
| `PLAID_CLIENT_ID` | Plaid API client ID | For bank linking |
| `PLAID_SECRET` | Plaid API secret | For bank linking |

### Core Operations

**Money In (Contributions):**
```typescript
// Create payment intent (returns client secret for frontend)
const intent = await paymentService.createPaymentIntent(userId, 25.00, 'card');

// Confirm contribution (called from webhook or after frontend completion)
const result = await paymentService.confirmContribution(intent.paymentIntentId);
```

**Money Out (Disbursements):**
```typescript
// Disburse to project recipient
const disbursement = await paymentService.createDisbursement({
  type: 'project',
  referenceId: projectId,
  recipientId: connectAccountId,
  amount: 15000,
  description: 'Montbello Food Market - Full funding',
});
```

**Recipient Onboarding (Stripe Connect Standard):**
```typescript
// Create connected account for recipient
const account = await paymentService.createConnectAccount({
  userId: recipientUserId,
  email: 'recipient@example.com',
  type: 'nonprofit',
});

// Get onboarding link for recipient to complete
const link = await paymentService.getOnboardingLink(account.accountId);
// Redirect recipient to link.url
```

**Loan Repayments:**
```typescript
// Process manual repayment
const repayment = await paymentService.processRepayment({
  loanId,
  borrowerId,
  amount: 61.20, // $60 principal + $1.20 fee
  method: 'ach_push',
  isScheduled: false,
});

// Set up auto-pay
const autoPay = await paymentService.setupAutoPay({
  loanId,
  borrowerId,
  bankAccountId,
  dayOfMonth: 15,
});
```

**Bank Linking (Plaid):**
```typescript
// Create link token for Plaid Link frontend
const linkToken = await paymentService.createLinkToken(userId);

// Exchange public token after user completes Plaid Link
const bankAccount = await paymentService.exchangePublicToken(publicToken, userId);
```

**KYC (Stripe Identity):**
```typescript
// Create identity verification session
const session = await paymentService.createKycSession(userId);
// Redirect user to session.url

// Check verification status
const status = await paymentService.getKycStatus(userId);
```

### Webhook Handling

Stripe webhooks should be routed to `/api/webhooks/stripe`:

```typescript
// In API route handler
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  if (!paymentService.verifyWebhookSignature(payload, signature)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = paymentService.parseWebhookEvent(payload);

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update watershed balance
      break;
    case 'transfer.created':
      // Mark disbursement as in_transit
      break;
    case 'account.updated':
      // Update Connect account status
      break;
  }

  return new Response('OK');
}
```

### Mock Mode Behavior

In mock mode (default for development):
- All payment intents succeed immediately
- All disbursements show as "in_transit" with 3-day estimated arrival
- Connect accounts are auto-approved
- Bank linking always succeeds with "Mock Bank ****1234"
- KYC is auto-verified
- Webhook signatures always pass

This allows full end-to-end testing of payment flows without real money or credentials.

### Implementation Status

| Component | Status |
|-----------|--------|
| Type definitions | Complete |
| Mock implementation | Complete |
| Stripe contributions | Stub (ready to implement) |
| Stripe Connect payouts | Stub |
| Plaid bank linking | Stub |
| Stripe Identity KYC | Stub |
| Webhook handlers | Stub |

---

## Data Models

### User

```
{
  id: uuid
  email: string
  name: string
  created_at: timestamp
  profile_image: url
  bio: string
  location: { city, state, country }
  preferences: {
    categories: [array]
    notifications: { email, push, sms }
    privacy: { public_profile, show_impact }
  }
  total_contributed: decimal
  total_impact: decimal
  achievements: [badge_ids]
  referral_code: string
  referred_by: user_id
}
```


### Contribution

```
{
  id: uuid
  user_id: uuid
  amount: decimal
  type: enum (cash, ad_funded, business_card, referral_credit, corporate_match)
  timestamp: timestamp
  watershed_credit: decimal         // amount credited to user's watershed (100% for cash, 60% for ads/cards)
  status: enum (pending, complete, refunded)
}
```

### Project

```
{
  id: uuid
  title: string
  description: text
  tags: [strings]              // flexible tags, not fixed categories
  proposed_by: user_id         // who submitted this project
  organization_id: uuid        // optional -- linked org if applicable
  location: { city, state, country, coordinates }
  funding: {
    goal: decimal
    raised: decimal
    percentage: calculated
    backers: integer           // number of unique contributors
  }
  momentum: {
    shares: integer
    followers: integer
    recent_backers_24h: integer
    trend: enum (rising, steady, new, stalled)
  }
  timeline: {
    proposed: timestamp        // when submitted
    verified: timestamp        // when Deluge verified legitimacy
    live: timestamp            // when opened for funding
    funded: timestamp          // when 100% reached
    completed: timestamp       // when project outcomes delivered
    deadline: timestamp        // funding deadline
  }
  verification: {
    status: enum (pending, verified, rejected)
    verified_by: admin_id
    checks: {
      identity: boolean
      organization: boolean
      legality: boolean
      funds_traceable: boolean
    }
  }
  impact_metrics: {
    target: string             // e.g., "500 students served"
    actual: string             // updated as project progresses
    measurement: string        // how we track
  }
  media: {
    featured_image: url
    gallery: [urls]
    videos: [urls]
  }
  updates: [update_ids]
  discussion: [comment_ids]
  status: enum (pending_review, active, funded, in_progress,
                completed, archived, rejected, expired)
}
```

### Community

```
{
  id: uuid
  name: string
  description: text
  created_by: user_id
  tags: [strings]
  location: { city, state, country }   // optional, for local communities
  members: [user_ids]
  member_count: integer
  projects: [project_ids]              // projects associated with this community
  total_raised: decimal
  loan_activity: {
    active_loans: integer              // loans funded by community members currently active
    total_loans_funded: integer        // lifetime count of loans funded by community members
    total_recycled_capital: decimal    // aggregate watershed capital recycled through loan cycles
    repayment_rate: decimal            // percentage of completed loans repaid in full
    total_credit_score_points: integer // aggregate self-reported credit score deltas from borrowers backed by community
    recovery_count: integer            // number of borrowers who recovered from default
  }
  created_at: timestamp
  visibility: enum (public, private)
}
```

### Project Proposal (pre-verification queue)

```
{
  id: uuid
  proposer_id: user_id
  title: string
  description: text
  tags: [strings]
  funding_goal: decimal
  deadline: date
  organization: {
    name: string
    type: enum (nonprofit, school, community_org, small_business, individual)
    ein: string                        // if nonprofit
    verification_docs: [urls]
  }
  impact_plan: {
    what_funds_cover: text
    success_metrics: text
    reporting_commitment: text
  }
  media: [urls]
  status: enum (draft, submitted, in_review, approved, rejected)
  reviewer_notes: text
  submitted_at: timestamp
}
```

### Nonprofit Partner

```
{
  id: uuid
  name: string
  ein: string              // tax ID
  verified: boolean
  description: text
  website: url
  contact: { name, email, phone }
  tags: [array]
  total_raised: decimal
  projects: [project_ids]
  verification: {
    guidestar: boolean
    501c3: boolean
    audited_financials: boolean
  }
}
```

### Achievement / Badge

```
{
  id: uuid
  name: string
  description: string
  icon: url
  tier: enum (bronze, silver, gold, platinum)
  criteria: {
    type: enum (contribution_amount, project_count, category_count, etc.)
    threshold: value
  }
  rarity: percentage       // how many users have earned it
}
```

### Private Milestone

```
{
  id: uuid
  user_id: uuid
  type: enum (contribution_total, consistency, impact_milestones, learning)
  name: string                   // e.g., "First Hundred Contributed", "6-Month Streak"
  threshold: value               // what triggered it (e.g., 100.00 for contribution_total, 6 for consistency months)
  achieved_at: timestamp         // when the milestone was reached
  seen: boolean                  // whether the user has dismissed the milestone overlay
}
```

Private milestones are never exposed through public API endpoints, leaderboards, or social feeds. They exist only in the user's own dashboard and are retrieved through authenticated personal endpoints.

### Project Update

```
{
  id: uuid
  project_id: uuid
  title: string
  content: text
  media: [urls]
  timestamp: timestamp
  author: string
  milestone: boolean       // is this a major milestone?
}
```

### Ad View (Ad-Funded Impact)

```
{
  id: uuid
  user_id: uuid
  ad_network: string          // which ad network served this
  ad_id: string               // ad network's creative ID
  timestamp: timestamp
  ecpm: decimal               // what the advertiser paid (per 1000 views)
  gross_revenue: decimal      // total ad revenue for this view
  platform_cut: decimal       // Deluge's 40%
  watershed_credit: decimal   // 60% -- credited to the user's watershed
  verified: boolean           // anti-fraud verification passed
  status: enum (pending, credited, rejected)
}
```

Ad revenue enters the user's watershed. The user's 60% share is credited to their watershed balance, where they can deploy it to grants or microloans like any other contribution.

### Business Card Listing

```
{
  id: uuid
  owner_id: uuid                    // business owner's user account
  business_name: string
  category: string                  // e.g., "Coffee Shop", "Plumber", "Bookstore"
  description: string               // 50 words max
  location: {
    address: string
    city: string
    state: string
    coordinates: { lat, lng }
  }
  photo_url: url                    // one photo (storefront, product, team)
  sponsored_project_id: uuid | null // optional: "Views fund [Project Name]"
  verification: {
    status: enum (pending, verified, rejected)
    verified_at: timestamp
    address_confirmed: boolean
    owner_identity_confirmed: boolean
  }
  metrics: {
    total_views: integer
    views_this_week: integer
    views_this_month: integer
    saves: integer
    recommendations: integer
    total_project_funding: decimal   // cumulative project funding generated by views
  }
  premium: boolean                  // future: premium listing with enhanced visibility
  created_at: timestamp
  status: enum (draft, pending_review, active, suspended)
}
```

### Business Card View

```
{
  id: uuid
  user_id: uuid
  listing_id: uuid
  timestamp: timestamp
  revenue_per_view: decimal         // e.g., $0.002
  platform_cut: decimal             // 40% ($0.0008)
  project_credit: decimal           // 60% ($0.0012)
  project_id: uuid                  // user's chosen project at time of view
  corporate_match_applied: decimal  // additional from active matching campaign (0 if none)
  match_campaign_id: uuid | null
}
```

Business card views are lower value per-view ($0.001-0.003) than video ads ($0.008-0.025) but generate higher volume per session. A user can browse 50 cards in a minute versus watching one 30-second video ad. Views are batched for processing efficiency -- individual view records are written to a buffer and flushed to the database in batches of 50-100.

### Referral

```
{
  id: uuid
  referrer_id: uuid                 // user who shared the link
  referred_id: uuid                 // user who signed up
  referral_code: string
  milestones: {
    signup: {
      completed: boolean
      completed_at: timestamp | null
      credit: decimal               // $0.50
      credited: boolean
    }
    first_action: {
      completed: boolean
      completed_at: timestamp | null
      action_type: enum (first_contribution, first_5_ads) | null
      credit: decimal               // $1.00 (ads) or $1.50 (cash contribution)
      credited: boolean
    }
    day_30_active: {
      completed: boolean
      completed_at: timestamp | null
      login_count: integer          // must be 5+ logins
      credit: decimal               // $1.00
      credited: boolean
    }
  }
  total_credited: decimal           // sum of all vested milestone credits
  fraud_checks: {
    unique_phone: boolean
    unique_device: boolean
    separate_bank_account: boolean
    organic_activity: boolean       // no automated patterns detected
  }
  link_created_at: timestamp
  link_expires_at: timestamp        // 7 days of inactivity from referred user
  status: enum (pending, active, completed, expired, fraudulent)
}
```

### Corporate Match Campaign

```
{
  id: uuid
  partner_name: string              // corporate partner (e.g., "Acme Corp")
  partner_logo: url
  fund_total: decimal               // total committed (e.g., $25,000)
  fund_remaining: decimal           // remaining balance
  match_level: integer              // multiplier (2x, 3x, 5x, 10x)
  match_criteria: {
    type: enum (all, category, region, project)
    categories: [strings] | null    // e.g., ["education", "environment"]
    regions: [strings] | null       // e.g., ["Denver, CO"]
    project_ids: [uuid] | null      // specific projects
  }
  applies_to: enum (video_ads, business_cards, both)
  start_date: timestamp
  end_date: timestamp | null        // null = runs until fund exhausted
  status: enum (active, paused, exhausted, expired)
  metrics: {
    total_matched: decimal          // total corporate dollars matched
    ad_views_matched: integer       // number of ad views that received matching
    card_views_matched: integer
    users_benefited: integer        // unique users whose contributions were matched
    projects_funded: integer        // unique projects that received matched funds
  }
}
```

### Watershed (User Impact Fund)

```
{
  id: uuid
  user_id: uuid
  balance: decimal                // available funds to deploy to grants or loans
  total_inflow: decimal           // lifetime total: cash contributions + referral credits + corporate match + loan repayments
  total_outflow: decimal          // lifetime total: grants funded + loans funded
  total_returned: decimal         // lifetime total: loan repayments received
  total_lost: decimal             // lifetime total: defaulted loan contributions
  history: [
    {
      date: timestamp
      type: enum (cash_contribution, ad_contribution, business_card_contribution,
                  referral_credit, corporate_match,
                  loan_repayment, grant_funded, loan_funded, loan_default)
      amount: decimal
      reference_id: uuid          // contribution_id, ad_view_id, card_view_id, referral_id, grant_id, match_campaign_id, loan_id, or project_id
      description: string         // e.g., "Referral credit: Marcus signed up"
    }
  ]
}
```

The watershed is the user's personal impact fund. All giving capital flows through the watershed: cash contributions (100%), ad revenue (60% of each view), business card browsing revenue, referral credits, corporate ad matching, and loan repayments all flow in. Grants and loan funding flow out. Every contribution pathway feeds the same watershed. The balance represents deployable impact capital at any given time.

### Microloan

```
{
  id: uuid
  borrower_id: uuid
  title: string                       // e.g., "Bakery Equipment"
  purpose: text                       // detailed description of what the loan funds
  story: text                         // optional personal narrative
  amount: decimal                     // total loan amount ($100 Tier 1 to $5,000 Tier 5)
  primary_amount: decimal             // minimum funding target (loan proceeds if this is met)
  stretch_goals: [
    {
      priority: integer               // 1, 2, or 3 (funding fills in order)
      amount: decimal                 // additional amount for this stretch goal
      purpose: string                 // what this stretch goal funds
      status: enum (unfunded, funded, returned)  // resolved at deadline
    }
  ]
  funded: decimal                     // amount funded so far
  purpose_category: string            // "car_repair", "education", "business", "trade_tools", etc.
  purpose_statement: string           // borrower's description of intended use
  category_type: enum (general, niche)           // general = surfaces in all feeds; niche = surfaces via community group opt-in
  niche_group_ids: [uuid]             // community groups this niche loan is associated with (empty for general)
  location: { city, state, country }  // borrower's location, used for regional discovery
  funding_deadline: datetime          // calculated from tier: T1=7d, T2=14d, T3=21d, T4=30d, T5=45d
  funding_extensions: [
    {
      sponsor_id: uuid               // sponsor who extended the deadline
      extension_days: integer         // days added (1st = 1x base, 2nd = 0.5x base)
      extended_at: datetime
      new_deadline: datetime
    }
  ]
  goal_verification_status: enum      // pending, submitted, verified, flagged, waived
  goal_verification_evidence: [
    {
      type: enum (photo, receipt, text_update, milestone)
      url: string
      submitted_at: datetime
      description: string
    }
  ]
  is_concurrent: boolean              // true if this is a sponsored concurrent loan
  primary_loan_id: uuid | null        // if concurrent, reference to the first loan
  refinanced: boolean                 // has this loan been refinanced
  refinance_history: [
    {
      previous_payment: decimal
      new_payment: decimal
      refinance_fee: decimal
      refinanced_at: datetime
    }
  ]
  acceptance_status: enum             // pending, accepted, declined, expired (72h auto-cancel)
  acceptance_deadline: datetime       // 72 hours after funding resolves
  accepted_at: datetime | null        // when borrower accepted (null if not yet)
  default_recovered: boolean          // did this loan exit default status
  recovery_payments: integer          // count of consecutive payments toward recovery (0-3)
  max_term_months: integer            // tier-based cap: T1=6, T2=12, T3=18, T4=24, T5=24
  term_months: integer                // borrower's chosen term (within max_term_months)
  scheduled_payment: decimal          // fixed monthly payment amount (principal only)
  servicing_fee_rate: decimal         // percentage (e.g., 0.02 for 2%), locked at origination
  servicing_fee_per_payment: decimal  // scheduled_payment x fee_rate, fixed for life of loan
  total_payments: integer             // number of scheduled payments
  payments_made: integer
  share_price: decimal                // $0.25 (fixed, universal)
  total_shares: integer               // loan amount / share_price (e.g., $500 = 2,000 shares)
  funders: [
    {
      user_id: uuid
      shares: integer                 // number of shares owned (contribution / $0.25)
      contribution: decimal           // total dollar amount funded
      funded_at: timestamp            // determines position within each interleave round
      shares_repaid: integer          // how many shares have been repaid so far
      status: enum (active, fully_repaid, defaulted)
      last_repayment_at: timestamp
    }
  ]
  credit_forward: decimal             // sub-$0.25 remainder from payments that don't divide evenly into shares
  borrower_tier: integer              // borrower's credit tier at time of loan
  timeline: {
    applied: timestamp
    verified: timestamp
    live: timestamp                   // opened for funding
    funded: timestamp                 // fully funded (cascade)
    disbursed: timestamp              // funds sent to borrower
    first_payment_due: timestamp      // 30 days after disbursement
    completed: timestamp              // all payments made (null until complete)
    defaulted: timestamp              // null unless defaulted (90+ days overdue)
  }
  status: enum (pending_review, seeking_sponsors, active, funded,
                awaiting_acceptance, disbursed, repaying, late, at_risk,
                completed, defaulted, recovering, rejected, expired,
                declined)
                // seeking_sponsors = loan needs sponsorship before it can proceed to funding
                // funded = primary goal met, resolving stretch goals
                // awaiting_acceptance = funding resolved, borrower has 48-72h to accept
                // late = 1-30 days overdue on payment
                // at_risk = 31-90 days overdue on payment
                // declined = borrower declined the loan after funding
                // expired = deadline passed without meeting primary goal
}
```

### Loan Question

```
{
  id: uuid
  loan_id: uuid
  asker_id: uuid                      // funder or potential funder who asked
  question: string                    // max 280 characters
  answer: string | null               // borrower's optional response
  asked_at: datetime
  answered_at: datetime | null
  flagged: boolean                    // community-flagged as inappropriate
  flag_count: integer                 // number of unique flags
  hidden: boolean                     // hidden pending review (auto-hidden at 3+ flags)
  status: enum (open, answered, flagged, hidden)
}
```

Each funder can submit a maximum of 2 questions per loan. Questions are short-form (280 character limit). Borrower responses are optional. Community members can flag inappropriate questions.

### Loan Payment

```
{
  id: uuid
  loan_id: uuid
  borrower_id: uuid
  timestamp: timestamp
  amount_received: decimal            // total amount received from borrower
  principal_portion: decimal          // amount applied to principal (scheduled amount)
  fee_portion: decimal                // servicing fee (fee_rate x scheduled_payment, fixed)
  overpayment_portion: decimal        // amount above scheduled, fee-free
  payment_type: enum (scheduled, advance_next, pay_down_principal)
  disbursements: [
    {
      funder_id: uuid
      shares_repaid: integer          // number of shares repaid to this funder in this payment
      amount: decimal                 // shares_repaid x $0.25
    }
  ]
  credit_forward_added: decimal       // sub-$0.25 remainder that didn't fill a complete share
  credit_forward_applied: decimal     // credit from previous remainders applied to this payment
  remaining_balance: decimal          // loan balance after this payment
  status: enum (processed, failed, reversed)
}
```

### Borrower Profile

```
{
  user_id: uuid
  credit_tier: integer                // 1-5
  loans_completed: integer
  loans_active: integer
  loans_defaulted: integer
  total_borrowed: decimal
  total_repaid: decimal
  on_time_payments: integer
  late_payments: integer
  eligible_amount: decimal            // max loan amount based on current tier, reflects halving with $25 floor, rounded down to nearest $5
  sponsored_amount: decimal           // additional credit extended by sponsors
  active_loan_id: uuid | null         // current active loan (one at a time rule)
  concurrent_loan_id: uuid | null     // sponsored concurrent loan if any
  max_concurrent_loans: 2             // hard cap
  current_credit_limit: decimal       // actual available credit after any halving
  credit_reductions: [
    {
      from_amount: decimal
      to_amount: decimal
      reason: enum (default_recovery)
      loan_id: uuid
      reduced_at: datetime
    }
  ]
  default_recovery_history: [
    {
      loan_id: uuid
      recovery_method: enum (three_payments, full_payoff)
      recovered_at: datetime
      credit_before: decimal
      credit_after: decimal
    }
  ]
  credit_score_deltas: [
    {
      loan_id: uuid
      delta_points: integer             // self-reported credit score change (e.g., +22)
      reported_at: datetime
    }
  ]
  pending_goal_verification_loan_ids: [uuid]  // loans that must have goal verification submitted before new loan application (supports concurrent loans)
  loan_blocked: boolean              // true if account is blocked from new loans (failed verification, support escalation)
  verified: boolean
  credit_bureau_reporting: boolean    // whether repayment is being reported to bureaus
}
```

### Sponsor Profile

```
{
  user_id: uuid
  base_contributions: decimal             // total platform contributions (cash contributed + ad-funded)
  total_sponsored_value: decimal          // sum of all loans sponsored
  total_repaid_value: decimal             // sum of sponsored loans that repaid in full
  total_defaulted_value: decimal          // sum of sponsored loans that defaulted
  total_completed_value: decimal          // repaid + defaulted
  counteraction_remaining: decimal        // outstanding 2x recovery target from defaults
  track_record_ratio: decimal             // repaid_value / completed_value (0.0 to 1.0)
  volume_bonus: decimal                   // grows with repaid_value, up to 1.0 (+100%)
  multiplier: decimal                     // track_record_ratio x (1.0 + volume_bonus), capped at 2.0
  sponsorship_power: decimal              // base_contributions x multiplier
  sponsorships: [
    {
      loan_id: uuid
      borrower_id: uuid
      amount_extended: decimal            // credit extended for this loan
      sponsorship_type: enum (standard, upward, concurrent)  // what kind of sponsorship
      power_applied: decimal              // actual power used (halved for concurrent)
      sponsored_at: timestamp
      outcome: enum (active, repaid, defaulted)
      recovered: boolean                  // did the default get recovered later (restores track record)
      counteracted: boolean               // if defaulted, whether recovery is complete
    }
  ]
}
```

The sponsor profile is public (visible to funders evaluating sponsored loans). Track record ratio and sponsorship power are displayed alongside the sponsor's name on loan detail pages.

---

## API Endpoints

### User Management

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/:id/achievements
```

### Personal Dashboard

```
GET    /api/contributions/history         // user's contribution history (cash, ad, card, referral)
GET    /api/contributions/summary         // aggregate totals by type, time period
GET    /api/impact/personal              // user's aggregate impact across all backed projects
GET    /api/account/milestones           // retrieve user's private milestones (achieved + unseen)
```

### Ad-Funded Impact

```
POST   /api/ads/request               // request an ad to watch
POST   /api/ads/complete              // report ad view completed, trigger project credit
GET    /api/ads/today                 // user's ad views today (toward daily cap)
GET    /api/ads/history               // ad-funded contribution history
GET    /api/ads/contributions         // total funded to projects from ads (with transparency breakdown)
POST   /api/ads/report                // report inappropriate ad (content, misleading, offensive)
```

### Business Card Directory

```
POST   /api/listings                   // create a business card listing (business owner)
GET    /api/listings                   // browse listings -- filters: category, proximity, new_this_week
GET    /api/listings/:id               // listing detail
PUT    /api/listings/:id               // update listing (owner only)
POST   /api/listings/:id/view          // register a card view (triggers project credit)
POST   /api/listings/:id/save          // save listing to user's list
POST   /api/listings/:id/recommend     // leave a recommendation note
GET    /api/listings/saved             // user's saved businesses
GET    /api/listings/mine              // business owner's own listing(s)
GET    /api/listings/mine/dashboard    // owner dashboard: views, saves, recommendations, impact generated
```

### Referral Program

```
POST   /api/referrals/generate         // generate a referral link
GET    /api/referrals/mine             // user's referral dashboard: friends referred, active, earned, remaining slots
GET    /api/referrals/:id/milestones   // milestone tracker for a specific referral
GET    /api/referrals/stats            // aggregate: total earned, monthly remaining, lifetime remaining
```

### Corporate Matching (Admin)

```
POST   /api/admin/match-campaigns       // create a matching campaign
GET    /api/admin/match-campaigns       // list campaigns
PUT    /api/admin/match-campaigns/:id   // update campaign (pause, adjust)
GET    /api/admin/match-campaigns/:id/metrics  // campaign performance
```

### Corporate Matching (User-Facing)

```
GET    /api/match/active                // active match campaigns for user's selected project
GET    /api/match/impact                // user's total matched contributions
```

### Give Tab Summary

```
GET    /api/give/today                  // combined daily summary: ads watched, cards browsed, total funded, active match, streak
```

### Watershed

```
GET    /api/watershed                  // user's watershed balance, inflow/outflow totals
GET    /api/watershed/history          // watershed transaction history (deposits, deployments, repayments)
POST   /api/watershed/deploy           // deploy funds from watershed to a grant project or loan
```

### Microloans

```
POST   /api/loans                      // apply for a microloan (borrower)
GET    /api/loans                      // browse available loans (funder) -- filters: status, tier, location, category_type, niche_group, region
GET    /api/loans/:id                  // loan detail: borrower info, progress, share repayment status
POST   /api/loans/:id/fund             // fund a loan from watershed (funder)
POST   /api/loans/:id/accept           // borrower accepts funded loan (triggers disbursement)
POST   /api/loans/:id/decline          // borrower declines funded loan (returns funds to watersheds)
POST   /api/loans/:id/pay              // make a loan payment (borrower)
GET    /api/loans/:id/payments         // payment history for a loan
GET    /api/loans/mine/borrowing       // user's loans as borrower
GET    /api/loans/mine/funding         // user's loans as funder (with share counts and repayment progress)
GET    /api/borrower/profile           // borrower credit tier, history, eligible amount
POST   /api/borrower/credit-delta      // borrower voluntarily reports credit score change (e.g., +22 points)
GET    /api/loans/:id/credit-delta     // get borrower's self-reported credit score delta for a loan
```

### Loan Q&A

```
POST   /api/loans/:id/questions         // submit a question (funder, max 2 per loan)
GET    /api/loans/:id/questions         // list questions and answers for a loan
POST   /api/loans/:id/questions/:qid/answer  // borrower answers a question
POST   /api/loans/:id/questions/:qid/flag    // flag a question as inappropriate
```

### Sponsorship

```
POST   /api/loans/:id/sponsor          // sponsor a borrower's loan (extends credit)
POST   /api/loans/:id/sponsor-upward   // sponsor to increase an active loan amount
GET    /api/loans/:id/sponsors         // list sponsors for a loan with track records
GET    /api/sponsor/profile            // user's own sponsor profile (power, track record, history)
GET    /api/sponsor/:id/public         // public sponsor profile (visible on loan pages)
```

### Refinancing & Recovery

```
POST   /api/loans/:id/refinance        // request refinance -- change payment amount or extend term (borrower)
POST   /api/loans/:id/recover          // process default recovery -- system/admin triggers after 3 payments or payoff
```

### Goal Verification

```
POST   /api/loans/:id/verify-goal      // submit single goal verification update at fulfillment (borrower)
GET    /api/loans/:id/goal-evidence    // view submitted evidence (funder/admin)
POST   /api/loans/:id/flag-goal        // flag goal concern (community member)
```

### Funding Deadlines & Discovery

```
POST   /api/loans/:id/extend-deadline  // sponsor extends funding deadline (requires established sponsor history)
POST   /api/loans/:id/flag-category    // funder flags loan as miscategorized
GET    /api/loans/feed                 // personalized loan feed: location-first, general + opted-in niches
```

### Admin -- Loans

```
GET    /api/admin/loans/queue          // loan applications awaiting review
PUT    /api/admin/loans/:id/verify     // approve or reject loan application
GET    /api/admin/loans/at-risk        // loans with late or missed payments
GET    /api/admin/loans/defaults       // defaulted loans
```

### Projects

```
GET    /api/projects                  // with filters: tags, location, status, trending
GET    /api/projects/:id
GET    /api/projects/:id/updates
GET    /api/projects/:id/discussion
POST   /api/projects/:id/contribute
POST   /api/projects/:id/follow
POST   /api/projects/:id/share
```

### Project Proposals

```
POST   /api/proposals                  // submit a new project proposal
GET    /api/proposals/mine             // user's own proposals
GET    /api/proposals/:id              // proposal details
PUT    /api/proposals/:id              // edit draft proposal
POST   /api/proposals/:id/submit       // submit for review
```

### Admin / Verification

```
GET    /api/admin/proposals/queue      // proposals awaiting review
PUT    /api/admin/proposals/:id/verify // approve or reject
GET    /api/admin/projects/:id/reports // impact reports for review
```

### Communities

```
GET    /api/communities                // browse/search communities
POST   /api/communities               // create a community
GET    /api/communities/:id
POST   /api/communities/:id/join
GET    /api/communities/:id/projects
GET    /api/communities/:id/members
GET    /api/communities/:id/loan-activity  // community-level loan metrics (active loans, recycled capital, repayment rate, credit score impact)
POST   /api/communities/:id/discuss    // post in community discussion
```

### Social / Feed

```
GET    /api/feed                       // personalized: cascades, community activity, project updates
GET    /api/feed/trending              // trending projects and communities
GET    /api/progress                    // platform stats, community impact, personal progress
POST   /api/referral/send
GET    /api/user/:id/public-profile
```

### Gamification

```
GET    /api/achievements
GET    /api/user/progress             // toward next badge
POST   /api/challenge/create
GET    /api/challenges/active
```

---

## Security & Compliance

### Security Measures

| Measure | Detail |
|---------|--------|
| Encryption in transit | TLS 1.3 for all data in transit. No fallback to TLS 1.2 for payment endpoints. |
| Encryption at rest | AES-256 for all stored data. Sensitive data (watershed balances, transaction history) uses application-level encryption in addition to disk-level. |
| Security audits | Regular third-party audits |
| Penetration testing | Annual minimum; quarterly for payment and contribution endpoints |
| SOC 2 compliance | Target for Year 2+ |
| Secrets management | HashiCorp Vault or AWS Secrets Manager. No secrets in code, environment variables, or config files. |
| Dependency scanning | Automated vulnerability scanning on all dependencies (Snyk, Dependabot). Critical CVEs block deployment. |

### Data Classification

All data is classified into tiers that determine encryption, access controls, retention, and audit requirements.

| Tier | Data Types | Encryption | Access | Retention | Audit |
|------|-----------|-----------|--------|-----------|-------|
| **Critical** | Bank account numbers (for payouts), payment processor API keys, microloan disbursement credentials | AES-256 + application-level encryption. Never logged. Never cached. | Service-to-service only. No human access without dual-approval. | As required by law (typically 7 years for financial records). | Every access logged with requester identity, timestamp, and purpose. |
| **Sensitive** | Contribution history, microloan payment records, watershed balances, referral chains, business directory billing | AES-256 at rest. Encrypted in application logs. | Authenticated users (own data only). Support staff with audit trail. | Account lifetime + 3 years post-deletion. | Access logged. Quarterly review of access patterns. |
| **Personal** | Name, email, phone, physical address, device fingerprints | AES-256 at rest. | Authenticated users (own data only). Support + moderation staff. | Account lifetime + 1 year post-deletion. | Standard logging. |
| **Public** | Project descriptions, community names, business card listings, achievement badges, community progress stats | Standard database encryption. | Anyone (read). Authenticated users (write, own content). | Indefinite. User-deleted content removed within 30 days. | Standard logging. |

### KYC/AML Integration Flow

KYC (Know Your Customer) checks are required before a user can make cash contributions above $250/month or apply for microloans. Deluge uses a third-party identity verification provider for compliance.

**Identity verification flow:**

```
User signs up (email + password)
    │
    ├── Basic account created (can browse, watch ads, join communities, contribute up to $250/month)
    │
    ├── User exceeds $250/month cash contribution threshold OR submits microloan application
    │       │
    │       ├── KYC form: full legal name, date of birth, address, ID document upload
    │       │
    │       ├── Submitted to identity verification provider (Stripe Identity or Persona)
    │       │       │
    │       │       ├── Approved → Full contribution access. Microloan eligibility unlocked.
    │       │       │
    │       │       ├── Manual review → Pending (24-72 hours). User notified.
    │       │       │       │
    │       │       │       ├── Approved → Full access.
    │       │       │       └── Denied → User notified with reason (if permissible). Can resubmit.
    │       │       │
    │       │       └── Denied (identity mismatch) → User notified. Limited to $250/month.
    │       │
    │       └── ID documents transmitted directly to verification provider.
    │           Deluge stores ONLY: verification status, verification date.
    │           Deluge does NOT store government ID documents or SSN.
    │
    └── Non-cash pathways (ads, referrals, browsing) → NO KYC required.
        Users can participate fully in the free tier without identity verification.
```

**Key architectural decisions:**
- ID documents and sensitive PII are transmitted to the verification provider but never stored by Deluge.
- KYC status is stored as an enum: `not_started`, `pending`, `approved`, `denied`, `expired`.
- Verification expiry: provider may require re-verification after 2-3 years or upon suspicious activity.
- No SSN collection required (no securities/brokerage accounts).

### AML Transaction Monitoring

| Rule | Trigger | Action |
|------|---------|--------|
| Rapid successive contributions | 5+ contributions in 24 hours totaling > $2,000 | Flag for review. May indicate structuring. |
| Unusual watershed activity | Watershed credits earned > $500/month from referrals | Flag for fraud review. May indicate referral abuse. |
| Microloan pattern | Multiple small loans requested and defaulted | Flag for review. May indicate loan cycling fraud. |
| SAR filing | Any flagged activity that meets FinCEN Suspicious Activity Report criteria | Filed through compliance team (Phase 3+). May require Money Services Business registration depending on legal classification. |

AML monitoring runs as a background job (daily batch). Flagged transactions are reviewed by the operations team (Phase 3-4) or the compliance lead (Phase 5).

### Financial Compliance

| Requirement | Approach |
|-------------|----------|
| KYC checks | Via identity verification provider (Stripe Identity or Persona). Deluge does not store PII beyond verification status. See KYC flow above. |
| Money transmission | Legal classification of cash contributions and watershed credits determines whether MTL (Money Transmitter License) is required. Architecture supports both outcomes. Legal counsel required. |
| State compliance | If MTL required, state-by-state rollout. Initial launch in states with favorable thresholds. |
| Regular audits | Annual financial and operational |
| Credit bureau reporting (Year 3+) | Metro 2 format data pipeline. FCRA compliance: 30-day dispute resolution, accuracy requirements. See business model for full roadmap. |

### Ad Content Standards

| Aspect | Policy |
|--------|--------|
| **Acceptable categories** | Consumer brands, financial services (non-predatory), education, health/wellness, family-friendly entertainment, social impact brands |
| **Prohibited categories** | Gambling/sports betting, crypto speculation, scams/MLM, adult content, competitors, predatory lending, political ads, tobacco/vaping |
| **User controls** | "Report this ad" button on every ad view; reported ads blocked immediately for the reporting user |
| **Auto-moderation** | Ads receiving 3+ user reports are auto-paused pending manual review |
| **Platform review** | Pre-approved ad categories via mediation platform; quarterly audit of ad quality and report trends; maintained blocklist of advertisers and creatives |

### Data Privacy

| Requirement | Approach |
|-------------|----------|
| GDPR compliance | For any EU users (unlikely at launch, but architecture supports it) |
| CCPA compliance | For California users. Required from Day 1. |
| Privacy policy / ToS | Drafted by fintech/compliance lawyer. Covers: contribution data, device fingerprinting (fraud detection), ad tracking. |
| User data export | GDPR/CCPA-compliant export: all personal data, contribution history, impact history, community membership. JSON format. Available within 30 days of request. |
| User data deletion | Right to delete: personal data removed within 30 days. Financial records retained as required by law (7 years). Anonymized data (aggregated impact stats) retained indefinitely. |
| Device fingerprinting | Used solely for fraud detection (referral abuse, ad fraud, account duplication). Not used for advertising. Disclosed in privacy policy. |

---

## Scalability

### Database

- Read replicas for performance
- Sharding strategy for massive scale
- Automated backups
- Point-in-time recovery

### API

- Rate limiting per endpoint
- Load balancing across instances
- Horizontal scaling (add more servers)
- Aggressive caching (Redis)

### Background Jobs

- Queue system (Bull or RabbitMQ)
- Asynchronous contribution processing
- Background report generation
- Batched email/notification delivery
- Business card view aggregation (batch processing of view records, flush every 60 seconds)
- Referral milestone checking (periodic scan for milestone completions, triggers credit vesting)
- Referral fraud detection (pattern analysis for self-referral, account farming, collusion rings)
- Corporate match fund tracking (decrement fund balance per matched view, trigger exhaustion notifications)
- Ad streak calculation (daily streak evaluation, badge triggers at 7-day and 30-day milestones)

---

## FAQ (Technical)

**Q: Is my money safe?**
All contributions -- cash, ad revenue, referral credits -- flow into your personal watershed. Watershed funds are held in Deluge's platform accounts (Stripe) and are available for deployment to grants and microloans. Once deployed to a project, funds are disbursed to the verified nonprofit or borrower. All transactions are encrypted and auditable.

**Q: Can I get my money back?**
Watershed funds that have not yet been deployed can be withdrawn (cash contributions only -- ad-earned and credit-based watershed funds are non-withdrawable). Once you deploy funds to a grant project or fund a microloan, those funds are committed. Microloan funds are returned to your watershed as the borrower repays ($0.25 per share).

**Q: How do you choose projects?**
We partner with verified 501(c)(3) nonprofits. Each project goes through vetting: financial review, impact measurement plan, and ongoing reporting requirements. Full details are visible before contributing.

**Q: What if a project doesn't get fully funded?**
Projects have funding deadlines. If a project doesn't reach its goal, your contribution is redirected to the next most-popular project in that category, or you can manually choose a different project.

**Q: How do you make money?**
Ad revenue (platform keeps 40% of ad revenue from users watching ads to fund community projects), business directory fees (enhanced listings for local businesses), custodial float income (interest earned on aggregate watershed balances held in FDIC-insured accounts -- user principal is always protected and available), corporate ESG partnership fees, microloan servicing fees, and cascade sponsorship. No subscription fees and no per-transaction fees on contributions. All economics are transparent, including exactly how much of each ad view goes to projects and how much custodial interest is earned.

**Q: Is this a charity?**
Deluge is a platform that facilitates community giving and impact lending. Cash contributions fund verified nonprofit projects through your watershed. You can also watch ads or browse local business cards to generate project funding without spending money. Microloans are repaid to your watershed, creating a cycle of redeployable impact capital.

**Q: What happens if Deluge shuts down?**
Watershed funds not yet deployed would be returned per the terms of service. Contributions already disbursed to nonprofits continue funding those projects. Active microloans would be serviced through wind-down procedures with borrowers.
