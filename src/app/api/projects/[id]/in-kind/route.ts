import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  offerInKindDonation,
  getProjectInKindDonations,
  updateDonationStatus,
  getProjectInKindStats,
  IN_KIND_TYPES,
  formatDonationForDisplay,
} from '@/lib/in-kind';

// GET /api/projects/[id]/in-kind - Get in-kind donations for project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [donations, stats] = await Promise.all([
      getProjectInKindDonations(id),
      getProjectInKindStats(id),
    ]);

    return NextResponse.json({
      donations: donations.map(formatDonationForDisplay),
      stats,
      types: IN_KIND_TYPES,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/in-kind - Offer in-kind donation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, description, value, notes } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      );
    }

    const donation = await offerInKindDonation(id, session.user.id, {
      type,
      description,
      value,
      notes,
    });

    return NextResponse.json({
      success: true,
      donation: formatDonationForDisplay(donation),
    });
  } catch (error) {
    console.error('Error offering donation:', error);
    const message = error instanceof Error ? error.message : 'Failed to offer donation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/projects/[id]/in-kind - Update donation status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { donationId, status, notes } = body;

    if (!donationId || !status) {
      return NextResponse.json(
        { error: 'Donation ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['accepted', 'received', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const donation = await updateDonationStatus(donationId, status, notes);

    return NextResponse.json({
      success: true,
      donation: formatDonationForDisplay(donation),
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    const message = error instanceof Error ? error.message : 'Failed to update donation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
