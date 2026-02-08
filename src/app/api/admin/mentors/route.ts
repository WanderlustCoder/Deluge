// GET /api/admin/mentors - List pending mentor applications

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingMentorApplications } from '@/lib/mentorship';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const applications = await getPendingMentorApplications();

    // Parse JSON fields
    const formatted = applications.map(app => ({
      ...app,
      expertise: JSON.parse(app.expertise),
      languages: JSON.parse(app.languages),
    }));

    return NextResponse.json({ applications: formatted });
  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
