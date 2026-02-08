import { prisma } from '@/lib/prisma';

export type TriggerType = 'event' | 'schedule' | 'webhook' | 'threshold';
export type AutomationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AutomationTrigger {
  type: TriggerType;
  event?: string;           // Event name
  schedule?: string;        // Cron expression
  webhookPath?: string;     // Webhook path
  threshold?: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'startsWith';
  value: unknown;
}

export interface AutomationAction {
  type: 'email' | 'notification' | 'update' | 'create' | 'webhook' | 'slack';
  config: Record<string, unknown>;
}

// Create automation
export async function createAutomation(data: {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  createdBy: string;
}) {
  return prisma.automation.create({
    data: {
      name: data.name,
      description: data.description,
      trigger: JSON.stringify(data.trigger),
      conditions: data.conditions ? JSON.stringify(data.conditions) : null,
      actions: JSON.stringify(data.actions),
      createdBy: data.createdBy,
    },
  });
}

// Get automations
export async function getAutomations(options?: { isActive?: boolean }) {
  return prisma.automation.findMany({
    where: { isActive: options?.isActive },
    orderBy: { createdAt: 'desc' },
  });
}

// Get automation by ID
export async function getAutomation(id: string) {
  const automation = await prisma.automation.findUnique({
    where: { id },
    include: { runs: { take: 10, orderBy: { startedAt: 'desc' } } },
  });

  if (!automation) return null;

  return {
    ...automation,
    trigger: JSON.parse(automation.trigger) as AutomationTrigger,
    conditions: automation.conditions
      ? (JSON.parse(automation.conditions) as AutomationCondition[])
      : null,
    actions: JSON.parse(automation.actions) as AutomationAction[],
  };
}

// Toggle automation
export async function toggleAutomation(id: string, isActive: boolean) {
  return prisma.automation.update({
    where: { id },
    data: { isActive },
  });
}

// Run automation
export async function runAutomation(
  automationId: string,
  triggeredBy: TriggerType | 'manual',
  triggerData?: Record<string, unknown>
) {
  const automation = await getAutomation(automationId);
  if (!automation || !automation.isActive) {
    throw new Error('Automation not found or inactive');
  }

  // Create run record
  const run = await prisma.automationRun.create({
    data: {
      automationId,
      triggeredBy,
      triggerData: triggerData ? JSON.stringify(triggerData) : null,
      status: 'running',
    },
  });

  const startTime = Date.now();

  try {
    // Check conditions
    if (automation.conditions && triggerData) {
      const conditionsMet = evaluateConditions(automation.conditions, triggerData);
      if (!conditionsMet) {
        await prisma.automationRun.update({
          where: { id: run.id },
          data: {
            status: 'completed',
            result: JSON.stringify({ skipped: true, reason: 'Conditions not met' }),
            completedAt: new Date(),
            duration: Date.now() - startTime,
          },
        });
        return { success: true, skipped: true };
      }
    }

    // Execute actions
    const results = [];
    for (const action of automation.actions) {
      const result = await executeAction(action, triggerData);
      results.push(result);
    }

    // Update run as completed
    await prisma.$transaction([
      prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          result: JSON.stringify(results),
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      }),
      prisma.automation.update({
        where: { id: automationId },
        data: {
          runCount: { increment: 1 },
          lastRunAt: new Date(),
          lastStatus: 'completed',
        },
      }),
    ]);

    return { success: true, results };
  } catch (error) {
    await prisma.$transaction([
      prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      }),
      prisma.automation.update({
        where: { id: automationId },
        data: {
          runCount: { increment: 1 },
          lastRunAt: new Date(),
          lastStatus: 'failed',
        },
      }),
    ]);

    throw error;
  }
}

// Evaluate conditions
function evaluateConditions(
  conditions: AutomationCondition[],
  data: Record<string, unknown>
): boolean {
  for (const condition of conditions) {
    const value = data[condition.field];

    switch (condition.operator) {
      case 'eq':
        if (value !== condition.value) return false;
        break;
      case 'neq':
        if (value === condition.value) return false;
        break;
      case 'gt':
        if (typeof value !== 'number' || value <= (condition.value as number)) return false;
        break;
      case 'lt':
        if (typeof value !== 'number' || value >= (condition.value as number)) return false;
        break;
      case 'contains':
        if (typeof value !== 'string' || !value.includes(condition.value as string)) return false;
        break;
      case 'startsWith':
        if (typeof value !== 'string' || !value.startsWith(condition.value as string)) return false;
        break;
    }
  }

  return true;
}

// Execute action (stub implementations)
async function executeAction(
  action: AutomationAction,
  data?: Record<string, unknown>
): Promise<{ type: string; success: boolean; message?: string }> {
  switch (action.type) {
    case 'email':
      // Would integrate with email service
      console.log('[Automation] Send email:', action.config, data);
      return { type: 'email', success: true, message: 'Email queued' };

    case 'notification':
      // Would create notification
      console.log('[Automation] Send notification:', action.config, data);
      return { type: 'notification', success: true, message: 'Notification sent' };

    case 'update':
      // Would update record
      console.log('[Automation] Update record:', action.config, data);
      return { type: 'update', success: true, message: 'Record updated' };

    case 'create':
      // Would create record
      console.log('[Automation] Create record:', action.config, data);
      return { type: 'create', success: true, message: 'Record created' };

    case 'webhook':
      // Would call webhook
      console.log('[Automation] Call webhook:', action.config, data);
      return { type: 'webhook', success: true, message: 'Webhook called' };

    case 'slack':
      // Would send Slack message
      console.log('[Automation] Send Slack:', action.config, data);
      return { type: 'slack', success: true, message: 'Slack message sent' };

    default:
      return { type: action.type, success: false, message: 'Unknown action type' };
  }
}

// Get automation runs
export async function getAutomationRuns(automationId: string, limit: number = 20) {
  return prisma.automationRun.findMany({
    where: { automationId },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

// Trigger automations for an event
export async function triggerEventAutomations(
  eventName: string,
  eventData: Record<string, unknown>
) {
  const automations = await prisma.automation.findMany({
    where: { isActive: true },
  });

  for (const automation of automations) {
    const trigger = JSON.parse(automation.trigger) as AutomationTrigger;

    if (trigger.type === 'event' && trigger.event === eventName) {
      try {
        await runAutomation(automation.id, 'event', eventData);
      } catch (error) {
        console.error(`Automation ${automation.id} failed:`, error);
      }
    }
  }
}
