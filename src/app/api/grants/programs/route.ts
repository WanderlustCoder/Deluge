// GET/POST /api/grants/programs - List and create grant programs

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listGrantPrograms, createGrantProgram } from '@/lib/grants/programs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const funderId = searchParams.get('funderId') || undefined;
  const isPublic = searchParams.get('public') === 'true' ? true : undefined;

  try {
    const programs = await listGrantPrograms({ status, funderId, isPublic });
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
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
      name,
      slug,
      description,
      funderType,
      totalBudget,
      minGrant,
      maxGrant,
      categories,
      focusAreas,
      geographicFocus,
      applicationStart,
      applicationEnd,
      reviewStart,
      awardDate,
      reportingRequired,
      reportingFrequency,
      isPublic,
    } = body;

    if (!name || !slug || !description || !totalBudget || !applicationStart || !applicationEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const program = await createGrantProgram({
      name,
      slug,
      description,
      funderId: session.user.id,
      funderType: funderType || 'individual',
      totalBudget,
      minGrant,
      maxGrant,
      categories,
      focusAreas,
      geographicFocus,
      applicationStart: new Date(applicationStart),
      applicationEnd: new Date(applicationEnd),
      reviewStart: reviewStart ? new Date(reviewStart) : undefined,
      awardDate: awardDate ? new Date(awardDate) : undefined,
      reportingRequired,
      reportingFrequency,
      isPublic,
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}
