// GET/PATCH /api/grants/programs/[slug] - Get or update a grant program

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGrantProgramBySlug, updateProgramStatus } from '@/lib/grants/programs';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const program = await getGrantProgramBySlug(slug);

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const program = await prisma.grantProgram.findUnique({
      where: { slug },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (program.funderId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();

    // If just updating status
    if (body.status && Object.keys(body).length === 1) {
      const updated = await updateProgramStatus(program.id, body.status);
      return NextResponse.json({ program: updated });
    }

    // Full update
    const updated = await prisma.grantProgram.update({
      where: { id: program.id },
      data: {
        name: body.name,
        description: body.description,
        minGrant: body.minGrant,
        maxGrant: body.maxGrant,
        categories: body.categories ? JSON.stringify(body.categories) : undefined,
        focusAreas: body.focusAreas ? JSON.stringify(body.focusAreas) : undefined,
        geographicFocus: body.geographicFocus ? JSON.stringify(body.geographicFocus) : undefined,
        applicationStart: body.applicationStart ? new Date(body.applicationStart) : undefined,
        applicationEnd: body.applicationEnd ? new Date(body.applicationEnd) : undefined,
        reviewStart: body.reviewStart ? new Date(body.reviewStart) : undefined,
        awardDate: body.awardDate ? new Date(body.awardDate) : undefined,
        isPublic: body.isPublic,
        status: body.status,
      },
    });

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
  }
}
