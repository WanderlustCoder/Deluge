import { prisma } from '@/lib/prisma';

export type BulkOperationType = 'update' | 'delete' | 'export' | 'import';
export type BulkOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BulkAction {
  field?: string;
  value?: unknown;
  operation?: 'set' | 'increment' | 'decrement' | 'append';
}

// Create bulk operation
export async function createBulkOperation(data: {
  type: BulkOperationType;
  entityType: string;
  entityIds: string[];
  action: BulkAction;
  createdBy: string;
}) {
  return prisma.bulkOperation.create({
    data: {
      type: data.type,
      entityType: data.entityType,
      entityIds: JSON.stringify(data.entityIds),
      action: JSON.stringify(data.action),
      totalCount: data.entityIds.length,
      createdBy: data.createdBy,
    },
  });
}

// Get bulk operations
export async function getBulkOperations(options?: {
  status?: BulkOperationStatus;
  createdBy?: string;
  limit?: number;
}) {
  return prisma.bulkOperation.findMany({
    where: {
      status: options?.status,
      createdBy: options?.createdBy,
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
  });
}

// Get bulk operation by ID
export async function getBulkOperation(id: string) {
  const operation = await prisma.bulkOperation.findUnique({
    where: { id },
  });

  if (!operation) return null;

  return {
    ...operation,
    entityIds: JSON.parse(operation.entityIds) as string[],
    action: JSON.parse(operation.action) as BulkAction,
    errors: operation.errors ? JSON.parse(operation.errors) : null,
  };
}

// Process bulk operation
export async function processBulkOperation(operationId: string) {
  const operation = await getBulkOperation(operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  if (operation.status !== 'pending') {
    throw new Error('Operation already processed');
  }

  // Mark as running
  await prisma.bulkOperation.update({
    where: { id: operationId },
    data: {
      status: 'running',
      startedAt: new Date(),
    },
  });

  const errors: { entityId: string; error: string }[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < operation.entityIds.length; i++) {
    const entityId = operation.entityIds[i];

    try {
      await processEntity(operation.type as BulkOperationType, operation.entityType, entityId, operation.action);
      successCount++;
    } catch (error) {
      failureCount++;
      errors.push({
        entityId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Update progress every 10 items
    if ((i + 1) % 10 === 0 || i === operation.entityIds.length - 1) {
      await prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          processedCount: i + 1,
          successCount,
          failureCount,
        },
      });
    }
  }

  // Mark as completed
  await prisma.bulkOperation.update({
    where: { id: operationId },
    data: {
      status: failureCount === operation.totalCount ? 'failed' : 'completed',
      completedAt: new Date(),
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
    },
  });

  return { successCount, failureCount, errors };
}

// Process single entity
async function processEntity(
  type: BulkOperationType,
  entityType: string,
  entityId: string,
  action: BulkAction
) {
  switch (type) {
    case 'update':
      await updateEntity(entityType, entityId, action);
      break;
    case 'delete':
      await deleteEntity(entityType, entityId);
      break;
    case 'export':
      // Export handled separately
      break;
    case 'import':
      // Import handled separately
      break;
  }
}

// Update entity (simplified - in production would need type-safe handlers)
async function updateEntity(
  entityType: string,
  entityId: string,
  action: BulkAction
) {
  if (!action.field || action.value === undefined) {
    throw new Error('Invalid action');
  }

  const updateData: Record<string, unknown> = {};

  switch (action.operation) {
    case 'set':
      updateData[action.field] = action.value;
      break;
    case 'increment':
      updateData[action.field] = { increment: action.value };
      break;
    case 'decrement':
      updateData[action.field] = { decrement: action.value };
      break;
    default:
      updateData[action.field] = action.value;
  }

  // Handle known entity types
  switch (entityType) {
    case 'project':
      await prisma.project.update({ where: { id: entityId }, data: updateData });
      break;
    case 'user':
      await prisma.user.update({ where: { id: entityId }, data: updateData });
      break;
    case 'loan':
      await prisma.loan.update({ where: { id: entityId }, data: updateData });
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

// Delete entity
async function deleteEntity(entityType: string, entityId: string) {
  switch (entityType) {
    case 'project':
      await prisma.project.delete({ where: { id: entityId } });
      break;
    case 'notification':
      await prisma.notification.delete({ where: { id: entityId } });
      break;
    default:
      throw new Error(`Cannot delete entity type: ${entityType}`);
  }
}

// Cancel bulk operation
export async function cancelBulkOperation(operationId: string) {
  return prisma.bulkOperation.update({
    where: { id: operationId },
    data: { status: 'cancelled' },
  });
}

// Export entities to JSON
export async function exportEntities(
  entityType: string,
  entityIds: string[]
): Promise<Record<string, unknown>[]> {
  switch (entityType) {
    case 'project':
      return prisma.project.findMany({
        where: { id: { in: entityIds } },
      });
    case 'user':
      return prisma.user.findMany({
        where: { id: { in: entityIds } },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          // Exclude sensitive fields
        },
      });
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

// Import validation
export async function validateImport(
  entityType: string,
  data: Record<string, unknown>[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    switch (entityType) {
      case 'project':
        if (!row.title) errors.push(`Row ${i + 1}: Missing title`);
        if (!row.description) errors.push(`Row ${i + 1}: Missing description`);
        if (!row.fundingGoal) errors.push(`Row ${i + 1}: Missing fundingGoal`);
        break;
      default:
        errors.push(`Unknown entity type: ${entityType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
