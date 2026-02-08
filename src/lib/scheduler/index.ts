import { prisma } from '@/lib/prisma';

export type TaskType = 'report' | 'cleanup' | 'sync' | 'notification' | 'backup' | 'metrics';
export type TaskStatus = 'running' | 'completed' | 'failed';

export interface TaskConfig {
  recipients?: string[];
  format?: string;
  retentionDays?: number;
  source?: string;
  [key: string]: unknown;
}

// Create scheduled task
export async function createScheduledTask(data: {
  name: string;
  description?: string;
  taskType: TaskType;
  schedule: string;
  timezone?: string;
  config?: TaskConfig;
  createdBy: string;
}) {
  const nextRun = calculateNextRun(data.schedule, data.timezone);

  return prisma.scheduledTask.create({
    data: {
      name: data.name,
      description: data.description,
      taskType: data.taskType,
      schedule: data.schedule,
      timezone: data.timezone ?? 'America/Los_Angeles',
      config: data.config ? JSON.stringify(data.config) : null,
      nextRunAt: nextRun,
      createdBy: data.createdBy,
    },
  });
}

// Get scheduled tasks
export async function getScheduledTasks(options?: { isActive?: boolean; taskType?: TaskType }) {
  return prisma.scheduledTask.findMany({
    where: {
      isActive: options?.isActive,
      taskType: options?.taskType,
    },
    orderBy: { nextRunAt: 'asc' },
  });
}

// Get task by ID
export async function getScheduledTask(id: string) {
  const task = await prisma.scheduledTask.findUnique({
    where: { id },
    include: { runs: { take: 10, orderBy: { startedAt: 'desc' } } },
  });

  if (!task) return null;

  return {
    ...task,
    config: task.config ? JSON.parse(task.config) as TaskConfig : null,
  };
}

// Toggle task
export async function toggleScheduledTask(id: string, isActive: boolean) {
  const task = await prisma.scheduledTask.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  return prisma.scheduledTask.update({
    where: { id },
    data: {
      isActive,
      nextRunAt: isActive ? calculateNextRun(task.schedule, task.timezone) : null,
    },
  });
}

// Run task
export async function runScheduledTask(taskId: string) {
  const task = await getScheduledTask(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Create run record
  const run = await prisma.taskRun.create({
    data: {
      taskId,
      status: 'running',
    },
  });

  const startTime = Date.now();

  try {
    // Execute task
    const result = await executeTask(task.taskType as TaskType, task.config);

    // Update run as completed
    await prisma.$transaction([
      prisma.taskRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          output: JSON.stringify(result),
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      }),
      prisma.scheduledTask.update({
        where: { id: taskId },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'completed',
          nextRunAt: calculateNextRun(task.schedule, task.timezone),
          failureCount: 0,
        },
      }),
    ]);

    return { success: true, result };
  } catch (error) {
    await prisma.$transaction([
      prisma.taskRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      }),
      prisma.scheduledTask.update({
        where: { id: taskId },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'failed',
          nextRunAt: calculateNextRun(task.schedule, task.timezone),
          failureCount: { increment: 1 },
        },
      }),
    ]);

    throw error;
  }
}

// Execute task based on type
async function executeTask(
  type: TaskType,
  config: TaskConfig | null
): Promise<Record<string, unknown>> {
  switch (type) {
    case 'report':
      console.log('[Scheduler] Generating report:', config);
      return { type: 'report', generated: true };

    case 'cleanup':
      console.log('[Scheduler] Running cleanup:', config);
      // Would clean up old data
      return { type: 'cleanup', itemsRemoved: 0 };

    case 'sync':
      console.log('[Scheduler] Syncing data:', config);
      return { type: 'sync', synced: true };

    case 'notification':
      console.log('[Scheduler] Sending notifications:', config);
      return { type: 'notification', sent: 0 };

    case 'backup':
      console.log('[Scheduler] Creating backup:', config);
      return { type: 'backup', created: true };

    case 'metrics':
      console.log('[Scheduler] Calculating metrics:', config);
      return { type: 'metrics', calculated: true };

    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

// Calculate next run time from cron expression (simplified)
function calculateNextRun(schedule: string, _timezone?: string): Date {
  // Simplified - in production use a proper cron library
  const parts = schedule.split(' ');

  // Default to next hour if can't parse
  const next = new Date();
  next.setMinutes(0);
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setHours(next.getHours() + 1);

  // Handle simple cases
  if (parts.length >= 2) {
    const minute = parts[0];
    const hour = parts[1];

    if (minute !== '*' && !isNaN(parseInt(minute))) {
      next.setMinutes(parseInt(minute));
    }

    if (hour !== '*' && !isNaN(parseInt(hour))) {
      next.setHours(parseInt(hour));
      if (next <= new Date()) {
        next.setDate(next.getDate() + 1);
      }
    }
  }

  return next;
}

// Get due tasks
export async function getDueTasks() {
  return prisma.scheduledTask.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: new Date() },
    },
    orderBy: { nextRunAt: 'asc' },
  });
}

// Process due tasks
export async function processDueTasks() {
  const dueTasks = await getDueTasks();
  const results = [];

  for (const task of dueTasks) {
    try {
      await runScheduledTask(task.id);
      results.push({ id: task.id, success: true });
    } catch (error) {
      results.push({
        id: task.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

// Get task run history
export async function getTaskRunHistory(taskId: string, limit: number = 20) {
  return prisma.taskRun.findMany({
    where: { taskId },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

// Get failed tasks for alerting
export async function getFailedTasks(minFailures: number = 3) {
  return prisma.scheduledTask.findMany({
    where: {
      isActive: true,
      failureCount: { gte: minFailures },
    },
    orderBy: { failureCount: 'desc' },
  });
}
