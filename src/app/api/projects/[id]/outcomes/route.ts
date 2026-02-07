import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getProjectOutcomes,
  submitOutcome,
  OutcomeType,
} from '@/lib/verification/outcomes';

// GET /api/projects/[id]/outcomes - Get outcomes for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const outcomes = await getProjectOutcomes(projectId);

    return NextResponse.json({ outcomes });
  } catch (error) {
    console.error('Error fetching outcomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outcomes' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/outcomes - Submit an outcome
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
    const { outcomeType, description, targetValue, actualValue, evidence } = body;

    // Validate outcome type
    const validTypes: OutcomeType[] = ['completion', 'impact_metric', 'milestone'];
    if (!outcomeType || !validTypes.includes(outcomeType)) {
      return NextResponse.json(
        { error: 'Invalid outcome type' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if user is authorized (project proposer or admin)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        proposal: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isProposer = project.proposal?.proposerId === session.user.id;
    const isAdmin = session.user.accountType === 'admin';

    if (!isProposer && !isAdmin) {
      return NextResponse.json(
        { error: 'Only project proposers can submit outcomes' },
        { status: 403 }
      );
    }

    const outcome = await submitOutcome({
      projectId,
      outcomeType,
      description: description.trim(),
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      actualValue: actualValue ? parseFloat(actualValue) : undefined,
      evidence,
    });

    return NextResponse.json(outcome);
  } catch (error) {
    console.error('Error submitting outcome:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit outcome';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
