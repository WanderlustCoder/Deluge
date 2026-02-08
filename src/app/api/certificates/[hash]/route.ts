/**
 * Public Certificate View API
 * Plan 27: Blockchain Transparency Ledger
 */

import { NextResponse } from 'next/server';
import { getCertificateByHash } from '@/lib/blockchain/certificates';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;

    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid certificate hash' },
        { status: 400 }
      );
    }

    const certificate = await getCertificateByHash(hash);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Only return public certificates
    if (!certificate.isPublic) {
      return NextResponse.json(
        { error: 'Certificate is private' },
        { status: 403 }
      );
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}
