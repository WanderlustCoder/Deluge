/**
 * Admin Blockchain Anchors API
 * Plan 27: Blockchain Transparency Ledger
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anchors = await prisma.transparencyAnchor.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ anchors });
  } catch (error) {
    console.error('Error fetching anchors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anchors' },
      { status: 500 }
    );
  }
}
