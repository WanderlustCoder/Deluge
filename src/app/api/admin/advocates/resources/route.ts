import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listResources, createResource, updateResource, deleteResource } from '@/lib/advocates/resources';

// GET - List all resources (admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resources = await listResources();
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to list resources:', error);
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    );
  }
}

// POST - Create resource (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, category, fileUrl, content } = body;

    if (!title || !type || !category) {
      return NextResponse.json(
        { error: 'Title, type, and category are required' },
        { status: 400 }
      );
    }

    const resource = await createResource({
      title,
      description,
      type,
      category,
      fileUrl,
      content,
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

// PUT - Update resource (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const resource = await updateResource(id, data);
    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE - Delete resource (admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    await deleteResource(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
