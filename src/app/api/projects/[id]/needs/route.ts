import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createProjectNeed,
  getProjectNeeds,
  updateProjectNeed,
  deleteProjectNeed,
  NEED_TYPES,
} from '@/lib/in-kind';

// GET /api/projects/[id]/needs - Get project needs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeFulfilled = searchParams.get('includeFulfilled') === 'true';

    const needs = await getProjectNeeds(id, includeFulfilled);

    return NextResponse.json({
      needs,
      types: NEED_TYPES,
    });
  } catch (error) {
    console.error('Error fetching needs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch needs' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/needs - Create project need
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, description, quantity, estimatedValue } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      );
    }

    const need = await createProjectNeed(id, {
      type,
      description,
      quantity,
      estimatedValue,
    });

    return NextResponse.json({ success: true, need });
  } catch (error) {
    console.error('Error creating need:', error);
    const message = error instanceof Error ? error.message : 'Failed to create need';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/projects/[id]/needs - Update project need
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { needId, ...updates } = body;

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    const need = await updateProjectNeed(needId, updates);

    return NextResponse.json({ success: true, need });
  } catch (error) {
    console.error('Error updating need:', error);
    const message = error instanceof Error ? error.message : 'Failed to update need';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/needs - Delete project need
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const needId = searchParams.get('needId');

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    await deleteProjectNeed(needId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting need:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete need';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
