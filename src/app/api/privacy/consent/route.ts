import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserConsents,
  updateConsents,
  getConsentPolicies,
  needsReconsent,
  type ConsentType,
} from '@/lib/privacy/consent';

// GET: Get user's consents and policy info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [consents, policies, needsUpdate] = await Promise.all([
      getUserConsents(session.user.id),
      getConsentPolicies(),
      needsReconsent(session.user.id),
    ]);

    return NextResponse.json({
      consents,
      policies,
      needsReconsent: needsUpdate,
    });
  } catch (error) {
    console.error('Error fetching consents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consents' },
      { status: 500 }
    );
  }
}

// POST: Update consents
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consents } = body as {
      consents: Record<ConsentType, boolean>;
    };

    if (!consents || typeof consents !== 'object') {
      return NextResponse.json(
        { error: 'Consents object required' },
        { status: 400 }
      );
    }

    // Get request info for audit
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const updated = await updateConsents(session.user.id, consents, {
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error updating consents:', error);
    return NextResponse.json(
      { error: 'Failed to update consents' },
      { status: 500 }
    );
  }
}
