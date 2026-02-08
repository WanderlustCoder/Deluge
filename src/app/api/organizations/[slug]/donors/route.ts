import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrganizationBySlug, checkMemberPermission } from '@/lib/organizations';
import { listDonors, getDonorSegmentSummary, updateDonor } from '@/lib/organizations/donors';

// GET /api/organizations/[slug]/donors - List donors
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check permission (admin role to view donor details)
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'admin'
    );

    if (!hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') as 'major_donor' | 'recurring' | 'lapsed' | 'new' | null;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') as 'total' | 'recent' | 'count' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const view = searchParams.get('view');
    if (view === 'segments') {
      const segments = await getDonorSegmentSummary(organization.id);
      return NextResponse.json({ segments });
    }

    const result = await listDonors({
      organizationId: organization.id,
      segment: segment || undefined,
      search,
      sortBy: sortBy || 'total',
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[slug]/donors - Update donor
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
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check permission
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'admin'
    );

    if (!hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { donorId, notes, tags, externalId } = body;

    if (!donorId) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

    const donor = await updateDonor(donorId, { notes, tags, externalId });

    return NextResponse.json({
      success: true,
      donor,
      message: 'Donor updated successfully',
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    return NextResponse.json(
      { error: 'Failed to update donor' },
      { status: 500 }
    );
  }
}
