import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getProjectVerificationSummary,
  submitVerificationCheck,
  getOrCreateProjectVerification,
} from '@/lib/verification';
import { CheckType } from '@/lib/verification/checks';

// GET /api/projects/[id]/verification - Get verification status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const summary = await getProjectVerificationSummary(projectId);

    if (!summary) {
      // Create a new verification record
      await getOrCreateProjectVerification(projectId);
      const newSummary = await getProjectVerificationSummary(projectId);
      return NextResponse.json(newSummary);
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/verification - Submit verification check
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { checkType, evidence } = body;

    if (!checkType || !['identity', 'documents', 'location', 'organization', 'outcome'].includes(checkType)) {
      return NextResponse.json(
        { error: 'Invalid check type' },
        { status: 400 }
      );
    }

    const check = await submitVerificationCheck(
      projectId,
      checkType as CheckType,
      evidence || {}
    );

    return NextResponse.json(check);
  } catch (error) {
    console.error('Error submitting verification check:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit verification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
