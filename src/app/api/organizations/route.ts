import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrganization, listOrganizations, getUserOrganizations } from '@/lib/organizations';

// GET /api/organizations - List organizations or get user's organizations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'mine' for user's orgs

    if (view === 'mine') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const organizations = await getUserOrganizations(session.user.id);
      return NextResponse.json({ organizations });
    }

    // Public listing (verified orgs only unless admin)
    const type = searchParams.get('type') as '501c3' | '501c4' | 'fiscal_sponsor' | 'other' | null;
    const geographicScope = searchParams.get('scope') as 'local' | 'regional' | 'national' | 'international' | null;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const isAdmin = session?.user?.accountType === 'admin';
    const verificationStatus = isAdmin
      ? (searchParams.get('status') as 'pending' | 'verified' | 'rejected' | null)
      : 'verified';

    const result = await listOrganizations({
      type: type || undefined,
      verificationStatus: verificationStatus || undefined,
      geographicScope: geographicScope || undefined,
      search,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      legalName,
      ein,
      type,
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

    // Validation
    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json(
        { error: 'Organization name is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    if (!type || !['501c3', '501c4', 'fiscal_sponsor', 'other'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid organization type is required' },
        { status: 400 }
      );
    }

    if (!mission || typeof mission !== 'string' || mission.length < 10) {
      return NextResponse.json(
        { error: 'Mission statement is required (minimum 10 characters)' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const organization = await createOrganization({
      name,
      legalName,
      ein,
      type,
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
      createdById: session.user.id,
    });

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
