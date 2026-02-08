import { prisma } from '@/lib/prisma';

export type AssignmentType = 'manual' | 'round_robin' | 'load_balanced';
export type QueueItemStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';

// Create work queue
export async function createWorkQueue(data: {
  name: string;
  description?: string;
  entityType: string;
  assignmentType?: AssignmentType;
  assignees?: string[];
  slaMinutes?: number;
}) {
  return prisma.workQueue.create({
    data: {
      name: data.name,
      description: data.description,
      entityType: data.entityType,
      assignmentType: data.assignmentType ?? 'manual',
      assignees: JSON.stringify(data.assignees ?? []),
      slaMinutes: data.slaMinutes,
    },
  });
}

// Get work queues
export async function getWorkQueues(options?: { isActive?: boolean }) {
  const queues = await prisma.workQueue.findMany({
    where: { isActive: options?.isActive },
    include: { items: { where: { status: { not: 'completed' } } } },
    orderBy: { priority: 'desc' },
  });

  return queues.map((q) => ({
    ...q,
    assignees: JSON.parse(q.assignees) as string[],
    pendingCount: q.items.filter((i) => i.status === 'pending').length,
    inProgressCount: q.items.filter((i) => i.status === 'in_progress').length,
  }));
}

// Get queue by ID
export async function getWorkQueue(id: string) {
  const queue = await prisma.workQueue.findUnique({
    where: { id },
    include: {
      items: {
        where: { status: { not: 'completed' } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!queue) return null;

  return {
    ...queue,
    assignees: JSON.parse(queue.assignees) as string[],
  };
}

// Add item to queue
export async function addToQueue(data: {
  queueId: string;
  entityType: string;
  entityId: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}) {
  const queue = await prisma.workQueue.findUnique({ where: { id: data.queueId } });
  if (!queue) throw new Error('Queue not found');

  const dueAt = queue.slaMinutes
    ? new Date(Date.now() + queue.slaMinutes * 60 * 1000)
    : null;

  const item = await prisma.queueItem.create({
    data: {
      queueId: data.queueId,
      entityType: data.entityType,
      entityId: data.entityId,
      priority: data.priority ?? 0,
      dueAt,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });

  // Auto-assign if queue has assignment type
  if (queue.assignmentType !== 'manual') {
    const assignees = JSON.parse(queue.assignees) as string[];
    if (assignees.length > 0) {
      const assignee = await getNextAssignee(data.queueId, queue.assignmentType as AssignmentType, assignees);
      if (assignee) {
        await assignItem(item.id, assignee);
      }
    }
  }

  return item;
}

// Get next assignee based on strategy
async function getNextAssignee(
  queueId: string,
  strategy: AssignmentType,
  assignees: string[]
): Promise<string | null> {
  if (assignees.length === 0) return null;

  switch (strategy) {
    case 'round_robin': {
      // Find assignee with oldest last assignment
      const assignments = await prisma.queueItem.groupBy({
        by: ['assignedTo'],
        where: {
          queueId,
          assignedTo: { in: assignees },
        },
        _max: { assignedAt: true },
      });

      // Find assignee not in assignments or with oldest assignment
      const assignmentMap = new Map(
        assignments.map((a) => [a.assignedTo, a._max.assignedAt])
      );

      let oldest: string | null = null;
      let oldestDate: Date | null = null;

      for (const assignee of assignees) {
        const lastAssigned = assignmentMap.get(assignee);
        if (!lastAssigned) {
          return assignee; // Never assigned
        }
        if (!oldest || lastAssigned < oldestDate!) {
          oldest = assignee;
          oldestDate = lastAssigned;
        }
      }

      return oldest;
    }

    case 'load_balanced': {
      // Find assignee with fewest active items
      const loads = await prisma.queueItem.groupBy({
        by: ['assignedTo'],
        where: {
          queueId,
          assignedTo: { in: assignees },
          status: { in: ['assigned', 'in_progress'] },
        },
        _count: true,
      });

      const loadMap = new Map(loads.map((l) => [l.assignedTo, l._count]));

      let lowest: string | null = null;
      let lowestCount = Infinity;

      for (const assignee of assignees) {
        const count = loadMap.get(assignee) ?? 0;
        if (count < lowestCount) {
          lowest = assignee;
          lowestCount = count;
        }
      }

      return lowest;
    }

    default:
      return null;
  }
}

// Assign item
export async function assignItem(itemId: string, assignedTo: string) {
  return prisma.queueItem.update({
    where: { id: itemId },
    data: {
      assignedTo,
      status: 'assigned',
      assignedAt: new Date(),
    },
  });
}

// Start work on item
export async function startItem(itemId: string) {
  return prisma.queueItem.update({
    where: { id: itemId },
    data: {
      status: 'in_progress',
      startedAt: new Date(),
    },
  });
}

// Complete item
export async function completeItem(itemId: string) {
  return prisma.queueItem.update({
    where: { id: itemId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });
}

// Get user's assigned items
export async function getUserQueueItems(userId: string) {
  return prisma.queueItem.findMany({
    where: {
      assignedTo: userId,
      status: { not: 'completed' },
    },
    include: { queue: true },
    orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
  });
}

// Get SLA breaches
export async function getSLABreaches() {
  return prisma.queueItem.findMany({
    where: {
      status: { not: 'completed' },
      dueAt: { lt: new Date() },
    },
    include: { queue: true },
    orderBy: { dueAt: 'asc' },
  });
}

// Get queue stats
export async function getQueueStats(queueId: string) {
  const [pending, assigned, inProgress, completed, breached] = await Promise.all([
    prisma.queueItem.count({ where: { queueId, status: 'pending' } }),
    prisma.queueItem.count({ where: { queueId, status: 'assigned' } }),
    prisma.queueItem.count({ where: { queueId, status: 'in_progress' } }),
    prisma.queueItem.count({ where: { queueId, status: 'completed' } }),
    prisma.queueItem.count({
      where: { queueId, status: { not: 'completed' }, dueAt: { lt: new Date() } },
    }),
  ]);

  return { pending, assigned, inProgress, completed, breached };
}

// Update queue assignees
export async function updateQueueAssignees(queueId: string, assignees: string[]) {
  return prisma.workQueue.update({
    where: { id: queueId },
    data: { assignees: JSON.stringify(assignees) },
  });
}
