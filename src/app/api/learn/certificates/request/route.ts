// POST /api/learn/certificates/request - Request a certificate

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requestCertificate } from '@/lib/learning/certificates';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    }

    const certificate = await requestCertificate(session.user.id, topic);

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error requesting certificate:', error);
    const message = error instanceof Error ? error.message : 'Failed to request certificate';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
