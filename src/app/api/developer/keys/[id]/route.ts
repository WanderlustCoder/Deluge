// API key detail routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revokeApiKey, getApiKeyStats } from '@/lib/api/keys';

// GET - Get API key details and stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const key = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        rateLimit: true,
        status: true,
        lastUsedAt: true,
        usageCount: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const stats = await getApiKeyStats(id);

    return NextResponse.json({ key, stats });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Failed to fetch API key' }, { status: 500 });
  }
}

// DELETE - Revoke API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await revokeApiKey(id, session.user.id, 'User revoked');
    return NextResponse.json({ message: 'API key revoked' });
  } catch (error) {
    if (error instanceof Error && error.message === 'API key not found') {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    console.error('Error revoking API key:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
