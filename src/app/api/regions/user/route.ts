import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserRegion, setUserRegion, getRegion } from '@/lib/regions';
import { detectUserRegion } from '@/lib/regions/detection';

// GET: Get user's region
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRegion = await getUserRegion(session.user.id);
    const regionInfo = await getRegion(userRegion.regionCode);

    return NextResponse.json({
      ...userRegion,
      regionInfo,
    });
  } catch (error) {
    console.error('Error fetching user region:', error);
    return NextResponse.json(
      { error: 'Failed to fetch region' },
      { status: 500 }
    );
  }
}

// PUT: Update user's region
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { regionCode, confirm, override } = body;

    if (!regionCode) {
      return NextResponse.json(
        { error: 'Region code is required' },
        { status: 400 }
      );
    }

    // Validate region exists
    const region = await getRegion(regionCode);
    if (!region) {
      return NextResponse.json(
        { error: 'Invalid region code' },
        { status: 400 }
      );
    }

    const updated = await setUserRegion(session.user.id, regionCode, {
      confirmed: confirm === true,
      override: override === true,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user region:', error);
    return NextResponse.json(
      { error: 'Failed to update region' },
      { status: 500 }
    );
  }
}

// POST: Detect and set user's region
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { timezone } = body;

    // Detect region from request
    const headers = new Headers(request.headers);
    const detected = await detectUserRegion(headers, timezone);

    // Save detected region
    await setUserRegion(session.user.id, detected.regionCode, {
      detected: true,
      confirmed: false,
    });

    const regionInfo = await getRegion(detected.regionCode);

    return NextResponse.json({
      detected,
      regionInfo,
    });
  } catch (error) {
    console.error('Error detecting region:', error);
    return NextResponse.json(
      { error: 'Failed to detect region' },
      { status: 500 }
    );
  }
}
