// PATCH /api/admin/stories/[id] - Update story status

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { action } = await request.json();

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'publish':
        updateData = { status: 'published', publishedAt: new Date() };
        break;
      case 'reject':
        updateData = { status: 'rejected' };
        break;
      case 'feature':
        updateData = { featured: true };
        break;
      case 'unfeature':
        updateData = { featured: false };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const story = await prisma.impactStory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.impactStory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
