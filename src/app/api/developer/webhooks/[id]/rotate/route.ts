// Rotate webhook secret

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rotateWebhookSecret } from '@/lib/api/webhooks';

// POST - Rotate webhook secret
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const newSecret = await rotateWebhookSecret(id, session.user.id);

    return NextResponse.json({
      secret: newSecret,
      message: 'Secret rotated. Save this secret - it will not be shown again.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Webhook not found') {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    console.error('Error rotating webhook secret:', error);
    return NextResponse.json({ error: 'Failed to rotate secret' }, { status: 500 });
  }
}
