import { prisma } from '@/lib/prisma';

export type WorkflowStatus = 'active' | 'completed' | 'cancelled' | 'failed';
export type ApprovalDecision = 'approved' | 'rejected' | 'escalated';

export interface WorkflowStep {
  order: number;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'delay';
  config: Record<string, unknown>;
  approvers?: string[];  // User IDs or role names
  requiredApprovals?: number;  // How many approvers needed
  timeout?: number;  // Minutes before escalation
}

// Create workflow
export async function createWorkflow(data: {
  name: string;
  description?: string;
  entityType: string;
  trigger: string;
  steps: WorkflowStep[];
  createdBy: string;
}) {
  return prisma.adminWorkflow.create({
    data: {
      name: data.name,
      description: data.description,
      entityType: data.entityType,
      trigger: data.trigger,
      steps: JSON.stringify(data.steps),
      createdBy: data.createdBy,
    },
  });
}

// Get workflows
export async function getWorkflows(options?: { entityType?: string; isActive?: boolean }) {
  return prisma.adminWorkflow.findMany({
    where: {
      entityType: options?.entityType,
      isActive: options?.isActive,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get workflow by ID
export async function getWorkflow(id: string) {
  const workflow = await prisma.adminWorkflow.findUnique({
    where: { id },
    include: {
      instances: { take: 10, orderBy: { startedAt: 'desc' } },
    },
  });

  if (!workflow) return null;

  return {
    ...workflow,
    steps: JSON.parse(workflow.steps) as WorkflowStep[],
  };
}

// Start workflow instance
export async function startWorkflow(
  workflowId: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  const workflow = await getWorkflow(workflowId);
  if (!workflow || !workflow.isActive) {
    throw new Error('Workflow not found or inactive');
  }

  const instance = await prisma.workflowInstance.create({
    data: {
      workflowId,
      entityType,
      entityId,
      currentStep: 0,
      status: 'active',
      stepHistory: JSON.stringify([]),
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  // Process first step
  await processStep(instance.id);

  return instance;
}

// Process current step
export async function processStep(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { workflow: true },
  });

  if (!instance || instance.status !== 'active') {
    return;
  }

  const steps = JSON.parse(instance.workflow.steps) as WorkflowStep[];
  const currentStep = steps[instance.currentStep];

  if (!currentStep) {
    // Workflow complete
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    return;
  }

  switch (currentStep.type) {
    case 'approval':
      // Wait for approval - no automatic processing
      break;

    case 'notification':
      // Send notification and move to next step
      console.log('[Workflow] Sending notification:', currentStep.config);
      await advanceStep(instanceId);
      break;

    case 'action':
      // Execute action and move to next step
      console.log('[Workflow] Executing action:', currentStep.config);
      await advanceStep(instanceId);
      break;

    case 'delay':
      // Would schedule delayed processing
      console.log('[Workflow] Delay step:', currentStep.config);
      break;
  }
}

// Advance to next step
async function advanceStep(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { workflow: true },
  });

  if (!instance) return;

  const steps = JSON.parse(instance.workflow.steps) as WorkflowStep[];
  const stepHistory = JSON.parse(instance.stepHistory) as Record<string, unknown>[];

  stepHistory.push({
    step: instance.currentStep,
    completedAt: new Date().toISOString(),
  });

  const nextStep = instance.currentStep + 1;

  if (nextStep >= steps.length) {
    // Workflow complete
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStep: nextStep,
        stepHistory: JSON.stringify(stepHistory),
        status: 'completed',
        completedAt: new Date(),
      },
    });
  } else {
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStep: nextStep,
        stepHistory: JSON.stringify(stepHistory),
      },
    });

    // Process next step
    await processStep(instanceId);
  }
}

// Submit approval
export async function submitApproval(
  instanceId: string,
  approverId: string,
  decision: ApprovalDecision,
  comment?: string
) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { workflow: true, approvals: true },
  });

  if (!instance || instance.status !== 'active') {
    throw new Error('Instance not found or not active');
  }

  const steps = JSON.parse(instance.workflow.steps) as WorkflowStep[];
  const currentStep = steps[instance.currentStep];

  if (!currentStep || currentStep.type !== 'approval') {
    throw new Error('Current step is not an approval step');
  }

  // Create approval record
  await prisma.workflowApproval.create({
    data: {
      instanceId,
      stepNumber: instance.currentStep,
      approverId,
      decision,
      comment,
    },
  });

  // Check if approval threshold met
  const stepApprovals = instance.approvals.filter(
    (a) => a.stepNumber === instance.currentStep
  );
  stepApprovals.push({ decision } as typeof instance.approvals[0]);

  const approvalCount = stepApprovals.filter((a) => a.decision === 'approved').length;
  const rejectionCount = stepApprovals.filter((a) => a.decision === 'rejected').length;
  const requiredApprovals = currentStep.requiredApprovals ?? 1;

  if (decision === 'rejected' || rejectionCount > 0) {
    // Cancel workflow on rejection
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: 'failed',
        completedAt: new Date(),
      },
    });
  } else if (approvalCount >= requiredApprovals) {
    // Advance to next step
    await advanceStep(instanceId);
  }
}

// Get pending approvals for user
export async function getPendingApprovals(approverId: string) {
  const instances = await prisma.workflowInstance.findMany({
    where: { status: 'active' },
    include: {
      workflow: true,
      approvals: true,
    },
  });

  const pending = [];

  for (const instance of instances) {
    const steps = JSON.parse(instance.workflow.steps) as WorkflowStep[];
    const currentStep = steps[instance.currentStep];

    if (
      currentStep?.type === 'approval' &&
      currentStep.approvers?.includes(approverId)
    ) {
      // Check if user already approved
      const alreadyApproved = instance.approvals.some(
        (a) => a.approverId === approverId && a.stepNumber === instance.currentStep
      );

      if (!alreadyApproved) {
        pending.push({
          instance,
          step: currentStep,
          stepNumber: instance.currentStep,
        });
      }
    }
  }

  return pending;
}

// Get workflow instance
export async function getWorkflowInstance(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: {
      workflow: true,
      approvals: { orderBy: { decidedAt: 'desc' } },
    },
  });

  if (!instance) return null;

  return {
    ...instance,
    workflow: {
      ...instance.workflow,
      steps: JSON.parse(instance.workflow.steps) as WorkflowStep[],
    },
    stepHistory: JSON.parse(instance.stepHistory),
    metadata: instance.metadata ? JSON.parse(instance.metadata) : null,
  };
}

// Cancel workflow
export async function cancelWorkflow(instanceId: string) {
  return prisma.workflowInstance.update({
    where: { id: instanceId },
    data: {
      status: 'cancelled',
      completedAt: new Date(),
    },
  });
}
