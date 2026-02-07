import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCorporateAccount, updateCorporateAccount, isCorporateAdmin } from '@/lib/corporate';

// GET /api/corporate/[slug] - Get corporate account
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const account = await getCorporateAccount(slug);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check access: platform admin or corporate admin
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching corporate account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PATCH /api/corporate/[slug] - Update corporate account
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access: platform admin or corporate admin
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Corporate admins can only update certain fields
    const allowedFields = isCorpAdmin && !isPlatformAdmin
      ? ['logoUrl', 'primaryColor', 'secondaryColor', 'billingEmail']
      : Object.keys(body);

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    const account = await updateCorporateAccount(slug, updates);

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error updating corporate account:', error);
    const message = error instanceof Error ? error.message : 'Failed to update account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
