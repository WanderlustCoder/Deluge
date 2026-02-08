import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Bulk notification actions
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids, olderThanDays } = body;

    switch (action) {
      case 'markAllRead':
        await prisma.notification.updateMany({
          where: { userId: session.user.id, read: false },
          data: { read: true },
        });
        return NextResponse.json({ success: true, action: 'markAllRead' });

      case 'deleteOld': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (olderThanDays || 30));
        const deleted = await prisma.notification.deleteMany({
          where: {
            userId: session.user.id,
            createdAt: { lt: cutoff },
            read: true,
          },
        });
        return NextResponse.json({
          success: true,
          action: 'deleteOld',
          deleted: deleted.count,
        });
      }

      case 'markSelectedRead':
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { error: 'IDs are required for this action' },
            { status: 400 }
          );
        }
        await prisma.notification.updateMany({
          where: {
            id: { in: ids },
            userId: session.user.id,
          },
          data: { read: true },
        });
        return NextResponse.json({
          success: true,
          action: 'markSelectedRead',
          count: ids.length,
        });

      case 'deleteSelected':
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { error: 'IDs are required for this action' },
            { status: 400 }
          );
        }
        await prisma.notification.deleteMany({
          where: {
            id: { in: ids },
            userId: session.user.id,
          },
        });
        return NextResponse.json({
          success: true,
          action: 'deleteSelected',
          count: ids.length,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error with bulk notification action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
