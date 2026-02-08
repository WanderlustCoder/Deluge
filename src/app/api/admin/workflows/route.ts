import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createWorkflow,
  getWorkflows,
  startWorkflow,
  getPendingApprovals,
  submitApproval,
  type WorkflowStep,
  type ApprovalDecision,
} from '@/lib/workflows';

// GET: List workflows or pending approvals
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'approvals') {
      const approvals = await getPendingApprovals(session.user.id);
      return NextResponse.json(approvals);
    }

    const entityType = searchParams.get('entityType') ?? undefined;
    const isActive = searchParams.get('active');

    const workflows = await getWorkflows({
      entityType,
      isActive: isActive !== null ? isActive === 'true' : undefined,
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST: Create workflow, start instance, or submit approval
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === 'start') {
      const { workflowId, entityType, entityId, metadata } = body as {
        workflowId: string;
        entityType: string;
        entityId: string;
        metadata?: Record<string, unknown>;
      };

      if (!workflowId || !entityType || !entityId) {
        return NextResponse.json(
          { error: 'Workflow ID, entity type, and entity ID required' },
          { status: 400 }
        );
      }

      const instance = await startWorkflow(workflowId, entityType, entityId, metadata);
      return NextResponse.json(instance);
    }

    if (action === 'approve') {
      const { instanceId, decision, comment } = body as {
        instanceId: string;
        decision: ApprovalDecision;
        comment?: string;
      };

      if (!instanceId || !decision) {
        return NextResponse.json(
          { error: 'Instance ID and decision required' },
          { status: 400 }
        );
      }

      await submitApproval(instanceId, session.user.id, decision, comment);
      return NextResponse.json({ success: true });
    }

    // Create new workflow
    const { name, description, entityType, trigger, steps } = body as {
      name: string;
      description?: string;
      entityType: string;
      trigger: string;
      steps: WorkflowStep[];
    };

    if (!name || !entityType || !trigger || !steps) {
      return NextResponse.json(
        { error: 'Name, entity type, trigger, and steps are required' },
        { status: 400 }
      );
    }

    const workflow = await createWorkflow({
      name,
      description,
      entityType,
      trigger,
      steps,
      createdBy: session.user.id,
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error with workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    );
  }
}
