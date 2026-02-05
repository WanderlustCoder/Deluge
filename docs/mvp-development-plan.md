# Deluge MVP Development Plan

## Summary
Build a demo-ready web app proving the core loop: **users watch ads -> revenue flows to their watershed -> they fund community projects**. Runs locally on a laptop, $0 infrastructure cost, all simulated (no real payments or ad networks).

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14+ (App Router) | Full-stack in one project, free Vercel hosting when ready |
| Language | TypeScript | Type safety, better dev experience for future contributors |
| Database | SQLite via Prisma | Zero config, single file, no accounts needed. Swap to PostgreSQL later with a 1-line change |
| Auth | NextAuth.js v5 (Credentials) | Free, no external service, runs inside the app |
| Styling | Tailwind CSS v4 | Brand colors as custom tokens (`bg-ocean`, `text-teal`, etc.) |
| Animations | Framer Motion | Cascade visualizations, progress bars, page transitions |
| Forms | React Hook Form + Zod | Validation and type safety |
| Fonts | Montserrat + Inter (next/font) | Brand identity, zero layout shift |
| Icons | Lucide React | Clean, consistent icon set |

**Total monthly cost: $0**

---

## Database Schema

**7 tables:**

- **User** — id, email, name, passwordHash, role (user/admin)
- **Watershed** — id, userId (1:1), balance, totalInflow, totalOutflow
- **WatershedTransaction** — immutable ledger of every inflow/outflow (type: ad_credit, cash_contribution, project_allocation)
- **Project** — title, description, category, fundingGoal, fundingRaised, backerCount, status (active/funded/completed), location
- **Allocation** — userId, projectId, amount (watershed -> project deployment)
- **AdView** — userId, grossRevenue, platformCut (40%), watershedCredit (60%)
- **Contribution** — userId, amount, type (cash/simulated), watershedCredit

---

## Build Phases

### Phase 1: Foundation
- Initialize Next.js + TypeScript + Tailwind + Prisma + NextAuth
- Configure brand colors, fonts, custom Tailwind theme
- Create database schema and run migrations
- Build UI primitives (Button, Card, Input, ProgressBar, Badge, Modal)
- Set up route group layouts: `(marketing)`, `(auth)`, `(app)`
- Seed database with admin user + 8-10 demo projects

**Result:** App runs, you can register/login, database has demo data.

### Phase 2: Landing Page + Project Browsing
- Marketing landing page: Hero (tagline + water gradient), How It Works, Category Cards, Manifesto, CTA
- Framer Motion scroll animations
- Project browsing with category filters
- Project detail page with cascade progress visualization (raindrop -> stream -> creek -> river -> cascade)

**Result:** Polished public page, can browse projects with animated funding progress.

### Phase 3: Ad Watching Simulation (Core Feature)
- AdPlayer component: HTML/CSS simulated ad with countdown timer, skip-after-5s
- API route: POST `/api/ads/watch` — validates session, checks daily cap (10/day), credits $0.009 to watershed
- Reward display: animated "$0.009 credited to your watershed" notification
- Daily counter: "3 of 10 ads watched today"
- Watch page assembling all components

**Result:** User watches simulated ad, watershed balance increases. The core value prop works.

### Phase 4: Watershed Dashboard
- Animated balance display with water ripple effect
- Contribution source breakdown (ads vs cash)
- Transaction history with running balance
- Summary stats: total earned, total deployed, total ads watched

**Result:** User sees their full financial picture — where money came from, where it went.

### Phase 5: Fund Allocation + Cash Contribution
- Fund page: select project, enter amount (up to watershed balance), confirm
- API route: debit watershed, credit project, update backer count
- "Fund This Project" button on project detail pages
- Simulated cash contribution form (enter amount, credits watershed directly)
- Confirmation modals with cascade metaphor copy

**Result:** Full loop works — watch ads OR contribute cash, then deploy funds to projects.

### Phase 6: Impact Dashboard + Admin
- Platform-wide aggregate stats (total funded, total ads watched, projects completed)
- Animated counters
- Admin panel: create/edit projects, view users, reset demo data

**Result:** Can show platform-level impact and prepare fresh demos.

### Phase 7: Polish + Demo Readiness
- Loading skeletons, error handling, toast notifications
- Responsive design pass
- Page transitions
- Cascade celebration animation (full-screen waterfall when project hits 100%)
- Realistic demo seed scenario (3 users, 8 projects at varied funding stages)
- One project pre-set at 95% for live cascade trigger during demos

**Result:** Investor-ready demo product.

---

## Key Constants

```
AD_GROSS_REVENUE_PER_VIEW = $0.015
PLATFORM_CUT = 40% ($0.006)
WATERSHED_CREDIT_PER_AD = 60% ($0.009)
DAILY_AD_CAP = 10
CASH_WATERSHED_PERCENTAGE = 100%
```

Cascade stages: Raindrop (0%) -> Stream (10%) -> Creek (25%) -> River (50%) -> Cascade (100%)

---

## Demo Seed Data

**Users:** Admin, Angela (active giver, $12.50 balance), DeAndre (free tier, $3.20 balance), Demo User ($0)

**Projects:** 8 Denver-area projects across categories at varied funding (10%-100%), including one at 95% for live cascade demo trigger.

---

## Project Structure

```
src/
  app/
    (marketing)/          # Landing page (public)
    (auth)/               # Login, register
    (app)/                # Authenticated app
      dashboard/          # Watershed dashboard
      projects/           # Browse + detail
      watch/              # Ad watching
      fund/               # Deploy funds
      contribute/         # Cash contribution
      impact/             # Platform stats
    admin/                # Project management, demo reset
    api/                  # Mutation endpoints only
  components/
    ui/                   # Primitives (Button, Card, etc.)
    marketing/            # Landing page sections
    watershed/            # Balance, history, sources
    projects/             # Cards, grid, cascade progress
    ads/                  # Player, reward display, counter
    layout/               # Navbar, sidebar, footer
  lib/                    # Prisma client, auth config, constants, utils
  types/                  # TypeScript types
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Demo data
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite float precision | Cosmetic rounding in balances | Use toFixed(2) for display, migrate to Decimal on PostgreSQL |
| No email verification | Can't reset passwords | Acceptable for demo; add email provider later |
| Simulated ad content | Less impressive visually | Start with HTML/CSS placeholder, swap in branded video later |
| Demo data believability | Investors may question authenticity | Use realistic Denver-area project names and varied funding stages |

---

## Migration Path (Post-Demo)

| MVP | Production | Effort |
|-----|-----------|--------|
| SQLite | PostgreSQL (Neon/Supabase free tier) | 1-line schema change |
| Simulated ads | AdMob / ironSource | Replace AdPlayer component |
| Simulated cash | Stripe Checkout | Add Stripe SDK |
| Local hosting | Vercel (free) | `git push` auto-deploys |
| NextAuth Credentials | + OAuth providers / Supabase Auth | Add provider config |

---

## Verification

After each phase, verify by:
1. `pnpm dev` — app starts without errors
2. Register a new user, log in
3. Walk through the user flow for that phase's features
4. Check Prisma Studio (`npx prisma studio`) to verify database records
5. After Phase 7: run the full demo script end-to-end, including cascade trigger

---

## Docs Updates Needed
- Update `docs/go-to-market.md` cost estimates to reflect $0 budget reality
- Update `docs/technical-architecture.md` to reflect actual stack choices (SQLite, NextAuth, etc.)
- Defer all microloan documentation to a future phase marker
