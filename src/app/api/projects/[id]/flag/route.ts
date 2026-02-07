import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  submitProjectFlag,
  getProjectFlags,
  FlagType,
  FlagSeverity,
} from '@/lib/verification/fraud-detection';

// GET /api/projects/[id]/flag - Get flags for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view flags
    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: projectId } = await params;
    const flags = await getProjectFlags(projectId);

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/flag - Submit a flag for a project
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
    const { type, severity, description, evidence } = body;

    // Validate type
    const validTypes: FlagType[] = ['duplicate', 'suspicious_funding', 'unresponsive', 'misuse', 'fraud'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid flag type' },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities: FlagSeverity[] = ['low', 'medium', 'high', 'critical'];
    if (!severity || !validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    const flag = await submitProjectFlag({
      projectId,
      type,
      severity,
      description: description.trim(),
      evidence,
      reportedBy: session.user.id,
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error submitting flag:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit flag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
