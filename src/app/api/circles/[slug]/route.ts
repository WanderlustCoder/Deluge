import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCircleBySlug, updateCircle, isCircleAdmin, getCircleStats } from '@/lib/circles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const circle = await getCircleBySlug(slug);

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Check if private and user is member
    if (circle.isPrivate) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
      }

      const isMember = circle.members.some((m) => m.userId === session.user.id);
      if (!isMember) {
        return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
      }
    }

    const stats = await getCircleStats(circle.id);

    return NextResponse.json({
      circle: {
        ...circle,
        focusCategories: circle.focusCategories
          ? JSON.parse(circle.focusCategories)
          : [],
        focusCommunities: circle.focusCommunities
          ? JSON.parse(circle.focusCommunities)
          : [],
      },
      stats,
    });
  } catch (error) {
    console.error('Failed to get circle:', error);
    return NextResponse.json(
      { error: 'Failed to get circle' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const circle = await getCircleBySlug(slug);

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    // Verify admin access
    if (!(await isCircleAdmin(circle.id, session.user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const updated = await updateCircle(circle.id, {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      isPrivate: body.isPrivate,
      memberLimit: body.memberLimit,
      minContribution: body.minContribution,
      votingThreshold: body.votingThreshold,
      votingPeriod: body.votingPeriod,
      focusCategories: body.focusCategories,
      focusCommunities: body.focusCommunities,
      status: body.status,
    });

    return NextResponse.json({ circle: updated });
  } catch (error) {
    console.error('Failed to update circle:', error);
    return NextResponse.json(
      { error: 'Failed to update circle' },
      { status: 500 }
    );
  }
}
