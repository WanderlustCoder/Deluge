import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isCorporateAdmin, getCorporateAccount } from '@/lib/corporate';
import { createInvite, createBulkInvites, listPendingInvites, revokeInvite, resendInvite } from '@/lib/corporate-invites';

// GET /api/corporate/[slug]/invite - List pending invites
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

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const invites = await listPendingInvites(account.id);

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error listing invites:', error);
    return NextResponse.json(
      { error: 'Failed to list invites' },
      { status: 500 }
    );
  }
}

// POST /api/corporate/[slug]/invite - Create invite(s)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { email, emails, expiresInDays } = body;

    if (!email && (!emails || !Array.isArray(emails))) {
      return NextResponse.json(
        { error: 'Email or emails array is required' },
        { status: 400 }
      );
    }

    if (emails && Array.isArray(emails)) {
      // Bulk invite
      const invites = await createBulkInvites(account.id, emails, expiresInDays);
      return NextResponse.json({ success: true, invites, count: invites.length });
    } else {
      // Single invite
      const invite = await createInvite(account.id, email, expiresInDays);
      return NextResponse.json({ success: true, invite });
    }
  } catch (error) {
    console.error('Error creating invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to create invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/corporate/[slug]/invite - Resend invite
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

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { inviteId, expiresInDays } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    const invite = await resendInvite(inviteId, expiresInDays);

    return NextResponse.json({ success: true, invite });
  } catch (error) {
    console.error('Error resending invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to resend invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/corporate/[slug]/invite - Revoke invite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    await revokeInvite(inviteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    const message = error instanceof Error ? error.message : 'Failed to revoke invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
