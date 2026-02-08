# Plan 40: Admin Automation & Workflows

## Overview

Automate repetitive admin tasks, create custom workflows, and streamline operations. Reduce manual effort while maintaining quality control through approval workflows and intelligent automation.

**Core Principle:** Automate the routine, focus humans on judgment calls.

---

## Phase 1: Automation Framework

### 1A. Automation Schema

**Goal:** Core automation infrastructure.

**Schema Addition:**

```prisma
model Automation {
  id              String   @id @default(cuid())
  name            String
  description     String?
  trigger         Json     // Event or schedule trigger
  conditions      Json?    // When to run
  actions         Json     // What to do
  isActive        Boolean  @default(true)
  runCount        Int      @default(0)
  lastRunAt       DateTime?
  lastStatus      String?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  runs AutomationRun[]

  @@index([isActive])
}

model AutomationRun {
  id              String   @id @default(cuid())
  automationId    String
  triggeredBy     String   // event, schedule, manual
  triggerData     Json?
  status          String   @default("pending") // pending, running, completed, failed
  result          Json?
  error           String?
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  duration        Int?     // milliseconds

  automation Automation @relation(fields: [automationId], references: [id], onDelete: Cascade)

  @@index([automationId, status])
  @@index([startedAt])
}
```

**Files:**
- `src/lib/automation/index.ts` - Automation engine
- `src/lib/automation/triggers.ts` - Trigger types
- `src/lib/automation/conditions.ts` - Condition evaluation
- `src/lib/automation/actions.ts` - Action execution
- `src/lib/automation/scheduler.ts` - Scheduled automations

### 1B. Trigger Types

**Goal:** Various automation triggers.

**Files:**
- `src/lib/automation/triggers/event.ts` - Event-based
- `src/lib/automation/triggers/schedule.ts` - Time-based
- `src/lib/automation/triggers/webhook.ts` - External webhooks
- `src/lib/automation/triggers/threshold.ts` - Metric thresholds
- `src/app/api/automation/webhook/[id]/route.ts`

### 1C. Action Library

**Goal:** Reusable automation actions.

**Files:**
- `src/lib/automation/actions/email.ts` - Send emails
- `src/lib/automation/actions/notification.ts` - Send notifications
- `src/lib/automation/actions/update.ts` - Update records
- `src/lib/automation/actions/create.ts` - Create records
- `src/lib/automation/actions/slack.ts` - Slack messages
- `src/lib/automation/actions/webhook.ts` - Call webhooks

---

## Phase 2: Workflow Builder

### 2A. Workflow Schema

**Goal:** Multi-step approval workflows.

**Schema Addition:**

```prisma
model Workflow {
  id              String   @id @default(cuid())
  name            String
  description     String?
  entityType      String   // project, loan, proposal, grant
  trigger         String   // on_create, on_update, manual
  steps           Json     // [{ order, type, config, approvers }]
  isActive        Boolean  @default(true)
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  instances WorkflowInstance[]

  @@index([entityType, isActive])
}

model WorkflowInstance {
  id              String   @id @default(cuid())
  workflowId      String
  entityType      String
  entityId        String
  currentStep     Int      @default(0)
  status          String   @default("active") // active, completed, cancelled, failed
  stepHistory     Json     // History of step completions
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  metadata        Json?

  workflow Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  approvals WorkflowApproval[]

  @@index([entityType, entityId])
  @@index([workflowId, status])
}

model WorkflowApproval {
  id              String   @id @default(cuid())
  instanceId      String
  stepNumber      Int
  approverId      String
  decision        String   // approved, rejected, escalated
  comment         String?
  decidedAt       DateTime @default(now())

  instance WorkflowInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  @@index([instanceId, stepNumber])
  @@index([approverId])
}
```

**Files:**
- `src/lib/workflows/index.ts` - Workflow engine
- `src/lib/workflows/steps.ts` - Step types
- `src/lib/workflows/approvals.ts` - Approval handling
- `src/lib/workflows/escalation.ts` - Escalation logic

### 2B. Visual Workflow Builder

**Goal:** Visual workflow design.

**Files:**
- `src/app/admin/workflows/page.tsx`
- `src/app/admin/workflows/new/page.tsx`
- `src/app/admin/workflows/[id]/page.tsx`
- `src/components/admin/workflow-canvas.tsx`
- `src/components/admin/workflow-step.tsx`
- `src/components/admin/step-config.tsx`
- `src/components/admin/approver-selector.tsx`

### 2C. Approval Interface

**Goal:** Handle pending approvals.

**Files:**
- `src/app/admin/approvals/page.tsx`
- `src/components/admin/approval-queue.tsx`
- `src/components/admin/approval-card.tsx`
- `src/components/admin/approval-form.tsx`
- `src/components/admin/bulk-approve.tsx`

---

## Phase 3: Scheduled Tasks

### 3A. Task Scheduler

**Goal:** Manage scheduled jobs.

**Schema Addition:**

```prisma
model ScheduledTask {
  id              String   @id @default(cuid())
  name            String
  description     String?
  taskType        String   // report, cleanup, sync, notification
  schedule        String   // Cron expression
  timezone        String   @default("America/Los_Angeles")
  config          Json?    // Task-specific config
  isActive        Boolean  @default(true)
  lastRunAt       DateTime?
  lastStatus      String?
  nextRunAt       DateTime?
  failureCount    Int      @default(0)
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  runs TaskRun[]

  @@index([isActive, nextRunAt])
}

model TaskRun {
  id              String   @id @default(cuid())
  taskId          String
  status          String   @default("running") // running, completed, failed
  output          Json?
  error           String?
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  duration        Int?

  task ScheduledTask @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId, startedAt])
}
```

**Files:**
- `src/lib/scheduler/index.ts` - Task scheduler
- `src/lib/scheduler/cron.ts` - Cron parsing
- `src/lib/scheduler/runner.ts` - Task execution
- `src/app/admin/tasks/page.tsx`
- `src/components/admin/task-list.tsx`
- `src/components/admin/task-schedule.tsx`

### 3B. Built-in Tasks

**Goal:** Pre-built scheduled tasks.

**Files:**
- `src/lib/scheduler/tasks/reports.ts` - Generate reports
- `src/lib/scheduler/tasks/cleanup.ts` - Data cleanup
- `src/lib/scheduler/tasks/reminders.ts` - Send reminders
- `src/lib/scheduler/tasks/sync.ts` - Sync external data
- `src/lib/scheduler/tasks/metrics.ts` - Calculate metrics
- `src/lib/scheduler/tasks/backup.ts` - Backup data

### 3C. Task Monitoring

**Goal:** Monitor task health.

**Files:**
- `src/lib/scheduler/monitoring.ts`
- `src/app/admin/tasks/monitor/page.tsx`
- `src/components/admin/task-status.tsx`
- `src/components/admin/run-history.tsx`
- `src/components/admin/failure-alerts.tsx`

---

## Phase 4: Rules Engine

### 4A. Rule Schema

**Goal:** Business rules engine.

**Schema Addition:**

```prisma
model BusinessRule {
  id              String   @id @default(cuid())
  name            String
  description     String?
  category        String   // validation, pricing, eligibility, routing
  entityType      String?  // Entity this rule applies to
  conditions      Json     // Rule conditions
  actions         Json     // Actions when matched
  priority        Int      @default(0) // Higher = evaluated first
  isActive        Boolean  @default(true)
  testMode        Boolean  @default(false) // Log but don't execute
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  evaluations RuleEvaluation[]

  @@index([category, isActive])
  @@index([entityType, isActive])
}

model RuleEvaluation {
  id              String   @id @default(cuid())
  ruleId          String
  entityType      String
  entityId        String
  matched         Boolean
  result          Json?
  evaluatedAt     DateTime @default(now())

  rule BusinessRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId, evaluatedAt])
  @@index([entityType, entityId])
}
```

**Files:**
- `src/lib/rules/index.ts` - Rules engine
- `src/lib/rules/evaluator.ts` - Condition evaluation
- `src/lib/rules/executor.ts` - Action execution
- `src/app/admin/rules/page.tsx`
- `src/components/admin/rule-builder.tsx`

### 4B. Rule Categories

**Goal:** Pre-built rule categories.

**Files:**
- `src/lib/rules/categories/validation.ts` - Data validation
- `src/lib/rules/categories/eligibility.ts` - Eligibility checks
- `src/lib/rules/categories/routing.ts` - Assignment routing
- `src/lib/rules/categories/pricing.ts` - Dynamic pricing
- `src/lib/rules/categories/limits.ts` - Limit enforcement

### 4C. Rule Testing

**Goal:** Test rules before activation.

**Files:**
- `src/lib/rules/testing.ts`
- `src/app/admin/rules/test/page.tsx`
- `src/components/admin/rule-tester.tsx`
- `src/components/admin/test-results.tsx`
- Simulation mode for rules

---

## Phase 5: Bulk Operations

### 5A. Bulk Action Framework

**Goal:** Execute bulk operations.

**Schema Addition:**

```prisma
model BulkOperation {
  id              String   @id @default(cuid())
  type            String   // update, delete, export, import
  entityType      String
  criteria        Json?    // Selection criteria
  entityIds       String[] // Or explicit IDs
  action          Json     // What to do
  totalCount      Int
  processedCount  Int      @default(0)
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  status          String   @default("pending") // pending, running, completed, failed, cancelled
  errors          Json?
  createdBy       String
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  @@index([status])
  @@index([createdBy])
}
```

**Files:**
- `src/lib/bulk/index.ts` - Bulk operation engine
- `src/lib/bulk/processor.ts` - Process batches
- `src/lib/bulk/validators.ts` - Validate operations
- `src/app/api/bulk/route.ts`
- Background job for processing

### 5B. Bulk UI

**Goal:** User-friendly bulk actions.

**Files:**
- `src/app/admin/bulk/page.tsx`
- `src/components/admin/bulk-selector.tsx`
- `src/components/admin/bulk-action-form.tsx`
- `src/components/admin/bulk-progress.tsx`
- `src/components/admin/bulk-results.tsx`

### 5C. Import/Export

**Goal:** Bulk data import and export.

**Files:**
- `src/lib/bulk/import.ts`
- `src/lib/bulk/export.ts`
- `src/app/admin/import/page.tsx`
- `src/app/admin/export/page.tsx`
- `src/components/admin/csv-mapper.tsx`
- `src/components/admin/import-preview.tsx`

---

## Phase 6: Queue Management

### 6A. Queue Schema

**Goal:** Manage work queues.

**Schema Addition:**

```prisma
model WorkQueue {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String?
  entityType      String   // What items are queued
  assignmentType  String   @default("manual") // manual, round_robin, load_balanced
  assignees       String[] // User IDs
  priority        Int      @default(0)
  slaMinutes      Int?     // Time to process
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  items QueueItem[]

  @@index([isActive])
}

model QueueItem {
  id              String   @id @default(cuid())
  queueId         String
  entityType      String
  entityId        String
  priority        Int      @default(0)
  assignedTo      String?
  status          String   @default("pending") // pending, assigned, in_progress, completed
  dueAt           DateTime?
  assignedAt      DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  metadata        Json?
  createdAt       DateTime @default(now())

  queue WorkQueue @relation(fields: [queueId], references: [id], onDelete: Cascade)

  @@index([queueId, status, priority])
  @@index([assignedTo, status])
}
```

**Files:**
- `src/lib/queues/index.ts` - Queue management
- `src/lib/queues/assignment.ts` - Assignment logic
- `src/lib/queues/sla.ts` - SLA tracking
- `src/app/admin/queues/page.tsx`
- `src/components/admin/queue-dashboard.tsx`
- `src/components/admin/queue-item.tsx`

### 6B. Assignment Strategies

**Goal:** Smart work distribution.

**Files:**
- `src/lib/queues/strategies/round-robin.ts`
- `src/lib/queues/strategies/load-balanced.ts`
- `src/lib/queues/strategies/skill-based.ts`
- `src/lib/queues/strategies/priority.ts`

### 6C. SLA Management

**Goal:** Track and alert on SLAs.

**Files:**
- `src/lib/queues/sla-monitor.ts`
- `src/components/admin/sla-dashboard.tsx`
- `src/components/admin/sla-alerts.tsx`
- `src/components/admin/breach-report.tsx`

---

## Phase 7: Admin Dashboard

### 7A. Operations Dashboard

**Goal:** Unified operations view.

**Files:**
- `src/app/admin/operations/page.tsx`
- `src/components/admin/ops-overview.tsx`
- `src/components/admin/active-workflows.tsx`
- `src/components/admin/pending-approvals.tsx`
- `src/components/admin/scheduled-tasks.tsx`

### 7B. Health Monitoring

**Goal:** System health overview.

**Files:**
- `src/lib/admin/health.ts`
- `src/app/admin/health/page.tsx`
- `src/components/admin/system-health.tsx`
- `src/components/admin/service-status.tsx`
- `src/components/admin/error-rates.tsx`

### 7C. Admin Audit

**Goal:** Track admin actions.

**Files:**
- `src/lib/admin/audit.ts`
- `src/app/admin/audit/page.tsx`
- `src/components/admin/admin-activity.tsx`
- `src/components/admin/action-log.tsx`
- Complete audit trail for admin actions

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Automation Framework | Large | High |
| 2 | Workflow Builder | Large | High |
| 3 | Scheduled Tasks | Medium | High |
| 4 | Rules Engine | Large | Medium |
| 5 | Bulk Operations | Medium | Medium |
| 6 | Queue Management | Medium | Medium |
| 7 | Admin Dashboard | Medium | Medium |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Automation, AutomationRun, Workflow, WorkflowInstance, WorkflowApproval, ScheduledTask, TaskRun, BusinessRule, RuleEvaluation, BulkOperation, WorkQueue, QueueItem

### New Libraries
- `src/lib/automation/index.ts`
- `src/lib/automation/triggers/*.ts`
- `src/lib/automation/actions/*.ts`
- `src/lib/workflows/index.ts`
- `src/lib/scheduler/index.ts`
- `src/lib/scheduler/tasks/*.ts`
- `src/lib/rules/index.ts`
- `src/lib/bulk/index.ts`
- `src/lib/queues/index.ts`

### Pages
- `src/app/admin/workflows/page.tsx`
- `src/app/admin/approvals/page.tsx`
- `src/app/admin/tasks/page.tsx`
- `src/app/admin/rules/page.tsx`
- `src/app/admin/bulk/page.tsx`
- `src/app/admin/queues/page.tsx`
- `src/app/admin/operations/page.tsx`
- `src/app/admin/health/page.tsx`

---

## Pre-Built Automations

| Automation | Trigger | Action |
|------------|---------|--------|
| Welcome Email | User signup | Send welcome email |
| Project Review | Project created | Add to review queue |
| Loan Reminder | 3 days before due | Send reminder |
| Milestone Celebration | Project hits 50% | Send notification |
| Inactive User | No activity 30d | Send re-engagement |
| Daily Report | 8am daily | Generate and email report |

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test automation triggers
4. Verify workflow execution
5. Test scheduled task reliability
6. Validate rule engine accuracy
7. Test bulk operation performance

