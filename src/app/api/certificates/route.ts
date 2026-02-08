/**
 * Impact Certificates API
 * Plan 27: Blockchain Transparency Ledger
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserCertificates,
  getCertificateStats,
  toggleCertificateVisibility,
} from '@/lib/blockchain/certificates';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [certificates, stats] = await Promise.all([
      getUserCertificates(session.user.id),
      getCertificateStats(session.user.id),
    ]);

    return NextResponse.json({ certificates, stats });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { certificateId, isPublic } = body;

    if (!certificateId || typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'certificateId and isPublic are required' },
        { status: 400 }
      );
    }

    const updated = await toggleCertificateVisibility(
      certificateId,
      session.user.id,
      isPublic
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Certificate not found or not owned by user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}
