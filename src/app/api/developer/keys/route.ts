// API key management routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createApiKey, getUserApiKeys, ApiScope } from '@/lib/api/keys';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(['read', 'write', 'webhooks', 'oauth'])).min(1),
  rateLimit: z.number().min(100).max(10000).optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
});

// GET - List user's API keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = await getUserApiKeys(session.user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createKeySchema.parse(body);

    // Limit number of API keys per user
    const existingCount = await prisma.apiKey.count({
      where: { userId: session.user.id, status: 'active' },
    });

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 active API keys allowed' },
        { status: 400 }
      );
    }

    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const key = await createApiKey({
      userId: session.user.id,
      name: data.name,
      scopes: data.scopes as ApiScope[],
      rateLimit: data.rateLimit,
      expiresAt,
    });

    return NextResponse.json({
      key,
      message: 'API key created. Save this key - it will not be shown again.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
