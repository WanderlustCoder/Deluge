import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createAutomation,
  getAutomations,
  runAutomation,
  type AutomationTrigger,
  type AutomationCondition,
  type AutomationAction,
} from '@/lib/automation';

// GET: List automations
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    const automations = await getAutomations({
      isActive: isActive !== null ? isActive === 'true' : undefined,
    });

    return NextResponse.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST: Create automation or run automation
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === 'run') {
      const { automationId, triggerData } = body as {
        automationId: string;
        triggerData?: Record<string, unknown>;
      };

      if (!automationId) {
        return NextResponse.json(
          { error: 'Automation ID required' },
          { status: 400 }
        );
      }

      const result = await runAutomation(automationId, 'manual', triggerData);
      return NextResponse.json(result);
    }

    // Create new automation
    const { name, description, trigger, conditions, actions } = body as {
      name: string;
      description?: string;
      trigger: AutomationTrigger;
      conditions?: AutomationCondition[];
      actions: AutomationAction[];
    };

    if (!name || !trigger || !actions) {
      return NextResponse.json(
        { error: 'Name, trigger, and actions are required' },
        { status: 400 }
      );
    }

    const automation = await createAutomation({
      name,
      description,
      trigger,
      conditions,
      actions,
      createdBy: session.user.id,
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error('Error with automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    );
  }
}
