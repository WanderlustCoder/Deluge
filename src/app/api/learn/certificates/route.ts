// GET /api/learn/certificates - User's certificates

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserCertificates,
  getAvailableCertificates,
  CERTIFICATE_TOPICS,
} from '@/lib/learning/certificates';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [certificates, available] = await Promise.all([
      getUserCertificates(session.user.id),
      getAvailableCertificates(session.user.id),
    ]);

    return NextResponse.json({
      certificates,
      available,
      topics: CERTIFICATE_TOPICS,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}
