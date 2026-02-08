// GET/PATCH /api/grants/applications/[id] - Get or update an application

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getApplicationById,
  submitApplication,
  withdrawApplication,
  updateApplicationStatus,
} from '@/lib/grants/applications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check access - applicant, program reviewer, or admin
    if (
      application.applicantId !== session.user.id &&
      session.user.accountType !== 'admin'
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    // Applicant actions
    if (application.applicantId === session.user.id) {
      if (action === 'submit' && application.status === 'draft') {
        const updated = await submitApplication(id);
        return NextResponse.json({ application: updated });
      }

      if (action === 'withdraw' && ['draft', 'submitted'].includes(application.status)) {
        const updated = await withdrawApplication(id);
        return NextResponse.json({ application: updated });
      }
    }

    // Admin/reviewer actions
    if (session.user.accountType === 'admin') {
      if (action === 'start_review' && application.status === 'submitted') {
        const updated = await updateApplicationStatus(id, 'under_review');
        return NextResponse.json({ application: updated });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
