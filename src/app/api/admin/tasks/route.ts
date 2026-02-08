import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createScheduledTask,
  getScheduledTasks,
  runScheduledTask,
  toggleScheduledTask,
  getFailedTasks,
  type TaskType,
  type TaskConfig,
} from '@/lib/scheduler';

// GET: List scheduled tasks
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('active');
    const failed = searchParams.get('failed');

    if (failed === 'true') {
      const tasks = await getFailedTasks();
      return NextResponse.json(tasks);
    }

    const tasks = await getScheduledTasks({
      taskType: type as TaskType | undefined,
      isActive: isActive !== null ? isActive === 'true' : undefined,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST: Create task or run task
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === 'run') {
      const { taskId } = body as { taskId: string };

      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID required' },
          { status: 400 }
        );
      }

      const result = await runScheduledTask(taskId);
      return NextResponse.json(result);
    }

    if (action === 'toggle') {
      const { taskId, isActive } = body as { taskId: string; isActive: boolean };

      if (!taskId || isActive === undefined) {
        return NextResponse.json(
          { error: 'Task ID and isActive required' },
          { status: 400 }
        );
      }

      const task = await toggleScheduledTask(taskId, isActive);
      return NextResponse.json(task);
    }

    // Create new task
    const { name, description, taskType, schedule, timezone, config } = body as {
      name: string;
      description?: string;
      taskType: TaskType;
      schedule: string;
      timezone?: string;
      config?: TaskConfig;
    };

    if (!name || !taskType || !schedule) {
      return NextResponse.json(
        { error: 'Name, task type, and schedule are required' },
        { status: 400 }
      );
    }

    const task = await createScheduledTask({
      name,
      description,
      taskType,
      schedule,
      timezone,
      config,
      createdBy: session.user.id,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error with task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    );
  }
}
