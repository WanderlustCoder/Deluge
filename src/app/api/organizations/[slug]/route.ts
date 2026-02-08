import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOrganizationBySlug,
  updateOrganization,
  checkMemberPermission,
  getOrganizationStats,
} from '@/lib/organizations';

// GET /api/organizations/[slug] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get stats
    const stats = await getOrganizationStats(organization.id);

    return NextResponse.json({
      organization: {
        ...organization,
        address: organization.address ? JSON.parse(organization.address) : null,
        focusAreas: organization.focusAreas ? JSON.parse(organization.focusAreas) : [],
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[slug] - Update organization
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

    // Check permission (admin or org admin)
    const isAdmin = session.user.accountType === 'admin';
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'admin'
    );

    if (!isAdmin && !hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      legalName,
      ein,
      mission,
      description,
      website,
      email,
      phone,
      logoUrl,
      coverImageUrl,
      address,
      focusAreas,
      geographicScope,
      foundedYear,
      annualBudget,
      employeeCount,
    } = body;

    const updated = await updateOrganization(organization.id, {
      name,
      legalName,
      ein,
      mission,
      description,
      website,
      email,
      phone,
      logoUrl,
      coverImageUrl,
      address,
      focusAreas,
      geographicScope,
      foundedYear,
      annualBudget,
      employeeCount,
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
