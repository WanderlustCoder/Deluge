# Technical Architecture

## Technology Stack

### Frontend

**Web App:**

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React.js | Responsive, modern, large ecosystem |
| Styling | Tailwind CSS | Rapid development, customizable design system |
| Animations | Framer Motion | Smooth water animations, gesture support |
| State Management | Redux or Zustand | Predictable state for financial data |
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
| API Layer | Node.js + Express **or** Python + FastAPI | Well-suited for fintech, async operations |
| Database | PostgreSQL | Relational data integrity for users, investments, projects |
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

### Financial / Investment

| Integration | Purpose | Options |
|-------------|---------|---------|
| Broker-Dealer | Regulated investment accounts, brokerage infrastructure, compliance | Apex Clearing, DriveWealth, Alpaca |
| Payment Processing | Parcel purchases, PCI compliance, recurring billing | Stripe |
| Portfolio Management | Diversified ETF/index fund allocation | Partner with robo-advisor (Betterment/Wealthfront) or build custom |

### Impact / Project Management

| Integration | Purpose |
|-------------|---------|
| Project Vetting | Custom internal tools for quality control |
| Impact Measurement | IRIS+ framework integration (industry standard) |
| Nonprofit Verification | GuideStar API for 501(c)(3) verification |
| Reporting | Custom dashboards + PDF generation |

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

### Advertising / Ad-Funded Investments

| Integration | Purpose | Options |
|-------------|---------|---------|
| Ad Mediation | Serve rewarded video ads, optimize eCPM across networks | Google AdMob, ironSource, AppLovin MAX |
| Ad Fraud Prevention | Detect fake views, bot traffic, device fingerprinting | HUMAN (formerly White Ops), Adjust |
| Revenue Tracking | Track ad impressions, eCPM, user credits in real-time | Custom + ad network dashboards |

### Customer Support

| Integration | Purpose | Options |
|-------------|---------|---------|
| Help Desk | Ticket management, knowledge base | Zendesk or Intercom |
| Chatbot | AI-powered first-line support | Intercom or custom |

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
    privacy: { public_profile, show_investments }
  }
  total_invested: decimal
  total_impact: decimal
  achievements: [badge_ids]
  referral_code: string
  referred_by: user_id
}
```

### Investment Account

```
{
  id: uuid
  user_id: uuid
  account_number: string  // from broker-dealer
  balance: decimal
  total_deposits: decimal
  total_returns: decimal
  allocation: {
    stocks: percentage
    bonds: percentage
  }
  performance: {
    daily: decimal
    monthly: decimal
    all_time: decimal
  }
  contribution_history: [
    {
      date: date
      amount: decimal
      source: enum (cash, ad_credit)   // distinguishes cash deposits from ad-earned credits
    }
  ]
  goals: [
    {
      id: uuid
      target_amount: decimal
      target_date: date
      created_at: timestamp
      progress: decimal                // current portfolio value as percentage of target
    }
  ]
}
```

### Parcel (Individual Investment)

```
{
  id: uuid
  user_id: uuid
  amount: decimal
  timestamp: timestamp
  breakdown: {
    investment: decimal   // 85% (default, adjustable on paid tiers)
    impact: decimal       // 15% (default)
  }
  impact_allocation: {
    tags: [strings]
    project_id: uuid
    amount: decimal
  }
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
    backers: integer           // number of unique investors
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
    type: enum (investment_amount, project_count, category_count, etc.)
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
  type: enum (portfolio_value, consistency, returns, learning)
  name: string                   // e.g., "First Hundred", "6-Month Streak"
  threshold: value               // what triggered it (e.g., 100.00 for portfolio_value, 6 for consistency months)
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

### Ad View (Ad-Funded Investment)

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
  user_credit: decimal        // user's 60%
  investment_split: {
    portfolio: decimal         // user_credit x investment ratio
    impact: decimal            // user_credit x impact ratio
  }
  project_id: uuid            // which project received the impact portion
  verified: boolean           // anti-fraud verification passed
  status: enum (pending, credited, rejected)
}
```

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

### Investing

```
POST   /api/parcel/purchase
GET    /api/account/balance
GET    /api/account/performance
GET    /api/account/history
PUT    /api/account/split             // update investment/impact ratio (paid tiers only)
```

### Personal Dashboard & Portfolio

```
GET    /api/account/performance/history   // time-series portfolio data for charts (supports 1W, 1M, 3M, 1Y, ALL ranges)
GET    /api/account/projections           // future value estimates based on current pace + adjustable inputs
POST   /api/account/goals                // create or update a private financial goal
GET    /api/account/goals                // retrieve user's private financial goals
GET    /api/account/milestones           // retrieve user's private milestones (achieved + unseen)
GET    /api/impact/personal              // user's aggregate impact across all backed projects
```

### Ad-Funded Investments

```
POST   /api/ads/request               // request an ad to watch
POST   /api/ads/complete              // report ad view completed, trigger credit
GET    /api/ads/today                 // user's ad views today (toward daily cap)
GET    /api/ads/history               // ad credit history
GET    /api/ads/earnings              // total earned from ads (with transparency breakdown)
POST   /api/ads/report                // report inappropriate ad (content, misleading, offensive)
```

### Projects

```
GET    /api/projects                  // with filters: tags, location, status, trending
GET    /api/projects/:id
GET    /api/projects/:id/updates
GET    /api/projects/:id/discussion
POST   /api/projects/:id/invest
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
POST   /api/communities/:id/discuss    // post in community discussion
```

### Social / Feed

```
GET    /api/feed                       // personalized: cascades, community activity, project updates
GET    /api/feed/trending              // trending projects and communities
GET    /api/leaderboard                // global, friends, community
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
| Encryption in transit | SSL/TLS for all data |
| Encryption at rest | AES-256 |
| Security audits | Regular third-party audits |
| Penetration testing | Annual minimum |
| SOC 2 compliance | Target for Year 2+ |

### Financial Compliance

| Requirement | Approach |
|-------------|----------|
| KYC/AML checks | Via broker-dealer partner |
| SEC registration or exemption | Legal counsel to determine structure |
| State securities compliance | State-by-state rollout via broker partner |
| Regular audits | Annual financial and operational |
| FINRA oversight | Through broker-dealer partner |

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
| GDPR compliance | For any EU users |
| CCPA compliance | For California users |
| Privacy policy / ToS | Drafted by securities lawyer |
| User data tools | Export and deletion capabilities |

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
- Asynchronous investment processing
- Background report generation
- Batched email/notification delivery

---

## FAQ (Technical)

**Q: Is my money safe?**
Your investment portion (85% by default) is held by the broker-dealer partner, a licensed and regulated financial institution. Your account is SIPC insured up to $500,000. The impact portion (15% by default) goes directly to verified nonprofit partners. Paid subscribers can adjust their split ratio.

**Q: Can I withdraw my money?**
Yes. Your investment account can be liquidated and withdrawn at any time (subject to standard market settlement, typically 2-3 days). The impact portion is a contribution and cannot be withdrawn, but you receive tax documentation.

**Q: How do you choose projects?**
We partner with verified 501(c)(3) nonprofits. Each project goes through vetting: financial review, impact measurement plan, and ongoing reporting requirements. Full details are visible before investing.

**Q: What if a project doesn't get fully funded?**
Projects have funding deadlines. If a project doesn't reach its goal, your impact allocation is redirected to the next most-popular project in that category, or you can manually choose a different project.

**Q: How do you make money?**
A flat monthly subscription ($0-12/month depending on tier, similar to Acorns), ad revenue (platform keeps 40% of ad revenue from users watching ads to earn investment credit), plus a small annual management fee (0.25-0.5%) on invested assets. No per-transaction fees -- every dollar you invest goes to your portfolio and impact projects. All fees are transparent, including exactly how much of each ad view reaches the user.

**Q: Is this a charity or an investment?**
Both. 85% of your money is invested in a diversified portfolio by default (you own this, it grows with the market). 15% funds impact projects (this is a contribution). Paid subscribers can adjust this ratio. You can also watch ads to earn investment credit with $0 cash. Platform costs are covered by a flat monthly subscription, not taken from your investment. You get financial returns AND create real-world impact.

**Q: What returns can I expect?**
The investment portion is subject to market performance. Historically, diversified portfolios return 7-10% annually, but past performance doesn't guarantee future results. The impact portion creates measurable social/environmental outcomes rather than financial returns.

**Q: What happens if Deluge shuts down?**
Your investment account is held separately by the broker-dealer partner and remains accessible. Impact contributions already disbursed to nonprofits continue funding those projects. Undisbursed funds would be returned per the terms of service.
