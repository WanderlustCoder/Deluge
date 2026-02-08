// GET/POST /api/grants/applications - List and create grant applications

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveApplicationDraft, getUserApplications } from '@/lib/grants/applications';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const applications = await getUserApplications(session.user.id);
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      programId,
      projectTitle,
      projectSummary,
      requestedAmount,
      impactStatement,
      proposedBudget,
      timeline,
      teamMembers,
      measurableOutcomes,
      attachments,
      answers,
    } = body;

    if (!programId || !projectTitle || !projectSummary || !requestedAmount || !impactStatement) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await saveApplicationDraft({
      programId,
      applicantId: session.user.id,
      projectTitle,
      projectSummary,
      requestedAmount,
      impactStatement,
      proposedBudget,
      timeline,
      teamMembers,
      measurableOutcomes,
      attachments,
      answers,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}
