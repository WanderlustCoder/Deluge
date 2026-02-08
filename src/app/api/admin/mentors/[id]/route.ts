// POST/DELETE /api/admin/mentors/[id] - Approve or reject mentor application

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { approveMentor, rejectMentor } from '@/lib/mentorship';

// POST - Approve mentor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const mentor = await approveMentor(id, session.user.id);
    return NextResponse.json({
      ...mentor,
      expertise: JSON.parse(mentor.expertise),
      languages: JSON.parse(mentor.languages),
    });
  } catch (error) {
    console.error('Error approving mentor:', error);
    return NextResponse.json({ error: 'Failed to approve mentor' }, { status: 500 });
  }
}

// DELETE - Reject mentor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await rejectMentor(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    return NextResponse.json({ error: 'Failed to reject mentor' }, { status: 500 });
  }
}
