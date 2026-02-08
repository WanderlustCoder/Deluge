# Plan 34: Advanced Analytics & Business Intelligence

## Overview

Comprehensive analytics and business intelligence platform for administrators, community leaders, and power users. Custom dashboards, cohort analysis, predictive insights, and data exploration tools.

**Core Principle:** Turn data into actionable insights that improve platform performance and community impact.

---

## Phase 1: Analytics Foundation

### 1A. Event Tracking

**Goal:** Comprehensive event tracking system.

**Schema Addition:**

```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  eventType   String   // page_view, action, conversion, error
  eventName   String   // fund_project, watch_ad, create_loan
  userId      String?
  sessionId   String?
  properties  Json     // Event-specific data
  context     Json?    // Device, browser, location
  timestamp   DateTime @default(now())

  @@index([eventType, eventName, timestamp])
  @@index([userId, timestamp])
  @@index([sessionId])
}

model UserSession {
  id          String   @id @default(cuid())
  userId      String?
  deviceId    String
  startedAt   DateTime @default(now())
  lastSeenAt  DateTime @default(now())
  duration    Int?     // Seconds
  pageViews   Int      @default(0)
  device      Json?    // Device info
  referrer    String?
  utmSource   String?
  utmMedium   String?
  utmCampaign String?

  @@index([userId, startedAt])
  @@index([deviceId])
}
```

**Files:**
- `src/lib/analytics/events.ts` - Event tracking
- `src/lib/analytics/session.ts` - Session management
- `src/lib/analytics/context.ts` - Context enrichment
- `src/app/api/analytics/track/route.ts`
- `src/hooks/use-analytics.ts`

### 1B. Data Aggregation

**Goal:** Pre-compute common metrics.

**Schema Addition:**

```prisma
model MetricSnapshot {
  id          String   @id @default(cuid())
  metricType  String   // daily_active_users, revenue, projects_funded
  period      String   // hourly, daily, weekly, monthly
  periodStart DateTime
  periodEnd   DateTime
  value       Float
  dimensions  Json?    // { community: "boise", category: "education" }
  computedAt  DateTime @default(now())

  @@unique([metricType, period, periodStart, dimensions])
  @@index([metricType, period, periodStart])
}

model ComputedCohort {
  id          String   @id @default(cuid())
  name        String
  definition  Json     // Cohort criteria
  userCount   Int
  computedAt  DateTime @default(now())
  expiresAt   DateTime

  @@index([name])
}
```

**Files:**
- `src/lib/analytics/aggregation.ts`
- `src/lib/analytics/metrics.ts`
- `src/lib/analytics/scheduler.ts` - Cron jobs
- Background jobs for metric computation

### 1C. Data Pipeline

**Goal:** ETL for analytics.

**Files:**
- `src/lib/analytics/pipeline/extract.ts`
- `src/lib/analytics/pipeline/transform.ts`
- `src/lib/analytics/pipeline/load.ts`
- `src/lib/analytics/pipeline/jobs/daily-metrics.ts`
- `src/lib/analytics/pipeline/jobs/user-cohorts.ts`

---

## Phase 2: Dashboard Framework

### 2A. Dashboard Builder

**Goal:** Custom dashboard creation.

**Schema Addition:**

```prisma
model Dashboard {
  id          String   @id @default(cuid())
  ownerId     String
  ownerType   String   @default("user") // user, organization, admin
  name        String
  description String?
  isPublic    Boolean  @default(false)
  layout      Json     // Widget positions and sizes
  filters     Json?    // Default filters
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  widgets DashboardWidget[]
  shares  DashboardShare[]

  @@index([ownerId, ownerType])
}

model DashboardWidget {
  id          String   @id @default(cuid())
  dashboardId String
  type        String   // chart, metric, table, map
  title       String
  config      Json     // Widget configuration
  dataSource  String   // Query or metric name
  position    Json     // { x, y, width, height }
  refreshRate Int?     // Seconds
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  dashboard Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@index([dashboardId])
}

model DashboardShare {
  id          String   @id @default(cuid())
  dashboardId String
  sharedWith  String   // User ID or email
  permission  String   @default("view") // view, edit
  createdAt   DateTime @default(now())

  dashboard Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@unique([dashboardId, sharedWith])
}
```

**Files:**
- `src/lib/analytics/dashboards.ts`
- `src/app/(app)/analytics/page.tsx` - Dashboard home
- `src/app/(app)/analytics/[id]/page.tsx` - View dashboard
- `src/app/(app)/analytics/[id]/edit/page.tsx` - Edit dashboard
- `src/components/analytics/dashboard-editor.tsx`
- `src/components/analytics/widget-palette.tsx`
- `src/components/analytics/drag-drop-grid.tsx`

### 2B. Widget Library

**Goal:** Reusable visualization widgets.

**Files:**
- `src/components/analytics/widgets/metric-card.tsx`
- `src/components/analytics/widgets/line-chart.tsx`
- `src/components/analytics/widgets/bar-chart.tsx`
- `src/components/analytics/widgets/pie-chart.tsx`
- `src/components/analytics/widgets/data-table.tsx`
- `src/components/analytics/widgets/funnel-chart.tsx`
- `src/components/analytics/widgets/geo-map.tsx`
- `src/components/analytics/widgets/heatmap.tsx`
- `src/components/analytics/widgets/sparkline.tsx`

### 2C. Filter System

**Goal:** Interactive data filtering.

**Files:**
- `src/components/analytics/filters/date-range.tsx`
- `src/components/analytics/filters/dimension-filter.tsx`
- `src/components/analytics/filters/comparison-toggle.tsx`
- `src/components/analytics/filters/filter-bar.tsx`
- `src/lib/analytics/filters.ts`

---

## Phase 3: Pre-Built Dashboards

### 3A. Executive Dashboard

**Goal:** High-level platform metrics.

**Files:**
- `src/app/admin/analytics/executive/page.tsx`
- `src/components/analytics/dashboards/executive.tsx`

**Metrics:**
- Total revenue (by source)
- Active users (DAU, WAU, MAU)
- Projects funded
- Loans disbursed
- Community growth
- Retention rates

### 3B. Financial Dashboard

**Goal:** Revenue and financial health.

**Files:**
- `src/app/admin/analytics/financial/page.tsx`
- `src/components/analytics/dashboards/financial.tsx`

**Metrics:**
- Revenue by stream
- Transaction volume
- Average transaction size
- Float balance
- Processing fees
- Gross margin

### 3C. Community Dashboard

**Goal:** Community health metrics.

**Files:**
- `src/app/admin/analytics/communities/page.tsx`
- `src/components/analytics/dashboards/communities.tsx`

**Metrics:**
- Community activity
- Member engagement
- Project success rates
- Geographic distribution
- Community leaderboard

### 3D. Project Dashboard

**Goal:** Project performance.

**Files:**
- `src/app/admin/analytics/projects/page.tsx`
- `src/components/analytics/dashboards/projects.tsx`

**Metrics:**
- Funding velocity
- Success rates
- Category breakdown
- Average funding time
- Backer conversion

---

## Phase 4: Cohort Analysis

### 4A. Cohort Builder

**Goal:** Create and analyze cohorts.

**Files:**
- `src/lib/analytics/cohorts.ts`
- `src/app/(app)/analytics/cohorts/page.tsx`
- `src/app/(app)/analytics/cohorts/new/page.tsx`
- `src/components/analytics/cohort-builder.tsx`
- `src/components/analytics/cohort-criteria.tsx`

**Cohort Types:**
- Acquisition cohort (signup date)
- Behavioral cohort (actions taken)
- Demographic cohort (attributes)
- Custom cohort (query-based)

### 4B. Cohort Charts

**Goal:** Visualize cohort behavior.

**Files:**
- `src/components/analytics/cohort-retention.tsx`
- `src/components/analytics/cohort-comparison.tsx`
- `src/components/analytics/cohort-table.tsx`
- `src/components/analytics/lifetime-value.tsx`

### 4C. Retention Analysis

**Goal:** Deep retention insights.

**Files:**
- `src/lib/analytics/retention.ts`
- `src/app/(app)/analytics/retention/page.tsx`
- `src/components/analytics/retention-matrix.tsx`
- `src/components/analytics/churn-analysis.tsx`
- `src/components/analytics/reactivation.tsx`

---

## Phase 5: Funnel & Conversion

### 5A. Funnel Builder

**Goal:** Track conversion funnels.

**Schema Addition:**

```prisma
model AnalyticsFunnel {
  id          String   @id @default(cuid())
  name        String
  description String?
  steps       Json     // [{ name, eventName, filters }]
  ownerId     String
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
}
```

**Files:**
- `src/lib/analytics/funnels.ts`
- `src/app/(app)/analytics/funnels/page.tsx`
- `src/app/(app)/analytics/funnels/new/page.tsx`
- `src/components/analytics/funnel-builder.tsx`
- `src/components/analytics/funnel-step.tsx`

### 5B. Funnel Visualization

**Goal:** Interactive funnel charts.

**Files:**
- `src/components/analytics/funnel-chart.tsx`
- `src/components/analytics/funnel-breakdown.tsx`
- `src/components/analytics/conversion-rate.tsx`
- `src/components/analytics/drop-off-analysis.tsx`

### 5C. A/B Test Analysis

**Goal:** Experiment result analysis.

**Schema Addition:**

```prisma
model Experiment {
  id          String   @id @default(cuid())
  name        String
  hypothesis  String?
  status      String   @default("draft") // draft, running, completed, stopped
  startDate   DateTime?
  endDate     DateTime?
  variants    Json     // [{ id, name, weight }]
  targetMetric String
  minSampleSize Int?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignments ExperimentAssignment[]

  @@index([status])
}

model ExperimentAssignment {
  id           String   @id @default(cuid())
  experimentId String
  userId       String
  variantId    String
  assignedAt   DateTime @default(now())
  convertedAt  DateTime?
  metricValue  Float?

  experiment Experiment @relation(fields: [experimentId], references: [id], onDelete: Cascade)

  @@unique([experimentId, userId])
  @@index([experimentId, variantId])
}
```

**Files:**
- `src/lib/analytics/experiments.ts`
- `src/app/(app)/analytics/experiments/page.tsx`
- `src/components/analytics/experiment-results.tsx`
- `src/components/analytics/statistical-significance.tsx`
- `src/components/analytics/variant-comparison.tsx`

---

## Phase 6: Data Exploration

### 6A. Query Builder

**Goal:** Visual query construction.

**Files:**
- `src/lib/analytics/query-builder.ts`
- `src/app/(app)/analytics/explore/page.tsx`
- `src/components/analytics/query-builder.tsx`
- `src/components/analytics/dimension-selector.tsx`
- `src/components/analytics/metric-selector.tsx`
- `src/components/analytics/query-results.tsx`

### 6B. Saved Queries

**Goal:** Save and share queries.

**Schema Addition:**

```prisma
model SavedQuery {
  id          String   @id @default(cuid())
  name        String
  description String?
  query       Json     // Query definition
  ownerId     String
  isPublic    Boolean  @default(false)
  lastRunAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
}
```

**Files:**
- `src/lib/analytics/saved-queries.ts`
- `src/app/api/analytics/queries/route.ts`
- `src/components/analytics/save-query-modal.tsx`
- `src/components/analytics/query-library.tsx`

### 6C. Data Export

**Goal:** Export analysis results.

**Files:**
- `src/lib/analytics/export.ts`
- `src/components/analytics/export-button.tsx`
- CSV, Excel, JSON exports
- Scheduled report delivery

---

## Phase 7: Predictive Analytics

### 7A. Forecasting

**Goal:** Predict future metrics.

**Files:**
- `src/lib/analytics/forecasting.ts`
- `src/components/analytics/forecast-chart.tsx`
- `src/components/analytics/trend-projection.tsx`
- `src/components/analytics/seasonality.tsx`

**Forecasts:**
- Revenue projections
- User growth
- Project success probability
- Churn prediction

### 7B. Anomaly Detection

**Goal:** Detect unusual patterns.

**Schema Addition:**

```prisma
model Anomaly {
  id          String   @id @default(cuid())
  metricType  String
  detectedAt  DateTime
  severity    String   // low, medium, high, critical
  expected    Float
  actual      Float
  deviation   Float
  description String?
  status      String   @default("open") // open, acknowledged, resolved
  resolvedBy  String?
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([metricType, detectedAt])
  @@index([status, severity])
}
```

**Files:**
- `src/lib/analytics/anomaly-detection.ts`
- `src/app/admin/analytics/anomalies/page.tsx`
- `src/components/analytics/anomaly-alert.tsx`
- `src/components/analytics/anomaly-chart.tsx`
- Alert notifications for anomalies

### 7C. Insights Engine

**Goal:** Auto-generate insights.

**Files:**
- `src/lib/analytics/insights.ts`
- `src/components/analytics/auto-insights.tsx`
- `src/components/analytics/insight-card.tsx`
- `src/components/analytics/recommended-actions.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Analytics Foundation | Large | High |
| 2 | Dashboard Framework | Large | High |
| 3 | Pre-Built Dashboards | Medium | High |
| 4 | Cohort Analysis | Large | Medium |
| 5 | Funnel & Conversion | Medium | Medium |
| 6 | Data Exploration | Large | Medium |
| 7 | Predictive Analytics | Large | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add AnalyticsEvent, UserSession, MetricSnapshot, ComputedCohort, Dashboard, DashboardWidget, DashboardShare, AnalyticsFunnel, Experiment, ExperimentAssignment, SavedQuery, Anomaly

### New Libraries
- `src/lib/analytics/events.ts`
- `src/lib/analytics/session.ts`
- `src/lib/analytics/aggregation.ts`
- `src/lib/analytics/metrics.ts`
- `src/lib/analytics/dashboards.ts`
- `src/lib/analytics/cohorts.ts`
- `src/lib/analytics/retention.ts`
- `src/lib/analytics/funnels.ts`
- `src/lib/analytics/experiments.ts`
- `src/lib/analytics/query-builder.ts`
- `src/lib/analytics/forecasting.ts`
- `src/lib/analytics/anomaly-detection.ts`
- `src/lib/analytics/insights.ts`

### Pages
- `src/app/(app)/analytics/page.tsx`
- `src/app/(app)/analytics/[id]/page.tsx`
- `src/app/(app)/analytics/cohorts/page.tsx`
- `src/app/(app)/analytics/funnels/page.tsx`
- `src/app/(app)/analytics/retention/page.tsx`
- `src/app/(app)/analytics/experiments/page.tsx`
- `src/app/(app)/analytics/explore/page.tsx`
- `src/app/admin/analytics/executive/page.tsx`
- `src/app/admin/analytics/financial/page.tsx`
- `src/app/admin/analytics/anomalies/page.tsx`

---

## Key Metrics

| Category | Metrics |
|----------|---------|
| **Engagement** | DAU, WAU, MAU, Session duration, Pages/session |
| **Growth** | Signups, Activation rate, Referral rate, Churn |
| **Revenue** | GMV, Revenue, ARPU, LTV, CAC |
| **Projects** | Created, Funded, Success rate, Avg funding time |
| **Community** | Active communities, Members, Projects per community |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Verify event tracking
4. Test dashboard creation
5. Validate cohort calculations
6. Test funnel accuracy
7. Verify export functionality

