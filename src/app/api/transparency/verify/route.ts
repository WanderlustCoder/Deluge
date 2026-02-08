/**
 * Transparency Verification API
 * Plan 27: Blockchain Transparency Ledger
 */

import { NextResponse } from 'next/server';
import { getVerificationDetails, recordProofAccess } from '@/lib/blockchain/verification';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash parameter is required' },
        { status: 400 }
      );
    }

    // Validate hash format (SHA-256 = 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format' },
        { status: 400 }
      );
    }

    const details = await getVerificationDetails(hash);

    // Record access if record exists
    if (details.record) {
      await recordProofAccess(details.record.id);
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error verifying record:', error);
    return NextResponse.json(
      { error: 'Failed to verify record' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    // Validate hash format
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format' },
        { status: 400 }
      );
    }

    const details = await getVerificationDetails(hash);

    // Record access
    if (details.record) {
      await recordProofAccess(details.record.id);
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error verifying record:', error);
    return NextResponse.json(
      { error: 'Failed to verify record' },
      { status: 500 }
    );
  }
}
