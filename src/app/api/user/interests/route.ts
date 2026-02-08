// User interest profile API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getInterestProfile,
  updateInterestProfile,
  recalculateProfile,
  getTopCategories,
} from '@/lib/recommendations/interests';

// GET - Get user's interest profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [profile, topCategories] = await Promise.all([
      getInterestProfile(session.user.id),
      getTopCategories(session.user.id, 5),
    ]);

    return NextResponse.json({
      profile,
      topCategories,
    });
  } catch (error) {
    console.error('Error getting interests:', error);
    return NextResponse.json({ error: 'Failed to get interests' }, { status: 500 });
  }
}

// PUT - Update user's interest preferences
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();

    await updateInterestProfile(session.user.id, updates);

    return NextResponse.json({ message: 'Preferences updated' });
  } catch (error) {
    console.error('Error updating interests:', error);
    return NextResponse.json({ error: 'Failed to update interests' }, { status: 500 });
  }
}

// POST - Recalculate profile from history
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await recalculateProfile(session.user.id);
    const profile = await getInterestProfile(session.user.id);

    return NextResponse.json({
      message: 'Profile recalculated',
      profile,
    });
  } catch (error) {
    console.error('Error recalculating profile:', error);
    return NextResponse.json({ error: 'Failed to recalculate profile' }, { status: 500 });
  }
}
