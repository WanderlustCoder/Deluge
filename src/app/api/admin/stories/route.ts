// GET /api/admin/stories - List all stories for admin

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const stories = await prisma.impactStory.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
